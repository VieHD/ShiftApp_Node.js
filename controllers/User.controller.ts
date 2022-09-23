import { Request, Response } from "express";
import config, { IConfig } from 'config';
import jwt from 'jwt-promisify';
import nodemailer from 'nodemailer';
import { getLocalURL } from '../utils/url';

import { ERRORS } from "../const/errors";

//Models
import { User, userType } from "../models/user.model";

//Services
import MailerService from "../services/Mailer.service";

//Types
import { Config } from "../types";
import { DefaultError } from "../utils/defaultError";

const { JWT_SECRET, JWT_EXPIRY_TIME } = config as Config & IConfig;

export default class UserController {

    static async register(req: Request, res: Response) {
        try {
            const newUser = new User(req.body);
            const { _id, permission } = await newUser.save();
            const generatedJwt = await jwt.sign({ _id, permission }, JWT_SECRET, { expiresIn: JWT_EXPIRY_TIME });
            res
                .status(201)
                .cookie("token", generatedJwt)
                .json({
                    _id,
                    token: generatedJwt
                })

            MailerService.registerMessage(req.body.email, req.body.username);

        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('E11000')) {
                    return res
                        .status(409)
                        .send(DefaultError.generate(409, error.message))
                }

                if (error.message.includes('User validation failed')) {
                    return res
                        .status(400)
                        .send(DefaultError.generate(400, ERRORS.MONGO.DUPLICATE_USERNAME))
                }
                return res
                    .status(500)
                    .send(DefaultError.generate(500, error.message))
            }
            else {
                return res
                .status(500)
                .send(DefaultError.generate(500, error))
            }
        }
    }

    static async login(req: Request, res: Response) {
        const { email, password } = req.body;
        try {
            const matchingUser = await User.findOne({ email });

            if (!matchingUser || !(await matchingUser.authenticate(password))) {
                res
                    .status(400)
                    .send(DefaultError.generate(400, ERRORS.MONGO.BAD_LOGIN))
                    
                return;
            }

            const generatedJwt = await jwt.sign({
                _id: matchingUser._id,
                permission: matchingUser.permission
            }, JWT_SECRET, { expiresIn: JWT_EXPIRY_TIME });

            res
                .status(200)
                .cookie("token", generatedJwt)
                .send({
                    _id: matchingUser._id,
                    token: generatedJwt
                });
        } catch (error) {
            if (error instanceof Error) {
            return res
                .status(500)
                .send(DefaultError.generate(500, error.message))
            }
            else {
                return res
                .status(500)
                .send(DefaultError.generate(500, error))
            }
        }
    }

    static async triggerResetPassword(req: Request, res: Response) {
        const resetURL = `${getLocalURL(req)}/api/user/resetPassword/`;
        const { email: resetEmail } = req.body;
        try {

            const userToReset = await User.findOne({ email: resetEmail });
            const authUserToReset = await User.findById(userToReset?._id);
            if (authUserToReset) {
                authUserToReset.generateResetPasswordToken();
                await MailerService.forgotPasswordMessage(resetEmail, { resetText: "Click Here!", resetURL: `${resetURL}${authUserToReset.resetPasswordToken}` });
            }

        } catch (error) {
            if (error instanceof Error) {
                res
                    .status(500)
                    .send(DefaultError.generate(500, error.message))
                }
                else {
                    return res
                    .status(500)
                    .send(DefaultError.generate(500, error))
                }
        } finally {
            res
                .status(200)
                .send(DefaultError.generate(200, ERRORS.MONGO.EMAIL_SENT))
        }
    }

    static async resetPasswordLanding(req: Request, res: Response) {
        const isResetTokenValid = await User.findOne({
            resetPasswordToken: req.params.resetToken,
            resetPasswordTokenExpiryDate: { "$gte": Date.now() }
        });

        if (!isResetTokenValid) {
            return res.status(400).send(DefaultError.generate(400, ERRORS.MONGO.THE_RESET_LINK_NOT_VALID))
        }

        res.send(`
            <html>
                <form method="post">
                    <label>Password</label><input name="newPassword">
                    <button>Reset Password</button>
                </form>
            </html>
        `)
    }

    static async resetPassword(req: Request, res: Response) {
        const userToReset = await User.findOne({
            resetPasswordToken: req.params.resetToken,
            resetPasswordTokenExpiryDate: { "$gte": Date.now() }
        });

        if (!userToReset) {
            return res.status(400).send(DefaultError.generate(400, ERRORS.MONGO.THE_RESET_LINK_NOT_VALID))
        }

        try {
            userToReset.password = req.body.newPassword;
            await userToReset.save();
        } catch (error) {
            res.status(400).send(DefaultError.generate(400, error))
        }
    }

    static async getUserById(req: Request, res: Response) {
        try {
          const { id } = req.params;
          const displayUser = await User.findById(id).select('-active');
          
          if (displayUser === null) {
            return res.status(404).send(DefaultError.generate(404 , ERRORS.MONGO.USER_NOT_FOUND))
          }

          res.send(displayUser);
        } catch (error) {
            return res
            .status(500)
            .send(DefaultError.generate(500, error))
        }
      }

    static async getAllUsers(req: Request, res: Response) {
        try {
          res.send(await User.find(
                {
                    active: true,
                },
              ).select('-active'));
          } catch (error) {
            return res
                .status(500)
                .send(DefaultError.generate(500, error))
          }
        
      }

    static async updateUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userToUpdate = await User.findById(id).select('-active');

            if (userToUpdate === null) {
                return res.status(404).send(DefaultError.generate(404 , ERRORS.MONGO.USER_NOT_FOUND))
            }

            const password = req.body.password;
            delete req.body.password;
            userToUpdate.password = password;
            await userToUpdate.save();

              res
                .status(200)
                .send(<userType>userToUpdate);

        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('E11000')) {
                    return res
                        .status(409)
                        .send(DefaultError.generate(409, ERRORS.MONGO.DUPLICATE_USERNAME))
                }

                if (error.message.includes('User validation failed')) {
                    return res
                        .status(400)
                        .send(DefaultError.generate(400, error.message))
                }
                return res
                    .status(500)
                    .send(DefaultError.generate(500, error.message))
            }
            else {
                return res
                .status(500)
                .send(DefaultError.generate(500, error))
            }
      }}

    static async deleteUserById(req: Request, res: Response) {
        try {
          const { id } = req.params;
          const deletedUser = await User.findById(id).select('-active');
          await deletedUser?.update({active: false});

          if (deletedUser === null) {
            return res.status(404).send(DefaultError.generate(404 , ERRORS.MONGO.USER_NOT_FOUND))
          }

          res.send(deletedUser);
        } catch (error) {
            return res
            .status(500)
            .send(DefaultError.generate(500, error))
        }
      }


    static async logout() {

    }
}
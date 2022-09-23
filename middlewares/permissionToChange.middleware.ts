import { NextFunction, Response } from "express";

import { Permission, User } from "../models/user.model";
import { Shift } from "../models/shift.model";
import { Comment } from "../models/comment.model";
import { IExtendedRequest } from "../types/request";
import { DefaultError } from "../utils/defaultError";
import { ERRORS } from "../const/errors";



export const permissionToChangeUser = async (req: IExtendedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const updatedUser = await User.findById(id);

        const isUserAuthorizedToChange =
            updatedUser?._id == req.context?.user._id || req.context?.user.permission === Permission.Admin;

        if (!isUserAuthorizedToChange) {
            return res
                .status(403)
                .send(DefaultError.generate(403, ERRORS.MONGO.FORBIDDEN));
        }
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('Cast to ObjectId failed')){
                return res
                .status(404)
                .send(DefaultError.generate(404, ERRORS.MONGO.PAGE_NOT_FOUND))
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

    next();

}

export const permissionToChangeShift = async (req: IExtendedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const updatedShift = await Shift.findById(id);

        const isUserAuthorizedToChange =
            updatedShift?.createdBy == req.context?.user._id || req.context?.user.permission === Permission.Admin;

            if (!isUserAuthorizedToChange) {
                return res
                    .status(403)
                    .send(DefaultError.generate(403, ERRORS.MONGO.FORBIDDEN));
            }
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('Cast to ObjectId failed')){
                return res
                .status(404)
                .send(DefaultError.generate(404, ERRORS.MONGO.PAGE_NOT_FOUND))
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

    next();

}

export const permissionToChangeComments = async (req: IExtendedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const updatedShift = await Comment.findById(id);

        const isUserAuthorizedToChange =
            updatedShift?.createdBy == req.context?.user._id || req.context?.user.permission === Permission.Admin;

            if (!isUserAuthorizedToChange) {
                return res
                    .status(403)
                    .send(DefaultError.generate(403, ERRORS.MONGO.FORBIDDEN));
            }
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('Cast to ObjectId failed')){
                return res
                .status(404)
                .send(DefaultError.generate(404, ERRORS.MONGO.PAGE_NOT_FOUND))
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

    next();

}

export const adminPermission = async (req: IExtendedRequest, res: Response, next: NextFunction) => {
    try {

        const isUserAdmin =req.context?.user.permission === Permission.Admin;

        if (!isUserAdmin) {
            return res
                .status(403)
                .send(DefaultError.generate(403, ERRORS.MONGO.FORBIDDEN));
        }
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('Cast to ObjectId failed')){
                return res
                .status(404)
                .send(DefaultError.generate(404, ERRORS.MONGO.PAGE_NOT_FOUND))
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

    next();

}
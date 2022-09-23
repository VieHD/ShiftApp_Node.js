import { Response } from "express";
import { ObjectId } from "mongodb";


import { ERRORS } from "../const/errors";
import { Permission } from "../models/user.model";
import { IExtendedRequest } from "../types/request";
import { Comment } from "../models/comment.model";
import { DefaultError } from "../utils/defaultError";


export default class CommentController {

    static async createComment(req: IExtendedRequest, res: Response) {
        try {
          const userId = req.context?.user._id;
          const newComment = new Comment({ ...req.body, createdBy : userId });
          await newComment.save();
          res.send(newComment);
        } catch (error) {
          return res.status(500).send(DefaultError.generate(500, error))
        }
      }

    static async getAllComments(req: IExtendedRequest, res: Response) {
        try {
          if (req.context?.user.permission === Permission.User) {
            const userId = new ObjectId(req.context?.user._id);
            res.send(
              await Comment.find(
                {
                    createdBy: userId,
                    active: true,
                },
            ).select('-active'));
          } else {
            res.send(await Comment.find().select('-active'));
          }
        } catch (error) {
          return res.status(500).send(DefaultError.generate(500, error))
        }
      }

    static async getCommentById(req: IExtendedRequest, res: Response) {
        try {
          const { id } = req.params;
          const displayComment = await Comment.findById(id);

          if (displayComment === null) {
            return res.status(404).send(DefaultError.generate(404 , ERRORS.MONGO.COMMENT_NOT_FOUND))
          }

          res.send(displayComment);
        } catch (error) {
          return res.status(500).send(DefaultError.generate(500, error))
        }
      }

    static async updateCommentById(req: IExtendedRequest, res: Response) {
        try {
          const { id } = req.params;
          const updatedComment = await Comment.findByIdAndUpdate(id, req.body, {
            new: true,
          });

          if (updatedComment === null) {
            return res.status(404).send(DefaultError.generate(404 , ERRORS.MONGO.COMMENT_NOT_FOUND))
          }

          res.send(updatedComment);
        } catch (error) {
          return res.status(500).send(DefaultError.generate(500, error))
        }
      }

    static async deleteComment(req: IExtendedRequest, res: Response) {
        try {
          const { id } = req.params;
          const deletedComment = await Comment.findById(id).select('-active');
          await deletedComment?.update({active: false});

          if (deletedComment === null) {
            return res.status(404).send(DefaultError.generate(404 , ERRORS.MONGO.COMMENT_NOT_FOUND))
          }

          res.send(deletedComment);
        } catch (error) {
          return res.status(500).send(DefaultError.generate(500, error))
        }
      }
}
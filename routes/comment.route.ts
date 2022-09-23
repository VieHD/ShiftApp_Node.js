import { Router } from "express";

import { permissionToChangeComments } from '../middlewares/permissionToChange.middleware';
import CommentController from "../controllers/Comment.controller";

const router = Router();

router  
    .route('/')
    .post(CommentController.createComment)
    .get(CommentController.getAllComments)

router
    .route('/:id')
    .get([permissionToChangeComments, CommentController.getCommentById])
    .patch([permissionToChangeComments, CommentController.updateCommentById])
    .delete([permissionToChangeComments, CommentController.deleteComment])



export default router;
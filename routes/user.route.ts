import { Router } from "express";
import { permissionToChangeUser, adminPermission } from '../middlewares/permissionToChange.middleware';

import UserController from '../controllers/User.controller';
import { tokenGuard } from "../middlewares/tokenGuard.middleware";

const router = Router();


router
    .route('/')
    .post(UserController.register)
    .get([tokenGuard, adminPermission, UserController.getAllUsers])

router
    .route('/login')
    .post(UserController.login)

router
    .route('/resetPassword')
    .post( UserController.triggerResetPassword)

router
    .route('/resetPassword/:resetToken')
    .get(UserController.resetPasswordLanding)
    .post(UserController.resetPassword)

router
    .route('/:id')
    .get([tokenGuard,permissionToChangeUser, UserController.getUserById])
    .patch([tokenGuard,permissionToChangeUser, UserController.updateUserById])
    .delete([tokenGuard,permissionToChangeUser, UserController.deleteUserById])

export default router;

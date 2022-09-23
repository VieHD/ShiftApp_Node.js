import { Router } from "express";

import { adminPermission } from '../middlewares/permissionToChange.middleware';
import PermissionController from "../controllers/Permissions.controller";

const router = Router();

router
    .route('/')
    .get([adminPermission, PermissionController.getAllPermissions])


export default router;
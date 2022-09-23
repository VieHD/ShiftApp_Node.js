import { Router } from "express";

import {  permissionToChangeShift } from '../middlewares/permissionToChange.middleware';
import ShiftController from "../controllers/Shift.controller";

const router = Router();

router
    .route('/')
    .post(ShiftController.createShift)
    .get(ShiftController.getAllShifts)

router
    .route('/:id')
    .get([permissionToChangeShift, ShiftController.getShiftById])
    .patch([permissionToChangeShift, ShiftController.updateShiftById])
    .delete([permissionToChangeShift, ShiftController.deleteShift])



export default router;
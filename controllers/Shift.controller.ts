import { Response } from "express";
import { ObjectId } from "mongodb";

import { ERRORS } from "../const/errors";
import { Shift } from "../models/shift.model";
import { Permission } from "../models/user.model";
import { IExtendedRequest } from "../types/request";
import { DefaultError } from "../utils/defaultError";

class ShiftController {
  static async createShift(req: IExtendedRequest, res: Response) {
    try {
      const userId = req.context?.user._id;
      const newShift = new Shift({ ...req.body, createdBy : userId });
      await newShift.save();
      res.send(newShift);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('required')) {
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
        .status(409)
        //@ts-ignore
        .send(DefaultError.generate(409, error.message))
    }
    }
  }

  static async getAllShifts(req: IExtendedRequest, res: Response) {
    try {
      if (req.context?.user.permission === Permission.User) {
        const userId = new ObjectId(req.context?.user._id);
        res.send(
          await Shift.find(
            {
                createdBy: userId,
                active: true,
            },
        ).select('-active'));
      } else {
        res.send(await Shift.find().select('-active'));
      }
    } catch (error) {
      return res.status(500).send(DefaultError.generate(500, error))
    }
  }

  static async getShiftById(req: IExtendedRequest, res: Response) {
    try {
      const { id } = req.params;
      const displayShift = await Shift.findById(id).select("-active");

      if (displayShift === null) {
        return res.status(404).send(DefaultError.generate(404 , ERRORS.MONGO.SHIFT_NOT_FOUND))
      }

      res.send(displayShift);
    } catch (error) {
      return res.status(500).send(DefaultError.generate(500, error))
    }
  }

  static async updateShiftById(req: IExtendedRequest, res: Response) {
    try {
      const { id } = req.params;
      const updatedShift = await Shift.findByIdAndUpdate(id, req.body, {
        new: true,
      }).select("-active");

      if (updatedShift === null) {
        return res.status(404).send(DefaultError.generate(404 , ERRORS.MONGO.SHIFT_NOT_FOUND))
      }

      res.send(updatedShift);
    } catch (error) {
      return res.status(500).send(DefaultError.generate(500, error))
    }
  }

  static async deleteShift(req: IExtendedRequest, res: Response) {
    try {
      const { id } = req.params;
      const deletedShift = await Shift.findById(id).select('-active');
      await deletedShift?.update({active: false});
      res.send(deletedShift);
    } catch (error) {
      return res.status(500).send(DefaultError.generate(500, error))
    }
  }
}


export default ShiftController;

import { Response } from "express";

import { IExtendedRequest } from "../types/request";
import { DefaultError } from "../utils/defaultError";
import { Permissions} from "../models/permission.model";

class PermissionController {

  static async getAllPermissions(req: IExtendedRequest, res: Response) {
    try {
        res.send(await Permissions.find());
    } catch (error) {
      return res.status(500).send(DefaultError.generate(500, error))
    }
  }

}


export default PermissionController;
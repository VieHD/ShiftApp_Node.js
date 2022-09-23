import { Request } from "express"
import { Permission } from "../models/user.model"

export interface IUser {
    _id: string,
    permission: Permission
}

export interface IExtendedRequest extends Request {
    context?: {
        user: IUser
    }
}

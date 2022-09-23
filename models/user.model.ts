import mongoose, { Model, Schema, Document } from "mongoose";
import { NextFunction } from "connect";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

interface IAuthMethods {
    authenticate: (plainPassword: string) => Promise<boolean>,
    generateResetPasswordToken: () => void
}

export enum Permission {
    Admin = "63272e810d32edd4e33ce0dd",
    User = "63272e7c0d32edd4e33ce0db"
}

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "Please inset a valid email"]
    },
    password: {
        type: String,
        required: true,
        match: [/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&.])[A-Za-zd$@$!%*?&].{8,}/, "Password does not match security criteria"]
    },
    permission: {
        type: String,
        enum: Permission,
        default: Permission.User
    },
    username: {
        type: String,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    age: {
        type: Number,
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordTokenExpiryDate: {
        type: Date
    },
    active: {
        type: Boolean,
        default: true
    },
});

userSchema.pre('save', async function (next: NextFunction) {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(12);
        const encryptedPassword = await bcrypt.hash(this.password, salt);
        this.password = encryptedPassword;
        return next();
    }

    next();
});

userSchema.methods.authenticate = async function (plainPassword: string) {
    return bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.generateResetPasswordToken = function () {
    this.resetPasswordToken = crypto.randomBytes(16).toString('hex');
    this.resetPasswordTokenExpiryDate = Date.now() + 60 * 60 * 1000;
    this.save();
};

export type userType = mongoose.InferSchemaType<typeof userSchema> & Document & IAuthMethods;
export const User = mongoose.model<userType>('User', userSchema);
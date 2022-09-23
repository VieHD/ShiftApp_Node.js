import { NextFunction } from "express";
import { MongoError } from "mongodb";
import mongoose, { Document, Model, Schema } from "mongoose";
import { User } from "./user.model";
import { Comment } from "./comment.model";
import { DefaultError } from '../utils/defaultError';

const shiftSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    workplace: {
        type: String,
        enum: ['home', 'office'],
        required: true
    },
    profitPerHour: {
        type: Number,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: User
    },
    active: {
        type: Boolean,
        default: true
    },
    comments : {
        type: [Schema.Types.ObjectId],
        ref: Comment
    }

});

//@ts-ignore
shiftSchema.post('save', function (error: MongoError, doc: Document, next: NextFunction) {
    console.log('save failed');
    if (error.name === "MongoServerError" && error.code === 11000) {
        //@ts-ignore
        return next(DefaultError.generate(400, `There was a duplicate key ${JSON.stringify(error.keyValue)}`));
    }
    //@ts-ignore
    next();
});


export type shiftType = mongoose.InferSchemaType<typeof shiftSchema>;
export const Shift = mongoose.model<shiftType>('Shift', shiftSchema);
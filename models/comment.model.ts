import mongoose, { Schema } from "mongoose";
import { User } from "./user.model";

const commentSchema = new Schema({
    comment: {
        type: String,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: User
    },
    active: {
        type: Boolean,
        default: true
    }
});

export type sessionType = mongoose.InferSchemaType<typeof commentSchema>;
export const Comment = mongoose.model('Comment', commentSchema);
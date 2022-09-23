import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        unique: true
    },
    token: {
        type: String,
        required: true,
    },
    expiryDate: Date
});

export type sessionType = mongoose.InferSchemaType<typeof sessionSchema>;
export const Session = mongoose.model('Session', sessionSchema);
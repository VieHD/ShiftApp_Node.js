import mongoose, { Schema } from "mongoose";

const permissionSchema = new Schema({
    permission: {
        type: String,
    }
});

export type permissionType = mongoose.InferSchemaType<typeof permissionSchema>;
export const Permissions = mongoose.model('Permissions', permissionSchema);
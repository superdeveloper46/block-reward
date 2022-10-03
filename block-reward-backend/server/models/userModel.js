import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
});

export const User = mongoose.model("reactUser", userSchema);

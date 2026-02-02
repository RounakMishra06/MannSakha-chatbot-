import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, sparse: true }, // required only for local, not Google
    email: { type: String, required: true, unique: true },
    password: { type: String }, // required only for local
    googleId: { type: String, unique: true, sparse: true },
    gender: { type: String, enum: ["Male", "Female", "Other"] }, // optional for Google
    dob: { type: Date }, // optional for Google
    provider: { type: String, default: "local" }, // "google" or "local"
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);

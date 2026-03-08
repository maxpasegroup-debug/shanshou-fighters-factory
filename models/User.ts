import mongoose, { Document, Model, Schema } from "mongoose";

export type UserRole = "student" | "trainer" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["student", "trainer", "admin"],
      default: "student",
      required: true,
    },
    avatar: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

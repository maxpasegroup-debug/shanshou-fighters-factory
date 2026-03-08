import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ITrainer extends Document {
  userId: Types.ObjectId;
  bio: string;
  specialty: string;
  experience: number;
  rating: number;
  approved: boolean;
  courses: Types.ObjectId[];
}

const TrainerSchema = new Schema<ITrainer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bio: { type: String, required: true },
    specialty: { type: String, required: true },
    experience: { type: Number, required: true, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    approved: { type: Boolean, default: false },
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  },
  { timestamps: true },
);

const Trainer: Model<ITrainer> =
  mongoose.models.Trainer || mongoose.model<ITrainer>("Trainer", TrainerSchema);

export default Trainer;

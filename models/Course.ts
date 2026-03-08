import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ICourse extends Document {
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  level: string;
  category: string;
  trainerId: Types.ObjectId;
  rating: number;
  students: number;
  createdAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    level: { type: String, required: true },
    category: { type: String, required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: "Trainer", required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    students: { type: Number, default: 0, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);

export default Course;

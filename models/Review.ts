import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IReview extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  rating: number;
  comment: string;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true },
);

ReviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;

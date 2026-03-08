import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ILesson extends Document {
  courseId: Types.ObjectId;
  title: string;
  videoUrl: string;
  duration: number;
  order: number;
}

const LessonSchema = new Schema<ILesson>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    duration: { type: Number, required: true, min: 1 },
    order: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

LessonSchema.index({ courseId: 1, order: 1 }, { unique: true });

const Lesson: Model<ILesson> =
  mongoose.models.Lesson || mongoose.model<ILesson>("Lesson", LessonSchema);

export default Lesson;

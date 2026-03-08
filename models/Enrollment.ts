import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IEnrollment extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  progress: number;
  completedLessons: Types.ObjectId[];
  createdAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedLessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const Enrollment: Model<IEnrollment> =
  mongoose.models.Enrollment || mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);

export default Enrollment;

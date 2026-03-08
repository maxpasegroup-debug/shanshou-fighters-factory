import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface IBooking extends Document {
  trainerId: Types.ObjectId;
  userId: Types.ObjectId;
  sessionDate: Date;
  price: number;
  status: BookingStatus;
}

const BookingSchema = new Schema<IBooking>(
  {
    trainerId: { type: Schema.Types.ObjectId, ref: "Trainer", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionDate: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;

import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type PurchaseType = "course" | "booking";
export type PaymentStatus = "pending" | "paid" | "failed";

export interface IPayment extends Document {
  userId: Types.ObjectId;
  purchaseType: PurchaseType;
  referenceId: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  fulfilledAt?: Date;
  metadata?: Record<string, string>;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    purchaseType: { type: String, enum: ["course", "booking"], required: true },
    referenceId: { type: String, required: true },
    stripeSessionId: { type: String, required: true, unique: true },
    stripePaymentIntentId: { type: String },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "usd" },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    fulfilledAt: { type: Date },
    metadata: { type: Map, of: String },
  },
  { timestamps: true },
);

PaymentSchema.index({ userId: 1, purchaseType: 1, referenceId: 1 });

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;

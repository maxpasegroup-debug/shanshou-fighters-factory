import Stripe from "stripe";
import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api";
import { getEnv } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Enrollment from "@/models/Enrollment";
import Payment from "@/models/Payment";
import { getStripe } from "@/modules/payments";

const env = getEnv();

async function fulfillPaymentSession(session: Stripe.Checkout.Session) {
  const stripeSessionId = session.id;
  const payment = await Payment.findOne({ stripeSessionId });
  if (!payment || payment.fulfilledAt) return;

  if (session.payment_status !== "paid") {
    await Payment.findByIdAndUpdate(payment._id, { status: "failed" });
    return;
  }

  if (payment.purchaseType === "course") {
    await Enrollment.findOneAndUpdate(
      { userId: payment.userId, courseId: payment.referenceId },
      {
        $setOnInsert: {
          userId: payment.userId,
          courseId: payment.referenceId,
          progress: 0,
          completedLessons: [],
        },
      },
      { upsert: true, new: true },
    );
  }

  if (payment.purchaseType === "booking") {
    await Booking.findByIdAndUpdate(payment.referenceId, { status: "confirmed" });
  }

  await Payment.findByIdAndUpdate(payment._id, {
    status: "paid",
    stripePaymentIntentId: String(session.payment_intent || ""),
    fulfilledAt: new Date(),
  });
}

export async function POST(request: Request) {
  try {
    if (!env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
    }

    const rawBody = await request.text();
    const event = getStripe().webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);

    await connectToDatabase();
    if (event.type === "checkout.session.completed") {
      await fulfillPaymentSession(event.data.object as Stripe.Checkout.Session);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return handleApiError("payments/webhook", error);
  }
}

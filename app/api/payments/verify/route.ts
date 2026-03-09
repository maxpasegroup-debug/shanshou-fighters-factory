import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { badRequest, handleApiError, unauthorized } from "@/lib/api";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { getStripe } from "@/modules/payments";

const verifySchema = z.object({
  sessionId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return unauthorized();

    const payload = verifySchema.safeParse(await request.json());
    if (!payload.success) return badRequest(payload.error.issues[0]?.message || "Invalid payload");
    const { sessionId } = payload.data;

    await connectToDatabase();
    const payment = await Payment.findOne({ stripeSessionId: sessionId });
    if (!payment) return NextResponse.json({ error: "Payment session not found" }, { status: 404 });
    if (payment.userId.toString() !== session.user.id) return unauthorized("Payment does not belong to user");

    const checkoutSession = await getStripe().checkout.sessions.retrieve(sessionId);
    const isPaid = checkoutSession.payment_status === "paid";
    if (isPaid && payment.status !== "paid") {
      await Payment.findByIdAndUpdate(payment._id, {
        status: "paid",
        stripePaymentIntentId: String(checkoutSession.payment_intent || ""),
      });
    }

    return NextResponse.json({
      id: checkoutSession.id,
      status: checkoutSession.payment_status,
      metadata: payment.metadata,
      amount: checkoutSession.amount_total ? checkoutSession.amount_total / 100 : 0,
      fulfilled: payment.fulfilledAt ? true : false,
    });
  } catch (error) {
    return handleApiError("payments/verify", error);
  }
}

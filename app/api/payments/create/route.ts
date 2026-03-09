import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { badRequest, getClientKey, handleApiError, isValidObjectId, notFound, unauthorized, applyRateLimit } from "@/lib/api";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Course from "@/models/Course";
import Payment from "@/models/Payment";
import { getStripe } from "@/modules/payments";

const createPaymentSchema = z.object({
  type: z.enum(["course", "booking"]).default("course"),
  referenceId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export async function POST(request: Request) {
  try {
    const rate = applyRateLimit(getClientKey(request, "payments:create"), {
      limit: 20,
      windowMs: 60_000,
    });
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session) return unauthorized();

    const payload = createPaymentSchema.safeParse(await request.json());
    if (!payload.success) return badRequest(payload.error.issues[0]?.message || "Invalid payload");
    const { type, referenceId, successUrl, cancelUrl } = payload.data;

    if (!isValidObjectId(referenceId)) return badRequest("Invalid referenceId");

    await connectToDatabase();

    let amount = 0;
    let title = "Sanshou Training Purchase";
    let metadata: Record<string, string> = {};

    if (type === "course") {
      const course = await Course.findById(referenceId).lean();
      if (!course) return notFound("Course not found");
      amount = Number(course.price || 0);
      title = course.title;
      metadata = {
        purchaseType: "course",
        referenceId,
        userId: String(session.user.id),
      };
    } else {
      const booking = await Booking.findById(referenceId).lean();
      if (!booking) return notFound("Booking not found");
      if (booking.userId.toString() !== session.user.id) return unauthorized("Booking does not belong to user");
      amount = Number(booking.price || 0);
      title = `Live session booking`;
      metadata = {
        purchaseType: "booking",
        referenceId,
        userId: String(session.user.id),
      };
    }

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: title,
            },
          },
        },
      ],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata,
    });

    await Payment.findOneAndUpdate(
      { stripeSessionId: checkoutSession.id },
      {
        userId: session.user.id,
        purchaseType: type,
        referenceId,
        stripeSessionId: checkoutSession.id,
        amount,
        currency: "usd",
        status: "pending",
        metadata,
      },
      { upsert: true, new: true },
    );

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    return handleApiError("payments/create", error);
  }
}

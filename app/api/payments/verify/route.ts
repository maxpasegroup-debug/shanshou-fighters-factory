import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Enrollment from "@/models/Enrollment";
import { getStripe } from "@/modules/payments";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const checkoutSession = await getStripe().checkout.sessions.retrieve(sessionId);
    const isPaid = checkoutSession.payment_status === "paid";

    if (!isPaid) {
      return NextResponse.json({
        id: checkoutSession.id,
        status: checkoutSession.payment_status,
      });
    }

    await connectToDatabase();
    const referenceId = checkoutSession.metadata?.referenceId;
    const purchaseType = checkoutSession.metadata?.purchaseType;

    if (purchaseType === "course" && referenceId) {
      await Enrollment.findOneAndUpdate(
        { userId: session.user.id, courseId: referenceId },
        {
          $setOnInsert: {
            userId: session.user.id,
            courseId: referenceId,
            progress: 0,
            completedLessons: [],
          },
        },
        { upsert: true, new: true },
      );
    }

    if (purchaseType === "booking" && referenceId) {
      await Booking.findByIdAndUpdate(referenceId, { status: "confirmed" });
    }

    return NextResponse.json({
      id: checkoutSession.id,
      status: checkoutSession.payment_status,
      metadata: checkoutSession.metadata,
      amount: checkoutSession.amount_total ? checkoutSession.amount_total / 100 : 0,
      enrolled: purchaseType === "course",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to verify payment", details: `${error}` }, { status: 500 });
  }
}

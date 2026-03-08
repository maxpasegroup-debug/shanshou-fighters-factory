import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getStripe } from "@/modules/payments";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, type = "course", referenceId, title, successUrl, cancelUrl } = await request.json();
    if (!amount || !referenceId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: "amount, referenceId, successUrl and cancelUrl are required" },
        { status: 400 },
      );
    }

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(Number(amount) * 100),
            product_data: {
              name: title || "Sanshou Training Purchase",
            },
          },
        },
      ],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        purchaseType: type,
        referenceId: String(referenceId),
        userId: String(session.user.id),
      },
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create payment", details: `${error}` }, { status: 500 });
  }
}

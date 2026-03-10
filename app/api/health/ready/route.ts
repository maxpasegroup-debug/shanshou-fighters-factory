import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { getStripe } from "@/modules/payments";

const READY_HEADER = "x-ready-secret";

/** Protected readiness: full diagnostics. Call with header x-ready-secret: <READY_CHECK_SECRET>. */
export async function GET(request: Request) {
  const secret = request.headers.get(READY_HEADER) || "";
  const expected = process.env.READY_CHECK_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const db = { ok: false, message: "" };
  try {
    await connectToDatabase();
    db.ok = true;
    db.message = "Connected";
  } catch (err) {
    db.message = err instanceof Error ? err.message : "Unavailable";
  }

  const stripe = { ok: false, message: "" };
  try {
    getStripe();
    stripe.ok = true;
    stripe.message = "Configured";
  } catch (err) {
    stripe.message = err instanceof Error ? err.message : "Unavailable";
  }

  const cloudinaryRequired = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_SECRET"] as const;
  const cloudinaryMissing = cloudinaryRequired.filter((key) => !process.env[key]);
  const cloudinary = {
    ok: cloudinaryMissing.length === 0,
    missing: cloudinaryMissing,
  };

  const overall = db.ok && stripe.ok && cloudinary.ok;
  return NextResponse.json({
    ok: overall,
    checks: { database: db, stripe, cloudinary },
    responseTimeMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  });
}

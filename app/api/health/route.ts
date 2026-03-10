import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { getStripe } from "@/modules/payments";

function checkCloudinaryConfig() {
  const required = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_SECRET"] as const;
  const missing = required.filter((key) => !process.env[key]);
  return {
    ok: missing.length === 0,
    missing,
  };
}

export async function GET() {
  const startedAt = Date.now();

  const db = { ok: false, message: "" };
  try {
    await connectToDatabase();
    db.ok = true;
    db.message = "Connected";
  } catch {
    db.message = "Unavailable";
  }

  const stripe = { ok: false, message: "" };
  try {
    getStripe();
    stripe.ok = true;
    stripe.message = "Configured";
  } catch {
    stripe.message = "Unavailable";
  }

  const cloudinary = checkCloudinaryConfig();
  const cloudinarySafe = { ok: cloudinary.ok, message: cloudinary.ok ? "Configured" : "Unavailable" };

  const overall = db.ok && stripe.ok && cloudinary.ok;
  return NextResponse.json({
    ok: overall,
    checks: { database: db, stripe, cloudinary: cloudinarySafe },
    environment: process.env.NODE_ENV || "development",
    responseTimeMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  });
}

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
  } catch (error) {
    db.message = `Failed: ${error}`;
  }

  const stripe = { ok: false, message: "" };
  try {
    getStripe();
    stripe.ok = true;
    stripe.message = "Configured";
  } catch (error) {
    stripe.message = `Failed: ${error}`;
  }

  const cloudinary = checkCloudinaryConfig();

  const overall = db.ok && stripe.ok && cloudinary.ok;
  return NextResponse.json({
    ok: overall,
    checks: {
      database: db,
      stripe,
      cloudinary: {
        ok: cloudinary.ok,
        missing: cloudinary.missing,
      },
    },
    environment: process.env.NODE_ENV || "development",
    responseTimeMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  });
}

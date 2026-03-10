import { NextResponse } from "next/server";

/** Lightweight liveness probe: no dependencies, returns 200 when the process is up. */
export async function GET() {
  return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
}

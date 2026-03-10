import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";

const buckets = new Map<string, { count: number; resetAt: number }>();

export function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export function unauthorized(error = "Unauthorized") {
  return NextResponse.json({ error }, { status: 401 });
}

export function forbidden(error = "Forbidden") {
  return NextResponse.json({ error }, { status: 403 });
}

export function notFound(error = "Not found") {
  return NextResponse.json({ error }, { status: 404 });
}

export function conflict(error: string) {
  return NextResponse.json({ error }, { status: 409 });
}

export function handleApiError(scope: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${scope}]`, message, error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export function safeParse<T extends z.ZodTypeAny>(schema: T, input: unknown) {
  const parsed = schema.safeParse(input);
  if (parsed.success) return { data: parsed.data, error: null };
  const firstError = parsed.error.issues[0]?.message || "Invalid request payload";
  return { data: null, error: firstError };
}

export function isValidObjectId(id: string) {
  return Types.ObjectId.isValid(id);
}

export function applyRateLimit(
  key: string,
  { limit = 30, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}

export function getClientKey(request: Request, prefix: string) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
  return `${prefix}:${ip}`;
}

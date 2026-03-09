import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { applyRateLimit, badRequest, conflict, getClientKey, handleApiError } from "@/lib/api";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  try {
    const rate = applyRateLimit(getClientKey(request, "register"), { limit: 10, windowMs: 60_000 });
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const payload = registerSchema.safeParse(await request.json());
    if (!payload.success) return badRequest(payload.error.issues[0]?.message || "Invalid payload");
    const { name, email, password } = payload.data;

    await connectToDatabase();
    const existing = await User.findOne({ email });
    if (existing) {
      return conflict("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
    });

    return NextResponse.json(
      {
        message: "User created",
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError("auth/register", error);
  }
}

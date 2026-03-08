import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student",
    });

    return NextResponse.json(
      {
        message: "User created",
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to register", details: `${error}` }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Trainer from "@/models/Trainer";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const trainer = session.user.role === "trainer" ? await Trainer.findOne({ userId: session.user.id }).lean() : null;
    const bookings = await Booking.find({
      ...(session.user.role === "trainer"
        ? { trainerId: trainer?._id || null }
        : { userId: session.user.id }),
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bookings", details: `${error}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { trainerId, sessionDate, price } = await request.json();
    if (!trainerId || !sessionDate || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const booking = await Booking.create({
      trainerId,
      userId: session.user.id,
      sessionDate,
      price,
      status: "pending",
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create booking", details: `${error}` }, { status: 500 });
  }
}

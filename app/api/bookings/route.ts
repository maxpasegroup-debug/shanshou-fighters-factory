import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { badRequest, handleApiError, isValidObjectId, unauthorized } from "@/lib/api";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Trainer from "@/models/Trainer";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return unauthorized();

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
    return handleApiError("bookings/list", error);
  }
}

const createBookingSchema = z.object({
  trainerId: z.string(),
  sessionDate: z.string().datetime(),
  price: z.number().positive(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return unauthorized();

    const payload = createBookingSchema.safeParse(await request.json());
    if (!payload.success) return badRequest(payload.error.issues[0]?.message || "Invalid payload");
    const { trainerId, sessionDate, price } = payload.data;
    if (!isValidObjectId(trainerId)) return badRequest("Invalid trainerId");

    await connectToDatabase();
    const trainerExists = await Trainer.findById(trainerId).lean();
    if (!trainerExists) return badRequest("Trainer not found");

    const booking = await Booking.create({
      trainerId,
      userId: session.user.id,
      sessionDate,
      price,
      status: "pending",
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return handleApiError("bookings/create", error);
  }
}

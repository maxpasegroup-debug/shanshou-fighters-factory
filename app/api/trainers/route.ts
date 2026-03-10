import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { handleApiError, unauthorized } from "@/lib/api";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Trainer from "@/models/Trainer";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    await connectToDatabase();
    const query =
      session?.user.role === "admin" || session?.user.role === "trainer"
        ? {}
        : { approved: true };
    const trainers = await Trainer.find(query)
      .populate("userId", "name avatar")
      .sort({ rating: -1 })
      .lean();
    return NextResponse.json(trainers);
  } catch (error) {
    return handleApiError("trainers/list", error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "trainer" && session.user.role !== "admin")) {
      return unauthorized();
    }

    const payload = await request.json();
    await connectToDatabase();
    const trainer = await Trainer.findOneAndUpdate(
      { userId: session.user.id },
      {
        $set: {
          bio: payload.bio,
          specialty: payload.specialty,
          experience: payload.experience,
          rating: payload.rating || 0,
          approved: session.user.role === "admin" ? Boolean(payload.approved) : false,
        },
      },
      { upsert: true, new: true },
    );

    return NextResponse.json(trainer, { status: 201 });
  } catch (error) {
    return handleApiError("trainers/save", error);
  }
}

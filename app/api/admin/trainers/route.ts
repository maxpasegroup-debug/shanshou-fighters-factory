import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { badRequest, handleApiError, unauthorized } from "@/lib/api";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Trainer from "@/models/Trainer";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return unauthorized();
    }

    await connectToDatabase();
    const trainers = await Trainer.find({ approved: false })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(trainers);
  } catch (error) {
    return handleApiError("admin/trainers/list", error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return unauthorized();
    }

    const { trainerId, approved } = await request.json();
    if (!trainerId) return badRequest("trainerId is required");

    await connectToDatabase();
    const trainer = await Trainer.findByIdAndUpdate(
      trainerId,
      { approved: approved !== false },
      { new: true },
    );
    return NextResponse.json(trainer);
  } catch (error) {
    return handleApiError("admin/trainers/approve", error);
  }
}

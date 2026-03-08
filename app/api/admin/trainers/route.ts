import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Trainer from "@/models/Trainer";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const trainers = await Trainer.find({ approved: false })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(trainers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch trainers", details: `${error}` }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { trainerId, approved } = await request.json();
    if (!trainerId) return NextResponse.json({ error: "trainerId is required" }, { status: 400 });

    await connectToDatabase();
    const trainer = await Trainer.findByIdAndUpdate(
      trainerId,
      { approved: approved !== false },
      { new: true },
    );
    return NextResponse.json(trainer);
  } catch (error) {
    return NextResponse.json({ error: "Failed to approve trainer", details: `${error}` }, { status: 500 });
  }
}

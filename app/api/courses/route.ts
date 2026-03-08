import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import Course from "@/models/Course";
import Trainer from "@/models/Trainer";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(request.url);
    const mine = url.searchParams.get("mine") === "1";

    await connectToDatabase();
    let query = Course.find();
    if (mine && session?.user.id) {
      const trainer = await Trainer.findOne({ userId: session.user.id }).lean();
      query = Course.find({ trainerId: trainer?._id || null });
    }

    const courses = await query
      .sort({ createdAt: -1 })
      .limit(100)
      .populate({
        path: "trainerId",
        populate: { path: "userId", select: "name avatar" },
      })
      .lean();
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courses", details: `${error}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "trainer" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    await connectToDatabase();
    const trainer = await Trainer.findOne({ userId: session.user.id });

    if (!trainer && session.user.role === "trainer") {
      return NextResponse.json({ error: "Trainer profile required" }, { status: 400 });
    }

    const course = await Course.create({
      ...payload,
      trainerId: payload.trainerId || trainer?._id,
    });

    if (trainer) {
      trainer.courses.push(course._id);
      await trainer.save();
    }

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create course", details: `${error}` }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { courseId, lessonId, progress } = await request.json();
    if (!courseId || !lessonId) {
      return NextResponse.json({ error: "courseId and lessonId are required" }, { status: 400 });
    }

    await connectToDatabase();
    const enrollment = await Enrollment.findOneAndUpdate(
      { userId: session.user.id, courseId },
      {
        $addToSet: { completedLessons: lessonId },
        ...(typeof progress === "number" ? { $set: { progress } } : {}),
      },
      { new: true },
    );

    return NextResponse.json(enrollment);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update progress", details: `${error}` },
      { status: 500 },
    );
  }
}

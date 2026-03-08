import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import Lesson from "@/models/Lesson";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { courseId } = await request.json();
    if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

    await connectToDatabase();
    const enrollment = await Enrollment.findOneAndUpdate(
      { userId: session.user.id, courseId },
      { $setOnInsert: { userId: session.user.id, courseId, progress: 0, completedLessons: [] } },
      { upsert: true, new: true },
    );

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to enroll", details: `${error}` }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { courseId, lessonId } = await request.json();
    if (!courseId || !lessonId) {
      return NextResponse.json({ error: "courseId and lessonId are required" }, { status: 400 });
    }

    await connectToDatabase();
    const enrollment = await Enrollment.findOneAndUpdate(
      { userId: session.user.id, courseId },
      {
        $setOnInsert: { userId: session.user.id, courseId, completedLessons: [], progress: 0 },
        $addToSet: { completedLessons: lessonId },
      },
      { upsert: true, new: true },
    );

    const totalLessons = await Lesson.countDocuments({ courseId });
    const completedLessons = enrollment.completedLessons.length;
    enrollment.progress = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
    await enrollment.save();

    return NextResponse.json({
      enrollmentId: enrollment._id,
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update progress", details: `${error}` }, { status: 500 });
  }
}

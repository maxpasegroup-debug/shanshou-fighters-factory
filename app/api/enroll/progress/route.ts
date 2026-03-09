import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { badRequest, handleApiError, isValidObjectId, unauthorized } from "@/lib/api";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import Lesson from "@/models/Lesson";

const progressSchema = z.object({
  courseId: z.string(),
  lessonId: z.string(),
});

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return unauthorized();

    const payload = progressSchema.safeParse(await request.json());
    if (!payload.success) return badRequest(payload.error.issues[0]?.message || "Invalid payload");
    const { courseId, lessonId } = payload.data;
    if (!isValidObjectId(courseId) || !isValidObjectId(lessonId)) {
      return badRequest("Invalid courseId or lessonId");
    }

    await connectToDatabase();
    const enrollment = await Enrollment.findOneAndUpdate(
      { userId: session.user.id, courseId },
      { $addToSet: { completedLessons: lessonId } },
      { new: true },
    );
    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment required before tracking progress." }, { status: 403 });
    }

    const totalLessons = await Lesson.countDocuments({ courseId });
    enrollment.progress = totalLessons
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;
    await enrollment.save();

    return NextResponse.json(enrollment);
  } catch (error) {
    return handleApiError("enroll/progress-legacy", error);
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { badRequest, handleApiError, isValidObjectId, notFound, unauthorized } from "@/lib/api";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Lesson from "@/models/Lesson";

const enrollSchema = z.object({
  courseId: z.string(),
});

const progressSchema = z.object({
  courseId: z.string(),
  lessonId: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return unauthorized();

    const payload = enrollSchema.safeParse(await request.json());
    if (!payload.success) return badRequest(payload.error.issues[0]?.message || "Invalid payload");
    const { courseId } = payload.data;
    if (!isValidObjectId(courseId)) return badRequest("Invalid courseId");

    await connectToDatabase();
    const course = await Course.findById(courseId).lean();
    if (!course) return notFound("Course not found");
    if (Number(course.price || 0) > 0) {
      return NextResponse.json(
        { error: "Payment required for this course. Complete checkout to enroll." },
        { status: 402 },
      );
    }

    const enrollment = await Enrollment.findOneAndUpdate(
      { userId: session.user.id, courseId },
      { $setOnInsert: { userId: session.user.id, courseId, progress: 0, completedLessons: [] } },
      { upsert: true, new: true },
    );

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    return handleApiError("enroll/create", error);
  }
}

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
    const completedLessons = enrollment.completedLessons.length;
    enrollment.progress = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
    await enrollment.save();

    return NextResponse.json({
      enrollmentId: enrollment._id,
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons,
    });
  } catch (error) {
    return handleApiError("enroll/progress", error);
  }
}

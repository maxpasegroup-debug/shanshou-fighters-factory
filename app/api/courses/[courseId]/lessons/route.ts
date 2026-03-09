import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { badRequest, forbidden, handleApiError, isValidObjectId, notFound, unauthorized } from "@/lib/api";
import { authOptions } from "@/lib/auth";
import { hasCourseEntitlement } from "@/lib/entitlement";
import { connectToDatabase } from "@/lib/mongodb";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import Trainer from "@/models/Trainer";

type Params = {
  params: { courseId: string };
};

export async function GET(_: Request, { params }: Params) {
  try {
    if (!isValidObjectId(params.courseId)) return badRequest("Invalid courseId");
    const session = await getServerSession(authOptions);

    await connectToDatabase();
    const course = await Course.findById(params.courseId).lean();
    if (!course) return notFound("Course not found");

    const isFree = Number(course.price || 0) === 0;
    let canView = isFree;

    if (session?.user?.id) {
      if (session.user.role === "admin") {
        canView = true;
      } else if (session.user.role === "trainer") {
        const trainer = await Trainer.findOne({ userId: session.user.id }).lean();
        canView = Boolean(trainer && trainer._id.toString() === course.trainerId.toString());
      }

      if (!canView) canView = await hasCourseEntitlement(session.user.id, params.courseId);
    }

    if (!canView) return forbidden("Course enrollment required");

    const lessons = await Lesson.find({ courseId: params.courseId }).sort({ order: 1 }).lean();
    return NextResponse.json(lessons);
  } catch (error) {
    return handleApiError("lessons/list", error);
  }
}

const lessonCreateSchema = z.object({
  title: z.string().min(2),
  videoUrl: z.string().url(),
  duration: z.number().int().positive(),
  order: z.number().int().positive(),
});

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "trainer" && session.user.role !== "admin")) return unauthorized();
    if (!isValidObjectId(params.courseId)) return badRequest("Invalid courseId");

    await connectToDatabase();
    const course = await Course.findById(params.courseId).lean();
    if (!course) return notFound("Course not found");

    if (session.user.role === "trainer") {
      const trainer = await Trainer.findOne({ userId: session.user.id }).lean();
      if (!trainer || trainer._id.toString() !== course.trainerId.toString()) {
        return forbidden("Cannot modify lessons for this course");
      }
    }

    const parsed = lessonCreateSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message || "Invalid payload");

    const lesson = await Lesson.create({ ...parsed.data, courseId: params.courseId });
    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    return handleApiError("lessons/create", error);
  }
}

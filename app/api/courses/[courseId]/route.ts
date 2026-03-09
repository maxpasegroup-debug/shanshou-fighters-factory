import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { handleApiError, isValidObjectId, notFound } from "@/lib/api";
import { authOptions } from "@/lib/auth";
import { hasCourseEntitlement } from "@/lib/entitlement";
import { connectToDatabase } from "@/lib/mongodb";
import Course, { ICourse } from "@/models/Course";
import Lesson from "@/models/Lesson";
import Review from "@/models/Review";
import Trainer from "@/models/Trainer";

type Params = {
  params: { courseId: string };
};

export async function GET(_: Request, { params }: Params) {
  try {
    if (!isValidObjectId(params.courseId)) {
      return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    await connectToDatabase();
    const [course, reviews] = await Promise.all([
      Course.findById(params.courseId)
        .populate({
          path: "trainerId",
          populate: { path: "userId", select: "name avatar" },
        })
        .lean(),
      Review.find({ courseId: params.courseId }).populate("userId", "name avatar").lean(),
    ]);

    if (!course) {
      return notFound("Course not found");
    }

    const typedCourse = course as ICourse & {
      trainerId?: {
        _id: unknown;
        userId?: { name?: string; avatar?: string };
      };
    };

    const isFree = Number(typedCourse.price || 0) === 0;
    let hasAccess = isFree;
    let completedLessons: string[] = [];
    let progress = 0;

    if (session?.user?.id) {
      if (session.user.role === "admin") {
        hasAccess = true;
      } else if (session.user.role === "trainer") {
        const trainer = await Trainer.findOne({ userId: session.user.id }).lean();
        const courseTrainerId = typedCourse.trainerId?._id?.toString?.();
        hasAccess = Boolean(trainer && courseTrainerId && trainer._id.toString() === courseTrainerId);
      }

      if (!hasAccess) {
        hasAccess = await hasCourseEntitlement(session.user.id, params.courseId);
      }

      if (hasAccess) {
        const EnrollmentModel = (await import("@/models/Enrollment")).default;
        const enrollment = await EnrollmentModel
          .findOne({ userId: session.user.id, courseId: params.courseId })
          .lean();
        if (enrollment) {
          progress = Number(enrollment.progress || 0);
          completedLessons = (enrollment.completedLessons || []).map((item: unknown) =>
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            (item as { toString: () => string }).toString(),
          );
        }
      }
    }

    const lessons = hasAccess
      ? await Lesson.find({ courseId: params.courseId }).sort({ order: 1 }).lean()
      : [];

    return NextResponse.json({ course, lessons, reviews, hasAccess, progress, completedLessons });
  } catch (error) {
    return handleApiError("courses/detail", error);
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    await Course.findByIdAndDelete(params.courseId);
    await Lesson.deleteMany({ courseId: params.courseId });
    await Review.deleteMany({ courseId: params.courseId });

    return NextResponse.json({ message: "Course deleted" });
  } catch (error) {
    return handleApiError("courses/delete", error);
  }
}

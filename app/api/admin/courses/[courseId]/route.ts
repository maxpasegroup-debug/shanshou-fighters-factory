import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { handleApiError, unauthorized } from "@/lib/api";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Lesson from "@/models/Lesson";
import Review from "@/models/Review";

type Params = {
  params: { courseId: string };
};

export async function DELETE(_: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return unauthorized();
    }

    await connectToDatabase();
    await Promise.all([
      Enrollment.deleteMany({ courseId: params.courseId }),
      Lesson.deleteMany({ courseId: params.courseId }),
      Review.deleteMany({ courseId: params.courseId }),
    ]);
    await Course.findByIdAndDelete(params.courseId);
    return NextResponse.json({ message: "Course deleted" });
  } catch (error) {
    return handleApiError("admin/courses/delete", error);
  }
}

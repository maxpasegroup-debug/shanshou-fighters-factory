import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import Review from "@/models/Review";

type Params = {
  params: { courseId: string };
};

export async function GET(_: Request, { params }: Params) {
  try {
    await connectToDatabase();
    const [course, lessons, reviews] = await Promise.all([
      Course.findById(params.courseId)
        .populate({
          path: "trainerId",
          populate: { path: "userId", select: "name avatar" },
        })
        .lean(),
      Lesson.find({ courseId: params.courseId }).sort({ order: 1 }).lean(),
      Review.find({ courseId: params.courseId }).populate("userId", "name avatar").lean(),
    ]);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    return NextResponse.json({ course, lessons, reviews });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch course", details: `${error}` }, { status: 500 });
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
    return NextResponse.json({ error: "Failed to delete course", details: `${error}` }, { status: 500 });
  }
}

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

export async function DELETE(_: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    await Promise.all([
      Course.findByIdAndDelete(params.courseId),
      Lesson.deleteMany({ courseId: params.courseId }),
      Review.deleteMany({ courseId: params.courseId }),
    ]);
    return NextResponse.json({ message: "Course deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete course", details: `${error}` }, { status: 500 });
  }
}

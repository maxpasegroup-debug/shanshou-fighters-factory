import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Lesson from "@/models/Lesson";

type Params = {
  params: { courseId: string };
};

export async function GET(_: Request, { params }: Params) {
  try {
    await connectToDatabase();
    const lessons = await Lesson.find({ courseId: params.courseId }).sort({ order: 1 }).lean();
    return NextResponse.json(lessons);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch lessons", details: `${error}` }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "trainer" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    await connectToDatabase();
    const lesson = await Lesson.create({ ...payload, courseId: params.courseId });
    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create lesson", details: `${error}` }, { status: 500 });
  }
}

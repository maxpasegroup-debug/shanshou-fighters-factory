import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Lesson from "@/models/Lesson";

const trackMap: Record<string, "mind" | "body" | "emotion"> = {
  meditation: "mind",
  mindset: "mind",
  mental: "mind",
  mindfulness: "mind",
  kickboxing: "body",
  mma: "body",
  muay: "body",
  boxing: "body",
  fitness: "body",
  emotion: "emotion",
  discipline: "emotion",
};

function categoryToTrack(category?: string): "mind" | "body" | "emotion" {
  const key = (category || "").toLowerCase();
  for (const token of Object.keys(trackMap)) {
    if (key.includes(token)) return trackMap[token];
  }
  return "emotion";
}

type EnrollmentLean = {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  progress?: number;
  completedLessons?: Types.ObjectId[];
};

type CourseLean = {
  _id: Types.ObjectId;
  title: string;
  category: string;
};

type LessonLean = {
  courseId: Types.ObjectId;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const enrollments = (await Enrollment.find({ userId: session.user.id }).lean()) as EnrollmentLean[];
    const courseIds = enrollments.map((item) => item.courseId);
    const [courses, lessons] = await Promise.all([
      Course.find({ _id: { $in: courseIds } }).lean(),
      Lesson.find({ courseId: { $in: courseIds } }).lean(),
    ]);

    const lessonsByCourse = new Map<string, number>();
    for (const lesson of lessons as LessonLean[]) {
      const key = lesson.courseId.toString();
      lessonsByCourse.set(key, (lessonsByCourse.get(key) || 0) + 1);
    }

    const courseById = new Map<string, CourseLean>();
    for (const course of courses as CourseLean[]) {
      courseById.set(course._id.toString(), course);
    }

    const items = enrollments.map((enrollment) => {
      const course = courseById.get(enrollment.courseId.toString());
      const totalLessons = lessonsByCourse.get(enrollment.courseId.toString()) || 0;
      const completed = enrollment.completedLessons?.length || 0;
      return {
        enrollmentId: enrollment._id.toString(),
        courseId: enrollment.courseId.toString(),
        title: course?.title || "Course",
        category: course?.category || "General",
        track: categoryToTrack(course?.category),
        progress: enrollment.progress || (totalLessons ? Math.round((completed / totalLessons) * 100) : 0),
        completedLessons: completed,
        totalLessons,
      };
    });

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch learning journey", details: `${error}` }, { status: 500 });
  }
}

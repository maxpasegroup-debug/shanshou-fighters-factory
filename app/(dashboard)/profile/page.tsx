import ProgressBar from "@/components/ProgressBar";
import mongoose from "mongoose";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";

export const dynamic = "force-dynamic";

type EnrollmentLean = {
  courseId: string;
  progress?: number;
  completedLessons?: string[];
};

type EnrollmentRaw = {
  courseId: { toString: () => string };
  progress?: number;
  completedLessons?: Array<{ toString: () => string }>;
};

function getBadges(coursesCompleted: number, lessonsCompleted: number) {
  const badges: string[] = ["White Belt"];
  if (lessonsCompleted >= 10 || coursesCompleted >= 1) badges.push("Blue Belt");
  if (lessonsCompleted >= 30 || coursesCompleted >= 3) badges.push("Black Belt");
  return badges;
}

export default async function ProfilePage() {
  const session = await getAuthSession();

  let lessonsCompleted = 0;
  let coursesCompleted = 0;
  let lessonCompletionRate = 0;

  if (session?.user?.id) {
    await connectToDatabase();
    const enrollmentsRaw = (await Enrollment.find({ userId: session.user.id }).lean()) as EnrollmentRaw[];
    const enrollments: EnrollmentLean[] = enrollmentsRaw.map((item) => ({
      courseId: item.courseId.toString(),
      progress: item.progress,
      completedLessons: item.completedLessons?.map((lesson) => lesson.toString()) || [],
    }));

    lessonsCompleted = enrollments.reduce((acc, item) => acc + (item.completedLessons?.length || 0), 0);
    coursesCompleted = enrollments.filter((item) => (item.progress || 0) >= 100).length;

    const courseIds = enrollments.map((item) => new mongoose.Types.ObjectId(item.courseId));
    const totalLessons = courseIds.length
      ? await Course.aggregate([
          { $match: { _id: { $in: courseIds } } },
          {
            $lookup: {
              from: "lessons",
              localField: "_id",
              foreignField: "courseId",
              as: "courseLessons",
            },
          },
          {
            $project: {
              lessonCount: { $size: "$courseLessons" },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$lessonCount" },
            },
          },
        ])
      : [];

    const lessonTotal = totalLessons[0]?.total || 0;
    lessonCompletionRate = lessonTotal ? Math.round((lessonsCompleted / lessonTotal) * 100) : 0;
  }

  const badges = getBadges(coursesCompleted, lessonsCompleted);
  const streak = Math.min(100, Math.max(10, lessonsCompleted * 5));

  return (
    <div className="space-y-5">
      <div className="glass-card p-4">
        <h1 className="text-2xl font-bold">Fighter Profile</h1>
        <p className="mt-1 text-sm text-zinc-400">Track your combat learning and consistency.</p>
      </div>

      <div className="glass-card space-y-4 p-4">
        <ProgressBar label="Lessons Completed" value={lessonCompletionRate} />
        <ProgressBar label="Courses Completed" value={Math.min(coursesCompleted * 20, 100)} />
        <ProgressBar label="Training Streak" value={streak} />
      </div>

      <div className="glass-card p-4">
        <h2 className="font-semibold">Achievements</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span key={badge} className="warrior-gradient-soft rounded-full px-3 py-1 text-xs text-black">
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

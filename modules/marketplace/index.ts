import Course from "@/models/Course";
import { connectToDatabase } from "@/lib/mongodb";

export type CourseCardData = {
  _id: string;
  title: string;
  thumbnail: string;
  trainer?: string;
  rating: number;
  price: number;
};

function mapCourseToCard(course: any): CourseCardData {
  const trainerName =
    (course?.trainerId?.userId?.name as string | undefined) ||
    (course?.trainerId?.name as string | undefined) ||
    "Trainer";

  return {
    _id: course._id.toString(),
    title: course.title,
    thumbnail: course.thumbnail,
    trainer: trainerName,
    rating: Number(course.rating || 0),
    price: Number(course.price || 0),
  };
}

export async function getFeaturedCourses() {
  await connectToDatabase();
  const courses = await Course.find()
    .sort({ rating: -1, students: -1, createdAt: -1 })
    .limit(8)
    .populate({
      path: "trainerId",
      populate: { path: "userId", select: "name" },
    })
    .lean();

  return courses.map(mapCourseToCard);
}

export async function getMarketplaceCourses() {
  await connectToDatabase();
  const courses = await Course.find()
    .sort({ createdAt: -1 })
    .limit(48)
    .populate({
      path: "trainerId",
      populate: { path: "userId", select: "name" },
    })
    .lean();

  return courses.map(mapCourseToCard);
}

import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import Review from "@/models/Review";
import { connectToDatabase } from "@/lib/mongodb";

export async function getCourseWithContent(courseId: string) {
  await connectToDatabase();
  const [course, lessons, reviews] = await Promise.all([
    Course.findById(courseId)
      .populate({
        path: "trainerId",
        populate: { path: "userId", select: "name avatar" },
      })
      .lean(),
    Lesson.find({ courseId }).sort({ order: 1 }).lean(),
    Review.find({ courseId }).populate("userId", "name avatar").sort({ createdAt: -1 }).lean(),
  ]);

  if (!course) return null;

  return {
    course: {
      _id: (course as any)._id.toString(),
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      price: Number(course.price || 0),
      level: course.level,
      category: course.category,
      rating: Number(course.rating || 0),
      students: Number(course.students || 0),
      trainer: {
        _id: (course as any).trainerId?._id?.toString?.() || "",
        name: (course as any).trainerId?.userId?.name || "Trainer",
        avatar:
          (course as any).trainerId?.userId?.avatar ||
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80",
        specialty: (course as any).trainerId?.specialty || "",
      },
    },
    lessons: lessons.map((lesson: any) => ({
      _id: lesson._id.toString(),
      title: lesson.title,
      videoUrl: lesson.videoUrl,
      duration: lesson.duration,
      order: lesson.order,
    })),
    reviews: reviews.map((review: any) => ({
      _id: review._id.toString(),
      rating: Number(review.rating || 0),
      comment: review.comment,
      user: {
        name: review.userId?.name || "Student",
      },
    })),
  };
}

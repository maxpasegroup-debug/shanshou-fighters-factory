import Booking from "@/models/Booking";
import Course from "@/models/Course";
import Trainer from "@/models/Trainer";
import { connectToDatabase } from "@/lib/mongodb";

export async function getTopTrainers() {
  await connectToDatabase();
  const trainers = await Trainer.find()
    .sort({ rating: -1, createdAt: -1 })
    .limit(8)
    .populate("userId", "name avatar")
    .lean();

  return trainers.map((trainer: any) => ({
    _id: trainer._id.toString(),
    name: trainer.userId?.name || "Trainer",
    photo: trainer.userId?.avatar || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80",
    specialty: trainer.specialty,
    rating: Number(trainer.rating || 0),
    courses: Array.isArray(trainer.courses) ? trainer.courses.length : 0,
  }));
}

export async function getAllTrainers() {
  await connectToDatabase();
  const trainers = await Trainer.find()
    .sort({ rating: -1, createdAt: -1 })
    .populate("userId", "name avatar")
    .lean();

  return trainers.map((trainer: any) => ({
    _id: trainer._id.toString(),
    name: trainer.userId?.name || "Trainer",
    photo: trainer.userId?.avatar || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80",
    specialty: trainer.specialty,
    rating: Number(trainer.rating || 0),
    courses: Array.isArray(trainer.courses) ? trainer.courses.length : 0,
  }));
}

export async function getTrainerProfile(trainerId: string) {
  await connectToDatabase();
  const trainer = await Trainer.findById(trainerId).populate("userId", "name avatar").lean();
  if (!trainer) return null;

  const [courses, sessions] = await Promise.all([
    Course.find({ trainerId: trainer._id }).sort({ createdAt: -1 }).lean(),
    Booking.countDocuments({
      trainerId: trainer._id,
      status: { $in: ["pending", "confirmed"] },
    }),
  ]);

  return {
    _id: trainer._id.toString(),
    name: (trainer as any).userId?.name || "Trainer",
    photo:
      (trainer as any).userId?.avatar ||
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80",
    bio: trainer.bio,
    specialty: trainer.specialty,
    experience: trainer.experience,
    rating: Number(trainer.rating || 0),
    courses: courses.map((course: any) => ({
      _id: course._id.toString(),
      title: course.title,
      rating: Number(course.rating || 0),
      students: Number(course.students || 0),
    })),
    liveSessionsAvailable: sessions,
  };
}

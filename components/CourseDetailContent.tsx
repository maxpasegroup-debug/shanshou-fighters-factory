"use client";

import { useEffect, useState } from "react";

import EnrollButton from "@/components/EnrollButton";
import VideoPlayer from "@/components/VideoPlayer";
import { formatCurrency } from "@/utils/helpers";

type CoursePayload = {
  course: {
    _id: string;
    title: string;
    description: string;
    price: number;
    level: string;
    category: string;
    trainerId?: {
      userId?: {
        name?: string;
      };
      specialty?: string;
    };
  };
  lessons: Array<{ _id: string; title: string; videoUrl: string }>;
};

type ReviewItem = {
  _id: string;
  rating: number;
  comment: string;
  userId?: { name?: string };
};

export default function CourseDetailContent({ courseId }: { courseId: string }) {
  const [courseData, setCourseData] = useState<CoursePayload | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const [courseRes, reviewsRes] = await Promise.all([
          fetch(`/api/courses/${courseId}`, { cache: "no-store" }),
          fetch(`/api/reviews/${courseId}`, { cache: "no-store" }),
        ]);
        if (!courseRes.ok) throw new Error("Course unavailable");
        const courseJson = (await courseRes.json()) as CoursePayload;
        const reviewsJson = reviewsRes.ok ? ((await reviewsRes.json()) as ReviewItem[]) : [];
        if (mounted) {
          setCourseData(courseJson);
          setReviews(reviewsJson);
        }
      } catch {
        if (mounted) setError("Failed to load course details.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [courseId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="glass-card h-28 animate-pulse" />
        <div className="glass-card h-24 animate-pulse" />
        <div className="glass-card h-64 animate-pulse" />
      </div>
    );
  }

  if (error || !courseData?.course) {
    return <div className="glass-card p-4 text-sm text-red-300">{error || "Course not found."}</div>;
  }

  const { course, lessons } = courseData;

  return (
    <div className="space-y-5">
      <section className="glass-card warrior-gradient p-6">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <p className="mt-2 text-sm text-orange-100">
          {course.level} - {course.category} - {formatCurrency(course.price)}
        </p>
        <EnrollButton courseId={course._id} courseTitle={course.title} amount={course.price} />
      </section>

      <section className="glass-card p-4">
        <h2 className="font-semibold">Trainer Profile</h2>
        <p className="mt-1 text-sm text-zinc-400">
          {course.trainerId?.userId?.name || "Trainer"}
          {course.trainerId?.specialty ? ` - ${course.trainerId.specialty}` : ""}
        </p>
      </section>

      <section className="glass-card p-4">
        <h2 className="font-semibold">Course Description</h2>
        <p className="mt-2 text-sm text-zinc-300">{course.description}</p>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Curriculum & Video Player</h2>
        <VideoPlayer courseId={course._id} lessons={lessons} />
      </section>

      <section className="glass-card p-4">
        <h2 className="font-semibold">Reviews</h2>
        {reviews.length ? (
          <div className="mt-2 space-y-2">
            {reviews.map((review) => (
              <div key={review._id} className="rounded-lg border border-white/10 p-3 text-sm">
                <p className="text-yellow-400">★ {review.rating.toFixed(1)}</p>
                <p className="mt-1 text-zinc-200">{review.comment}</p>
                <p className="mt-1 text-xs text-zinc-400">- {review.userId?.name || "Student"}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-zinc-400">No reviews yet.</p>
        )}
      </section>
    </div>
  );
}

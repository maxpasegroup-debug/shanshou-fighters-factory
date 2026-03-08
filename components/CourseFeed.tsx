"use client";

import { useEffect, useMemo, useState } from "react";

import CourseCard from "@/components/CourseCard";

type CourseItem = {
  _id: string;
  title: string;
  thumbnail: string;
  price: number;
  rating: number;
  trainerId?: {
    userId?: {
      name?: string;
    };
  };
};

type CourseFeedProps = {
  limit?: number;
};

export default function CourseFeed({ limit }: CourseFeedProps) {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/courses", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load courses");
        const json = (await response.json()) as CourseItem[];
        if (mounted) setCourses(json);
      } catch {
        if (mounted) setError("Unable to load courses right now.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  const normalized = useMemo(
    () =>
      courses.slice(0, limit ?? courses.length).map((course) => ({
        _id: course._id,
        title: course.title,
        thumbnail: course.thumbnail,
        rating: Number(course.rating || 0),
        price: Number(course.price || 0),
        trainer: course.trainerId?.userId?.name || "Trainer",
      })),
    [courses, limit],
  );

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: limit || 4 }).map((_, index) => (
          <div key={index} className="glass-card h-56 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-4 text-sm">
        <p className="text-red-300">{error}</p>
        <button
          className="mt-2 rounded-lg border border-white/20 px-3 py-1 text-xs"
          onClick={() => location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!normalized.length) {
    return <p className="text-sm text-zinc-400">No courses available yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {normalized.map((course) => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  );
}

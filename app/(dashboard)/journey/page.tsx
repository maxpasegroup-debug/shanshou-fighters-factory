"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import ProgressBar from "@/components/ProgressBar";
import { journeyPaths as defaultPaths } from "@/modules/journey";

type MyCourseItem = {
  enrollmentId: string;
  courseId: string;
  title: string;
  category: string;
  track: "mind" | "body" | "emotion";
  progress: number;
  completedLessons: number;
  totalLessons: number;
};

export default function JourneyPage() {
  const [items, setItems] = useState<MyCourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const response = await fetch("/api/mycourses", { cache: "no-store" });
        if (!response.ok) throw new Error("No data");
        const json = (await response.json()) as MyCourseItem[];
        if (mounted) setItems(json);
      } catch {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  const grouped = useMemo(() => {
    return defaultPaths.map((path) => {
      const pathItems = items.filter((item) => item.track === path.key);
      const progress = pathItems.length
        ? Math.round(pathItems.reduce((sum, item) => sum + item.progress, 0) / pathItems.length)
        : 0;

      return {
        ...path,
        progress,
        courses: pathItems,
      };
    });
  }, [items]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="glass-card h-44 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Learning Journey</h1>
      <p className="text-sm text-zinc-400">Track your progress through Mind, Body, and Emotion paths.</p>

      {grouped.map((path) => (
        <div key={path.key} className="glass-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{path.title}</h2>
            <span className="text-xs text-zinc-400">{path.progress}%</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={path.progress} />
          </div>
          <div className="mt-4 space-y-3">
            {(path.courses.length ? path.courses.map((course) => course.title) : path.milestones).map(
              (milestone, index) => (
              <motion.div
                key={milestone}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="relative flex items-center gap-2 text-sm"
              >
                {index > 0 ? (
                  <span className="absolute -top-4 left-[5px] h-4 w-[2px] bg-orange-500/50 shadow-[0_0_8px_rgba(255,60,0,0.75)]" />
                ) : null}
                <span className="h-3 w-3 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(255,60,0,0.75)]" />
                {milestone}
              </motion.div>
              ),
            )}
            {path.courses.length ? (
              <p className="text-xs text-zinc-400">
                {path.courses.reduce((acc, course) => acc + course.completedLessons, 0)} lessons completed
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

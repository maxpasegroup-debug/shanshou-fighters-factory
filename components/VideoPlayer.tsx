"use client";

import { useEffect, useMemo, useState } from "react";

type Lesson = {
  _id: string;
  title: string;
  videoUrl: string;
};

type VideoPlayerProps = {
  courseId: string;
  lessons: Lesson[];
};

export default function VideoPlayer({ courseId, lessons }: VideoPlayerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);

  const activeLesson = useMemo(() => lessons[activeIndex], [lessons, activeIndex]);

  useEffect(() => {
    if (activeIndex > lessons.length - 1) setActiveIndex(0);
  }, [activeIndex, lessons.length]);

  if (!lessons.length) {
    return <div className="glass-card p-4 text-sm text-zinc-400">No lessons uploaded yet.</div>;
  }

  const markCompleted = async (lessonId: string) => {
    if (completed.includes(lessonId)) return;
    setCompleted((prev) => [...prev, lessonId]);
    await fetch("/api/enroll", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, lessonId }),
    });
  };

  return (
    <div className="space-y-4">
      <div className="glass-card overflow-hidden">
        <video
          key={activeLesson._id}
          controls
          autoPlay
          className="aspect-video w-full"
          src={activeLesson.videoUrl}
          onEnded={async () => {
            await markCompleted(activeLesson._id);
            if (activeIndex < lessons.length - 1) setActiveIndex((index) => index + 1);
          }}
        />
      </div>
      <div className="space-y-2">
        {lessons.map((lesson, index) => (
          <button
            key={lesson._id}
            onClick={() => setActiveIndex(index)}
            className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
              activeIndex === index
                ? "border-orange-500 bg-orange-500/10 text-white"
                : "border-white/10 text-zinc-300"
            }`}
          >
            {index + 1}. {lesson.title}
            {completed.includes(lesson._id) ? <span className="ml-2 text-xs text-emerald-400">Done</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

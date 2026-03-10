"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import CourseCard from "@/components/CourseCard";
import TrainerCard from "@/components/TrainerCard";
import { cn } from "@/utils/helpers";
import { DEMO_COURSES, DEMO_EXPERTS } from "@/lib/demo-training";

const CATEGORIES = [
  "All",
  "Kickboxing",
  "MMA",
  "Karate",
  "Muay Thai",
  "Self Defence",
  "BJJ",
  "Fitness",
  "Mental Strength",
];

function popularityScore(c: (typeof DEMO_COURSES)[number]) {
  return (c.students ?? 0) + (c.rating ?? 0) * 5;
}

function expertScore(t: (typeof DEMO_EXPERTS)[number]) {
  return (t.rating ?? 0) + (t.courses ?? 0) * 0.5;
}

export default function TrainingHubPage() {
  const [mode, setMode] = useState<"courses" | "experts">("courses");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filteredCourses = useMemo(() => {
    let list = DEMO_COURSES;
    if (category !== "All") list = list.filter((c) => c.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.trainer ?? "").toLowerCase().includes(q) ||
          (c.category ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [category, search]);

  const filteredExperts = useMemo(() => {
    let list = DEMO_EXPERTS;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) || (t.specialty ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [search]);

  const trendingCourses = useMemo(
    () => [...DEMO_COURSES].sort((a, b) => popularityScore(b) - popularityScore(a)).slice(0, 6),
    [],
  );

  const topExperts = useMemo(
    () => [...DEMO_EXPERTS].sort((a, b) => expertScore(b) - expertScore(a)).slice(0, 6),
    [],
  );

  const featuredCourse = useMemo(
    () => DEMO_COURSES.find((c) => c.title.includes("Conditioning")) ?? DEMO_COURSES[0],
    [],
  );
  const featuredTrainer = DEMO_EXPERTS[0];

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Training</h1>
        <p className="text-sm text-zinc-400">Choose how you want to train</p>
        <div className="glass-card flex items-center gap-2 px-3 py-2">
          <span className="text-zinc-500">⌕</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses, experts or fighting styles"
            className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
          />
        </div>
      </header>

      {/* Training Mode Selector */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <motion.button
          type="button"
          onClick={() => setMode("courses")}
          className={cn(
            "glass-card flex flex-col items-start gap-2 p-4 text-left transition",
            mode === "courses" && "ring-2 ring-[#ff3c00] ring-offset-2 ring-offset-[#0a0a0a]",
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-2xl">📚</span>
          <h2 className="font-semibold">Train by Courses</h2>
          <p className="text-xs text-zinc-400">
            Follow structured martial arts programs
          </p>
        </motion.button>
        <motion.button
          type="button"
          onClick={() => setMode("experts")}
          className={cn(
            "glass-card flex flex-col items-start gap-2 p-4 text-left transition",
            mode === "experts" && "ring-2 ring-[#ff3c00] ring-offset-2 ring-offset-[#0a0a0a]",
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-2xl">🥋</span>
          <h2 className="font-semibold">Train by Experts</h2>
          <p className="text-xs text-zinc-400">
            Learn directly from world-class trainers
          </p>
        </motion.button>
      </section>

      {/* Featured Training */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(255,60,0,0.2)]"
      >
        <div className="relative aspect-[2.2/1] w-full min-h-[180px]">
          <Image
            src="https://images.unsplash.com/photo-1549570652-97324981a6fd?w=1200&q=80"
            alt="Featured"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-bold">30 Day Fighter Conditioning</h3>
            <p className="text-sm text-orange-200">{featuredTrainer.name}</p>
            <Link
              href={`/course/${featuredCourse._id}`}
              className="mt-3 inline-block rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2 text-sm font-semibold"
            >
              Start Training
            </Link>
          </div>
        </div>
      </motion.section>

      <AnimatePresence mode="wait">
        {mode === "courses" ? (
          <motion.div
            key="courses"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-xs transition",
                    category === cat
                      ? "border-transparent bg-gradient-to-r from-orange-500 to-red-600 text-white"
                      : "border-white/15 text-zinc-400",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Course Explorer */}
            <section>
              <h2 className="mb-3 text-lg font-semibold">Course Explorer</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {filteredCourses.map((course) => (
                  <motion.div key={course._id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                    <CourseCard
                      course={{
                      _id: course._id,
                      title: course.title,
                      thumbnail: course.thumbnail,
                      trainer: course.trainer,
                      rating: course.rating,
                      price: course.price,
                      duration: course.duration,
                      level: course.level,
                    }}
                    />
                  </motion.div>
                ))}
              </div>
              {filteredCourses.length === 0 && (
                <p className="py-8 text-center text-sm text-zinc-500">No courses match your search.</p>
              )}
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="experts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold">Expert Explorer</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredExperts.map((trainer) => (
                <motion.div key={trainer._id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <TrainerCard trainer={trainer} actionLabel="View Programs" />
                </motion.div>
              ))}
            </div>
            {filteredExperts.length === 0 && (
              <p className="py-8 text-center text-sm text-zinc-500">No experts match your search.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trending Programs */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="space-y-3"
      >
        <h2 className="text-lg font-semibold">Trending Programs</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {trendingCourses.map((course) => (
            <motion.div key={course._id} className="w-[260px] shrink-0" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <CourseCard
                course={{
                  _id: course._id,
                  title: course.title,
                  thumbnail: course.thumbnail,
                  trainer: course.trainer,
                  rating: course.rating,
                  price: course.price,
                  duration: course.duration,
                  level: course.level,
                }}
              />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Top Experts */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="space-y-3"
      >
        <h2 className="text-lg font-semibold">Top Experts</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topExperts.map((trainer) => (
            <motion.div key={trainer._id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <TrainerCard trainer={trainer} actionLabel="View Programs" />
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import CourseCard from "@/components/CourseCard";
import TrainerCard from "@/components/TrainerCard";
import { cn } from "@/utils/helpers";

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

const DEMO_COURSES = [
  { _id: "c1", title: "Kickboxing Fundamentals", trainer: "Coach Daniel Reyes", duration: "6 Weeks", category: "Kickboxing", level: "Beginner", rating: 4.7, price: 89, thumbnail: "https://images.unsplash.com/photo-1549570652-97324981a6fd?w=400&q=80", students: 240 },
  { _id: "c2", title: "MMA Combat Basics", trainer: "Alex Volkov", duration: "8 Weeks", category: "MMA", level: "Beginner", rating: 4.6, price: 99, thumbnail: "https://images.unsplash.com/photo-1583468982228-19f19164aee6?w=400&q=80", students: 180 },
  { _id: "c3", title: "Karate Discipline Program", trainer: "Sensei Hiro Tanaka", duration: "10 Weeks", category: "Karate", level: "All levels", rating: 4.8, price: 79, thumbnail: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=400&q=80", students: 120 },
  { _id: "c4", title: "Muay Thai Striking System", trainer: "Kru Chai Sak", duration: "7 Weeks", category: "Muay Thai", level: "Intermediate", rating: 4.9, price: 109, thumbnail: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80", students: 200 },
  { _id: "c5", title: "Street Self Defence Mastery", trainer: "Coach Marco Silva", duration: "5 Weeks", category: "Self Defence", level: "Beginner", rating: 4.6, price: 69, thumbnail: "https://images.unsplash.com/photo-1616279969856-759f316a5ac1?w=400&q=80", students: 310 },
  { _id: "c6", title: "Brazilian Jiu-Jitsu Foundations", trainer: "Rafael Costa", duration: "9 Weeks", category: "BJJ", level: "Beginner", rating: 4.8, price: 119, thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80", students: 95 },
  { _id: "c7", title: "Fighter Strength Conditioning", trainer: "Coach Tyler Grant", duration: "6 Weeks", category: "Fitness", level: "All levels", rating: 4.7, price: 59, thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80", students: 280 },
  { _id: "c8", title: "Meditation for Fighters", trainer: "Dr. Aisha Rahman", duration: "4 Weeks", category: "Mental Strength", level: "All levels", rating: 4.8, price: 49, thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80", students: 150 },
  { _id: "c9", title: "Combat Agility Training", trainer: "Coach Ivan Petrov", duration: "5 Weeks", category: "Fitness", level: "Intermediate", rating: 4.7, price: 79, thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80", students: 110 },
  { _id: "c10", title: "Advanced Kickboxing Combinations", trainer: "Coach Daniel Reyes", duration: "8 Weeks", category: "Kickboxing", level: "Advanced", rating: 4.9, price: 129, thumbnail: "https://images.unsplash.com/photo-1549570652-97324981a6fd?w=400&q=80", students: 85 },
];

const DEMO_EXPERTS = [
  { _id: "t1", name: "Master Chen Wei", photo: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&q=80", specialty: "Sanshou & Kickboxing", rating: 4.9, courses: 6, yearsExperience: 20 },
  { _id: "t2", name: "Sensei Hiro Tanaka", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80", specialty: "Karate Master", rating: 4.8, courses: 5, yearsExperience: 25 },
  { _id: "t3", name: "Coach Daniel Reyes", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80", specialty: "Kickboxing Champion", rating: 4.7, courses: 4, yearsExperience: 15 },
  { _id: "t4", name: "Kru Chai Sak", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", specialty: "Muay Thai Trainer", rating: 4.9, courses: 3, yearsExperience: 18 },
  { _id: "t5", name: "Alex Volkov", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80", specialty: "MMA Fighter", rating: 4.6, courses: 4, yearsExperience: 12 },
  { _id: "t6", name: "Rafael Costa", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80", specialty: "BJJ Black Belt", rating: 4.8, courses: 3, yearsExperience: 14 },
  { _id: "t7", name: "Coach Tyler Grant", photo: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=200&q=80", specialty: "Combat Strength Coach", rating: 4.7, courses: 5, yearsExperience: 10 },
  { _id: "t8", name: "Dr. Aisha Rahman", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", specialty: "Mental Performance Coach", rating: 4.8, courses: 2, yearsExperience: 12 },
  { _id: "t9", name: "Coach Marco Silva", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80", specialty: "Self Defence Expert", rating: 4.6, courses: 4, yearsExperience: 16 },
  { _id: "t10", name: "Coach Ivan Petrov", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80", specialty: "Combat Conditioning Trainer", rating: 4.7, courses: 3, yearsExperience: 11 },
];

function popularityScore(c: (typeof DEMO_COURSES)[0]) {
  return (c.students ?? 0) + (c.rating ?? 0) * 5;
}

function expertScore(t: (typeof DEMO_EXPERTS)[0]) {
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

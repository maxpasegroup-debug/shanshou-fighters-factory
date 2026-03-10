"use client";

import { useEffect, useMemo, useState } from "react";

import TrainerCard from "@/components/TrainerCard";

const filters = ["All", "Kickboxing", "MMA", "Fitness", "Meditation"];

type TrainerItem = {
  _id: string;
  specialty: string;
  rating: number;
  courses: string[];
  userId?: {
    name?: string;
    avatar?: string;
  };
};

type FallbackTrainer = {
  _id: string;
  name: string;
  photo: string;
  specialty: string;
  rating: number;
  courses: number;
  yearsExperience?: number;
};

type TrainerFeedProps = {
  /** Used when API returns no trainers (e.g. demo data from training module). */
  fallbackTrainers?: FallbackTrainer[];
};

export default function TrainerFeed({ fallbackTrainers }: TrainerFeedProps) {
  const [trainers, setTrainers] = useState<TrainerItem[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/trainers", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch trainers");
        const json = (await response.json()) as TrainerItem[];
        if (mounted) setTrainers(json);
      } catch {
        if (mounted) setError("Unable to load experts right now.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  const fromApi = useMemo(
    () =>
      trainers.map((trainer) => ({
        _id: trainer._id,
        name: trainer.userId?.name || "Trainer",
        photo:
          trainer.userId?.avatar ||
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80",
        specialty: trainer.specialty,
        rating: Number(trainer.rating || 0),
        courses: Array.isArray(trainer.courses) ? trainer.courses.length : 0,
      })),
    [trainers],
  );

  const normalized = useMemo(() => {
    const list = fromApi.length ? fromApi : fallbackTrainers ?? [];
    return list.filter((trainer) =>
      activeFilter === "All"
        ? true
        : trainer.specialty.toLowerCase().includes(activeFilter.toLowerCase()),
    );
  }, [fromApi, fallbackTrainers, activeFilter]);

  if (loading) {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="glass-card h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error && !fallbackTrainers?.length) {
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

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`rounded-full border px-3 py-1 text-xs ${
              activeFilter === filter
                ? "warrior-gradient border-transparent text-white"
                : "border-white/15 text-zinc-300"
            }`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {normalized.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {normalized.map((trainer) => (
            <TrainerCard key={trainer._id} trainer={trainer} actionLabel="View Programs" />
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-400">No trainers match this filter yet.</p>
      )}
    </div>
  );
}

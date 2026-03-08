"use client";

import { useEffect, useState } from "react";

type Analytics = {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
};

type PendingTrainer = {
  _id: string;
  specialty: string;
  userId?: {
    name?: string;
    email?: string;
  };
};

type CourseItem = {
  _id: string;
  title: string;
};

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [pendingTrainers, setPendingTrainers] = useState<PendingTrainer[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [status, setStatus] = useState("");

  const loadData = async () => {
    const [analyticsRes, trainersRes, coursesRes] = await Promise.all([
      fetch("/api/admin/analytics", { cache: "no-store" }),
      fetch("/api/admin/trainers", { cache: "no-store" }),
      fetch("/api/courses", { cache: "no-store" }),
    ]);

    if (analyticsRes.ok) setAnalytics((await analyticsRes.json()) as Analytics);
    if (trainersRes.ok) setPendingTrainers((await trainersRes.json()) as PendingTrainer[]);
    if (coursesRes.ok) {
      const raw = (await coursesRes.json()) as Array<{ _id: string; title: string }>;
      setCourses(raw.map((item) => ({ _id: item._id, title: item.title })));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h2 className="font-semibold">Analytics</h2>
        <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg border border-white/10 p-3">
            <p className="text-zinc-400">Users</p>
            <p className="text-lg font-semibold">{analytics?.totalUsers || 0}</p>
          </div>
          <div className="rounded-lg border border-white/10 p-3">
            <p className="text-zinc-400">Courses</p>
            <p className="text-lg font-semibold">{analytics?.totalCourses || 0}</p>
          </div>
          <div className="rounded-lg border border-white/10 p-3">
            <p className="text-zinc-400">Revenue</p>
            <p className="text-lg font-semibold">${Math.round(analytics?.totalRevenue || 0)}</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-4">
        <h2 className="font-semibold">Approve Trainers</h2>
        <div className="mt-2 space-y-2 text-sm">
          {pendingTrainers.length ? (
            pendingTrainers.map((trainer) => (
              <div
                key={trainer._id}
                className="flex items-center justify-between rounded-lg border border-white/10 p-2"
              >
                <div>
                  <p>{trainer.userId?.name || "Trainer"}</p>
                  <p className="text-xs text-zinc-400">{trainer.specialty}</p>
                </div>
                <button
                  onClick={async () => {
                    await fetch("/api/admin/trainers", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ trainerId: trainer._id, approved: true }),
                    });
                    setStatus("Trainer approved");
                    loadData();
                  }}
                  className="rounded-lg bg-orange-600 px-3 py-1 text-xs"
                >
                  Approve
                </button>
              </div>
            ))
          ) : (
            <p className="text-zinc-400">No pending trainer approvals.</p>
          )}
        </div>
      </div>

      <div className="glass-card p-4">
        <h2 className="font-semibold">Delete Courses</h2>
        <div className="mt-2 space-y-2 text-sm">
          {courses.slice(0, 8).map((course) => (
            <div key={course._id} className="flex items-center justify-between rounded-lg border border-white/10 p-2">
              <p className="line-clamp-1">{course.title}</p>
              <button
                onClick={async () => {
                  await fetch(`/api/admin/courses/${course._id}`, { method: "DELETE" });
                  setStatus("Course deleted");
                  loadData();
                }}
                className="rounded-lg border border-red-400/40 px-3 py-1 text-xs text-red-300"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-zinc-400">{status}</p>
      </div>
    </div>
  );
}

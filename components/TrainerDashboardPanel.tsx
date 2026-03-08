"use client";

import { FormEvent, useState } from "react";

type CreatedCourse = {
  _id: string;
  title: string;
};

export default function TrainerDashboardPanel() {
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    thumbnail: "",
    price: 0,
    level: "Beginner",
    category: "Kickboxing",
  });
  const [lessonForm, setLessonForm] = useState({
    courseId: "",
    title: "",
    duration: 5,
    order: 1,
    videoUrl: "",
  });
  const [courses, setCourses] = useState<CreatedCourse[]>([]);
  const [message, setMessage] = useState("Ready");
  const [uploading, setUploading] = useState(false);

  const loadMyCourses = async () => {
    const response = await fetch("/api/courses?mine=1", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as Array<{ _id: string; title: string }>;
    setCourses(data.map((item) => ({ _id: item._id, title: item.title })));
  };

  const createCourse = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("Saving...");

    const response = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(courseForm),
    });

    if (!response.ok) {
      setMessage("Unable to create course");
      return;
    }

    const created = (await response.json()) as CreatedCourse;
    setMessage("Course created");
    setCourseForm({
      title: "",
      description: "",
      thumbnail: "",
      price: 0,
      level: "Beginner",
      category: "Kickboxing",
    });
    setLessonForm((prev) => ({ ...prev, courseId: created._id }));
    await loadMyCourses();
  };

  const uploadMedia = async (file: File, type: "image" | "video") => {
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Read error"));
      reader.readAsDataURL(file);
    });

    const response = await fetch("/api/courses/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: dataUrl, type }),
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }
    const json = (await response.json()) as { secure_url?: string };
    if (!json.secure_url) throw new Error("Missing uploaded URL");
    return json.secure_url;
  };

  const createLesson = async (event: FormEvent) => {
    event.preventDefault();
    if (!lessonForm.courseId) {
      setMessage("Select a course first.");
      return;
    }
    setMessage("Saving lesson...");
    const response = await fetch(`/api/courses/${lessonForm.courseId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: lessonForm.title,
        videoUrl: lessonForm.videoUrl,
        duration: lessonForm.duration,
        order: lessonForm.order,
      }),
    });

    if (!response.ok) {
      setMessage("Unable to create lesson");
      return;
    }
    setMessage("Lesson created");
    setLessonForm((prev) => ({
      ...prev,
      title: "",
      videoUrl: "",
      duration: 5,
      order: prev.order + 1,
    }));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={createCourse} className="glass-card space-y-3 p-4">
        <h2 className="font-semibold">Create Course</h2>
        <input
          className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
          placeholder="Course title"
          value={courseForm.title}
          onChange={(event) => setCourseForm((p) => ({ ...p, title: event.target.value }))}
          required
        />
        <textarea
          className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
          placeholder="Description"
          value={courseForm.description}
          onChange={(event) => setCourseForm((p) => ({ ...p, description: event.target.value }))}
          required
        />
        <input
          className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
          placeholder="Thumbnail URL (Cloudinary)"
          value={courseForm.thumbnail}
          onChange={(event) => setCourseForm((p) => ({ ...p, thumbnail: event.target.value }))}
          required
        />
        <input
          type="file"
          accept="image/*"
          className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setUploading(true);
            setMessage("Uploading thumbnail...");
            try {
              const url = await uploadMedia(file, "image");
              setCourseForm((p) => ({ ...p, thumbnail: url }));
              setMessage("Thumbnail uploaded");
            } catch {
              setMessage("Thumbnail upload failed");
            } finally {
              setUploading(false);
            }
          }}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            className="rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
            placeholder="Price"
            type="number"
            value={courseForm.price}
            onChange={(event) => setCourseForm((p) => ({ ...p, price: Number(event.target.value) }))}
            required
          />
          <input
            className="rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
            placeholder="Level"
            value={courseForm.level}
            onChange={(event) => setCourseForm((p) => ({ ...p, level: event.target.value }))}
            required
          />
        </div>
        <input
          className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
          placeholder="Category"
          value={courseForm.category}
          onChange={(event) => setCourseForm((p) => ({ ...p, category: event.target.value }))}
          required
        />
        <button className="warrior-gradient rounded-lg px-4 py-2 text-sm font-semibold">
          {uploading ? "Uploading..." : "Create Course"}
        </button>
        <p className="text-xs text-zinc-400">{message}</p>
      </form>

      <form onSubmit={createLesson} className="glass-card space-y-3 p-4">
        <h2 className="font-semibold">Add Lesson</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadMyCourses}
            className="rounded-lg border border-white/20 px-3 py-2 text-xs"
          >
            Load My Courses
          </button>
          <select
            value={lessonForm.courseId}
            onChange={(event) => setLessonForm((prev) => ({ ...prev, courseId: event.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm"
            required
          >
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <input
          className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
          placeholder="Lesson title"
          value={lessonForm.title}
          onChange={(event) => setLessonForm((p) => ({ ...p, title: event.target.value }))}
          required
        />
        <input
          className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
          placeholder="Video URL (Cloudinary)"
          value={lessonForm.videoUrl}
          onChange={(event) => setLessonForm((p) => ({ ...p, videoUrl: event.target.value }))}
          required
        />
        <input
          type="file"
          accept="video/*"
          className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setUploading(true);
            setMessage("Uploading video...");
            try {
              const url = await uploadMedia(file, "video");
              setLessonForm((p) => ({ ...p, videoUrl: url }));
              setMessage("Video uploaded");
            } catch {
              setMessage("Video upload failed");
            } finally {
              setUploading(false);
            }
          }}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            className="rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
            placeholder="Duration (minutes)"
            value={lessonForm.duration}
            onChange={(event) => setLessonForm((p) => ({ ...p, duration: Number(event.target.value) }))}
            min={1}
            required
          />
          <input
            type="number"
            className="rounded-lg border border-white/10 bg-black/40 p-2 text-sm outline-none"
            placeholder="Order"
            value={lessonForm.order}
            onChange={(event) => setLessonForm((p) => ({ ...p, order: Number(event.target.value) }))}
            min={1}
            required
          />
        </div>
        <button className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold">Add Lesson</button>
      </form>

      <div className="glass-card p-4">
        <h2 className="font-semibold">Manage Pricing</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Update course price from dashboard and enable premium live session tiers.
        </p>
      </div>
    </div>
  );
}

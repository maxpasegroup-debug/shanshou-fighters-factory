import { notFound } from "next/navigation";

import BookSessionForm from "@/components/BookSessionForm";
import { getTrainerProfile } from "@/modules/trainer";

type TrainerPageProps = {
  params: { trainerId: string };
};

export default async function TrainerProfilePage({ params }: TrainerPageProps) {
  const trainer = await getTrainerProfile(params.trainerId);
  if (!trainer) notFound();

  return (
    <div className="space-y-4">
      <div className="glass-card p-5">
        <h1 className="text-2xl font-bold">{trainer.name}</h1>
        <p className="mt-2 text-sm text-zinc-300">{trainer.bio}</p>
      </div>

      <div className="glass-card p-4">
        <h2 className="font-semibold">Courses</h2>
        {trainer.courses.length ? (
          <div className="mt-2 space-y-2 text-sm text-zinc-300">
            {trainer.courses.map((course) => (
              <p key={course._id}>
                {course.title} - ★ {course.rating.toFixed(1)} - {course.students} students
              </p>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-zinc-400">No published courses yet.</p>
        )}
      </div>

      <div className="glass-card p-4">
        <h2 className="font-semibold">Ratings</h2>
        <p className="mt-2 text-sm text-yellow-400">
          {trainer.rating.toFixed(1)}/5 · {trainer.specialty} · {trainer.experience} years experience
        </p>
      </div>

      <div className="glass-card p-4">
        <h2 className="font-semibold">Live Sessions</h2>
        <p className="mt-2 text-sm text-zinc-300">
          {trainer.liveSessionsAvailable} upcoming live sessions are currently open for booking.
        </p>
        <BookSessionForm trainerId={trainer._id} />
      </div>
    </div>
  );
}

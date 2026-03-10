import Link from "next/link";
import Image from "next/image";

type TrainerCardProps = {
  trainer: {
    _id: string;
    name: string;
    photo: string;
    specialty: string;
    rating: number;
    courses: number;
    yearsExperience?: number;
  };
  actionLabel?: string;
};

export default function TrainerCard({ trainer, actionLabel = "Book Session" }: TrainerCardProps) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3">
        <Image
          src={trainer.photo}
          alt={trainer.name}
          width={56}
          height={56}
          className="rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{trainer.name}</p>
          <p className="text-xs text-zinc-400">{trainer.specialty}</p>
          <p className="text-xs text-yellow-400">★ {trainer.rating.toFixed(1)}</p>
          {trainer.yearsExperience != null ? (
            <p className="text-xs text-zinc-500">{trainer.yearsExperience} years experience</p>
          ) : null}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-zinc-400">{trainer.courses} programs</p>
        <Link
          href={`/trainer/${trainer._id}`}
          className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-medium"
        >
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}

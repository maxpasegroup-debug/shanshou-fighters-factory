import Link from "next/link";
import Image from "next/image";

import { formatCurrency } from "@/utils/helpers";

type CourseCardProps = {
  course: {
    _id: string;
    title: string;
    thumbnail: string;
    trainer?: string;
    rating: number;
    price?: number;
    duration?: string;
    level?: string;
  };
};

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/course/${course._id}`} className="glass-card overflow-hidden">
      <div className="relative h-36">
        <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
      </div>
      <div className="space-y-1 p-3">
        <h3 className="line-clamp-1 font-semibold">{course.title}</h3>
        <p className="text-xs text-zinc-400">{course.trainer || "Trainer"}</p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
          <span className="text-yellow-400">★ {course.rating.toFixed(1)}</span>
          {course.duration ? <span className="text-zinc-400">{course.duration}</span> : null}
          {course.level ? <span className="text-zinc-400">{course.level}</span> : null}
          {course.price != null ? <span>{formatCurrency(course.price)}</span> : null}
        </div>
      </div>
    </Link>
  );
}

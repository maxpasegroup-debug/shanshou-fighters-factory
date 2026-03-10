import HeroBanner from "@/components/HeroBanner";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import nextDynamic from "next/dynamic";

import { getFeaturedDemoCourses, getFeaturedDemoExperts } from "@/lib/demo-training";

export const dynamic = "force-dynamic";

const CourseFeed = nextDynamic(() => import("@/components/CourseFeed"), {
  ssr: false,
});
const TrainerFeed = nextDynamic(() => import("@/components/TrainerFeed"), {
  ssr: false,
});

const featuredCourses = getFeaturedDemoCourses(8);
const featuredTrainers = getFeaturedDemoExperts(8);

export default function HomeDashboardPage() {
  return (
    <div className="space-y-6">
      <HeroBanner />
      <SearchBar />
      <CategoryTabs />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Featured Courses</h2>
        <CourseFeed limit={8} fallbackCourses={featuredCourses} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Top Trainers</h2>
        <TrainerFeed fallbackTrainers={featuredTrainers} />
      </section>
    </div>
  );
}

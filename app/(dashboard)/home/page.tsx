import HeroBanner from "@/components/HeroBanner";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const CourseFeed = nextDynamic(() => import("@/components/CourseFeed"), {
  ssr: false,
});
const TrainerFeed = nextDynamic(() => import("@/components/TrainerFeed"), {
  ssr: false,
});

export default function HomeDashboardPage() {

  return (
    <div className="space-y-6">
      <HeroBanner />
      <SearchBar />
      <CategoryTabs />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Featured Course</h2>
        <CourseFeed limit={8} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Top Trainers</h2>
        <TrainerFeed />
      </section>
    </div>
  );
}

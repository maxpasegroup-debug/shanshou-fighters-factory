import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";
const CourseFeed = nextDynamic(() => import("@/components/CourseFeed"), { ssr: false });

export default function MarketplacePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Course Marketplace</h1>
      <p className="text-sm text-zinc-400">
        Discover combat programs from elite trainers worldwide.
      </p>
      <CourseFeed />
    </div>
  );
}

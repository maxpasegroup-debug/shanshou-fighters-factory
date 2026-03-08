import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";
const TrainerFeed = nextDynamic(() => import("@/components/TrainerFeed"), { ssr: false });

export default function ExpertsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Trainer Marketplace</h1>
      <p className="text-sm text-zinc-400">Book live sessions with battle-tested masters.</p>
      <TrainerFeed />
    </div>
  );
}

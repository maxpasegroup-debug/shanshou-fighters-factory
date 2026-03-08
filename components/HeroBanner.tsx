import Link from "next/link";

export default function HeroBanner() {
  return (
    <section className="glass-card warrior-gradient p-6">
      <p className="text-xs uppercase tracking-wide text-orange-100">Global Martial Arts Academy</p>
      <h1 className="mt-2 text-2xl font-bold md:text-4xl">Sanshou - The Fighters&apos; Factory</h1>
      <p className="mt-3 max-w-xl text-sm text-orange-100/90">
        Train with elite masters, build your journey, and evolve your mind, body, and emotion.
      </p>
      <div className="mt-4 flex gap-3">
        <Link href="/marketplace" className="rounded-lg bg-black/70 px-4 py-2 text-sm font-semibold">
          Start Learning
        </Link>
        <Link href="/experts" className="rounded-lg border border-white/30 px-4 py-2 text-sm">
          Find a Trainer
        </Link>
      </div>
    </section>
  );
}

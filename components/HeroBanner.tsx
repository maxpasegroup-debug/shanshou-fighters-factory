import Image from "next/image";
import Link from "next/link";

export default function HeroBanner() {
  return (
    <section className="glass-card warrior-gradient flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-orange-100">Global Martial Arts Academy</p>
        <h1 className="mt-2 text-2xl font-bold md:text-4xl">Sanshou – The Fighters&apos; Hub</h1>
        <p className="mt-3 max-w-xl text-sm text-orange-100/90">
          Stream structured fight programs or train directly with world-class experts. One hub for your
          Sanshou evolution.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/dashboard/training"
            className="rounded-lg bg-black/70 px-4 py-2 text-sm font-semibold shadow-[0_0_18px_rgba(0,0,0,0.6)]"
          >
            Enter Training Hub
          </Link>
          <Link
            href="/journey"
            className="rounded-lg border border-white/30 px-4 py-2 text-sm"
          >
            View Your Journey
          </Link>
        </div>
      </div>
      <div className="relative hidden h-28 w-28 shrink-0 md:block">
        <div className="absolute inset-0 rounded-full bg-black/40" />
        <Image
          src="/sanshou-logo.png"
          alt="Sanshou logo"
          fill
          className="rounded-full object-cover ring-4 ring-orange-500/80 shadow-[0_0_35px_rgba(255,106,0,0.8)]"
        />
      </div>
    </section>
  );
}

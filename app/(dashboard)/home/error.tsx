"use client";

export default function HomeError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="glass-card p-4">
      <p className="text-sm text-red-300">Failed to load dashboard data.</p>
      <button className="mt-2 rounded-lg border border-white/20 px-3 py-1 text-xs" onClick={reset}>
        Retry
      </button>
    </div>
  );
}

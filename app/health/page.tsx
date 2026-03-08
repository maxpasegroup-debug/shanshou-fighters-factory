"use client";

import { useEffect, useState } from "react";

type HealthResponse = {
  ok: boolean;
  checks: {
    database: { ok: boolean; message: string };
    stripe: { ok: boolean; message: string };
    cloudinary: { ok: boolean; missing: string[] };
  };
  environment: string;
  responseTimeMs: number;
  timestamp: string;
};

function HealthItem({
  title,
  ok,
  description,
}: {
  title: string;
  ok: boolean;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-3">
      <div className="flex items-center justify-between">
        <p className="font-medium">{title}</p>
        <span className={`text-xs ${ok ? "text-emerald-400" : "text-red-300"}`}>
          {ok ? "Healthy" : "Issue"}
        </span>
      </div>
      <p className="mt-1 text-xs text-zinc-400">{description}</p>
    </div>
  );
}

export default function HealthPage() {
  const [state, setState] = useState<{
    loading: boolean;
    error: string;
    data: HealthResponse | null;
  }>({
    loading: true,
    error: "",
    data: null,
  });

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const response = await fetch("/api/health", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch health status");
        const data = (await response.json()) as HealthResponse;
        if (mounted) setState({ loading: false, error: "", data });
      } catch (error) {
        if (mounted) setState({ loading: false, error: String(error), data: null });
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  if (state.loading) {
    return (
      <div className="glass-card mx-auto max-w-xl space-y-3 p-6">
        <div className="h-6 w-48 animate-pulse rounded bg-white/10" />
        <div className="h-16 animate-pulse rounded bg-white/10" />
        <div className="h-16 animate-pulse rounded bg-white/10" />
        <div className="h-16 animate-pulse rounded bg-white/10" />
      </div>
    );
  }

  if (state.error || !state.data) {
    return (
      <div className="glass-card mx-auto max-w-xl p-6">
        <h1 className="text-xl font-bold">Health Check</h1>
        <p className="mt-2 text-sm text-red-300">{state.error || "Unable to load health status."}</p>
      </div>
    );
  }

  const { data } = state;

  return (
    <div className="glass-card mx-auto max-w-xl space-y-4 p-6">
      <div>
        <h1 className="text-xl font-bold">System Health</h1>
        <p className="mt-1 text-xs text-zinc-400">
          Environment: {data.environment} - Response: {data.responseTimeMs}ms
        </p>
      </div>

      <HealthItem title="MongoDB" ok={data.checks.database.ok} description={data.checks.database.message} />
      <HealthItem title="Stripe" ok={data.checks.stripe.ok} description={data.checks.stripe.message} />
      <HealthItem
        title="Cloudinary"
        ok={data.checks.cloudinary.ok}
        description={
          data.checks.cloudinary.ok
            ? "Configured"
            : `Missing: ${data.checks.cloudinary.missing.join(", ")}`
        }
      />

      <p className={`text-sm font-medium ${data.ok ? "text-emerald-400" : "text-red-300"}`}>
        Overall Status: {data.ok ? "Healthy" : "Needs Attention"}
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";

type EnrollButtonProps = {
  courseId: string;
  courseTitle: string;
  amount: number;
};

export default function EnrollButton({ courseId, courseTitle, amount }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const enroll = async () => {
    setLoading(true);
    setError("");
    try {
      const origin = window.location.origin;
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "course",
          referenceId: courseId,
          amount,
          title: courseTitle,
          successUrl: `${origin}/payment/success`,
          cancelUrl: `${origin}/payment/cancel`,
        }),
      });

      if (!response.ok) throw new Error("Unable to start checkout");
      const data = (await response.json()) as { checkoutUrl?: string };
      if (!data.checkoutUrl) throw new Error("Missing checkout URL");
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Payment checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={enroll}
        disabled={loading}
        className="mt-4 rounded-lg bg-black/70 px-4 py-2 text-sm font-semibold disabled:opacity-60"
      >
        {loading ? "Redirecting..." : "Enroll Now"}
      </button>
      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}

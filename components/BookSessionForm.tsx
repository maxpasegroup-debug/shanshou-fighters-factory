"use client";

import { FormEvent, useState } from "react";

type BookSessionFormProps = {
  trainerId: string;
  price?: number;
};

export default function BookSessionForm({ trainerId, price = 60 }: BookSessionFormProps) {
  const [sessionDate, setSessionDate] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus("Creating booking...");
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trainerId, sessionDate, price }),
    });

    if (!response.ok) {
      setStatus("Could not create booking");
      setLoading(false);
      return;
    }

    const booking = (await response.json()) as { _id: string };
    const origin = window.location.origin;
    const payResponse = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "booking",
        referenceId: booking._id,
        successUrl: `${origin}/payment/success`,
        cancelUrl: `${origin}/payment/cancel`,
      }),
    });

    if (!payResponse.ok) {
      setStatus("Booking created, but payment checkout failed.");
      setLoading(false);
      return;
    }

    const paymentData = (await payResponse.json()) as { checkoutUrl?: string };
    if (!paymentData.checkoutUrl) {
      setStatus("Booking created, but checkout URL missing.");
      setLoading(false);
      return;
    }

    setStatus("Redirecting to checkout...");
    window.location.href = paymentData.checkoutUrl;
  };

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-2">
      <input
        type="datetime-local"
        value={sessionDate}
        onChange={(event) => setSessionDate(event.target.value)}
        className="w-full rounded-lg border border-white/15 bg-black/40 p-2 text-sm"
        required
      />
      <button disabled={loading} className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium disabled:opacity-60">
        {loading ? "Processing..." : `Book Session ($${price})`}
      </button>
      <p className="text-xs text-zinc-400">{status}</p>
    </form>
  );
}

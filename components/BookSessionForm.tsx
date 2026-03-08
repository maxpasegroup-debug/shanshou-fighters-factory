"use client";

import { FormEvent, useState } from "react";

type BookSessionFormProps = {
  trainerId: string;
  price?: number;
};

export default function BookSessionForm({ trainerId, price = 60 }: BookSessionFormProps) {
  const [sessionDate, setSessionDate] = useState("");
  const [status, setStatus] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("Booking...");
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trainerId, sessionDate, price }),
    });

    if (!response.ok) {
      setStatus("Could not create booking");
      return;
    }

    setStatus("Session booked. Complete payment at checkout.");
    setSessionDate("");
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
      <button className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium">
        Book Session (${price})
      </button>
      <p className="text-xs text-zinc-400">{status}</p>
    </form>
  );
}

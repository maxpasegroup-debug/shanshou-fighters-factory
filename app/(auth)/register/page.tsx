"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [payload, setPayload] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setError("Unable to register user");
      return;
    }
    router.push("/login");
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="glass-card space-y-4 p-6">
        <h1 className="text-2xl font-bold">Create Account</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm outline-none"
            placeholder="Full name"
            value={payload.name}
            onChange={(event) => setPayload((p) => ({ ...p, name: event.target.value }))}
            required
          />
          <input
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm outline-none"
            placeholder="Email"
            type="email"
            value={payload.email}
            onChange={(event) => setPayload((p) => ({ ...p, email: event.target.value }))}
            required
          />
          <input
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm outline-none"
            placeholder="Password"
            type="password"
            value={payload.password}
            onChange={(event) => setPayload((p) => ({ ...p, password: event.target.value }))}
            required
          />
          <select
            value={payload.role}
            onChange={(event) => setPayload((p) => ({ ...p, role: event.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm outline-none"
          >
            <option value="student">Student</option>
            <option value="trainer">Trainer</option>
          </select>
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
          <button className="warrior-gradient w-full rounded-lg p-3 text-sm font-semibold">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

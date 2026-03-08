"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push("/home");
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="glass-card space-y-4 p-6">
        <h1 className="text-2xl font-bold">Login</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm outline-none"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm outline-none"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
          <button className="warrior-gradient w-full rounded-lg p-3 text-sm font-semibold">Login</button>
        </form>
        <button
          onClick={() => signIn("google", { callbackUrl: "/home" })}
          className="w-full rounded-lg border border-white/20 p-3 text-sm"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}

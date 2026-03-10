"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type VerifyResponse = {
  status?: string;
  fulfilled?: boolean;
  metadata?: { purchaseType?: string };
};

export default function PaymentVerifier() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Verifying payment...");
  const [cta, setCta] = useState<{ href: string; label: string } | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("Missing payment session. Please contact support.");
      return;
    }

    const verify = async () => {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        setStatus("Verification failed. Please refresh this page.");
        return;
      }

      const data = (await response.json()) as VerifyResponse;
      if (data.status === "paid") {
        const purchaseType = data.metadata?.purchaseType;
        if (purchaseType === "booking") {
          setStatus("Session booked! Your session is confirmed.");
          setCta({ href: "/dashboard/training", label: "Back to Training" });
        } else {
          setStatus("Payment successful. You are now enrolled.");
          setCta({ href: "/journey", label: "Start learning" });
        }
      } else {
        setStatus(`Payment status: ${data.status || "pending"}`);
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="mt-2 space-y-3">
      <p className="text-sm text-zinc-300">{status}</p>
      {cta && (
        <Link
          href={cta.href}
          className="inline-block rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2 text-sm font-medium"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

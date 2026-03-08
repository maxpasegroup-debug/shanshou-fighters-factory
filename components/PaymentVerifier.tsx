"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentVerifier() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Verifying payment...");

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

      const data = (await response.json()) as { status?: string; enrolled?: boolean };
      if (data.status === "paid") {
        setStatus(data.enrolled ? "Payment successful. You are now enrolled." : "Payment successful.");
      } else {
        setStatus(`Payment status: ${data.status || "pending"}`);
      }
    };

    verify();
  }, [searchParams]);

  return <p className="mt-2 text-sm text-zinc-300">{status}</p>;
}

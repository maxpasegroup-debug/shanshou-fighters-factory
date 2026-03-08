import { Suspense } from "react";

import PaymentVerifier from "@/components/PaymentVerifier";

export default function PaymentSuccessPage() {
  return (
    <div className="glass-card mx-auto mt-20 max-w-lg p-6">
      <h1 className="text-2xl font-bold">Payment Success</h1>
      <Suspense fallback={<p className="mt-2 text-sm text-zinc-300">Verifying payment...</p>}>
        <PaymentVerifier />
      </Suspense>
    </div>
  );
}

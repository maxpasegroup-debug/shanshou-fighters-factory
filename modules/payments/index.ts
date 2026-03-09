import Stripe from "stripe";
import { getEnv } from "@/lib/env";

let stripeInstance: Stripe | null = null;

export const getStripe = () => {
  const env = getEnv();
  if (!env.STRIPE_SECRET) {
    throw new Error("STRIPE_SECRET is not defined");
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(env.STRIPE_SECRET, {
      apiVersion: "2026-02-25.clover",
    });
  }

  return stripeInstance;
};

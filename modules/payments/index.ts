import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export const getStripe = () => {
  if (!process.env.STRIPE_SECRET) {
    throw new Error("STRIPE_SECRET is not defined");
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET, {
      apiVersion: "2026-02-25.clover",
    });
  }

  return stripeInstance;
};

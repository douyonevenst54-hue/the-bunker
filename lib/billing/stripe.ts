import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

/** Stripe client. Webhook signature checks work offline, so a placeholder key is fine for those. */
export function stripe(): Stripe {
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");
  return client;
}

export const priceFor = (interval: "month" | "year") =>
  interval === "year" ? process.env.STRIPE_PRICE_YEARLY! : process.env.STRIPE_PRICE_MONTHLY!;

export const appUrl = () => (process.env.APP_URL || "https://buildthebunker.com").replace(/\/$/, "");

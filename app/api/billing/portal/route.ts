import { NextResponse } from "next/server";
import { getPlayer } from "@/lib/session";
import { billingReady } from "@/lib/plan";
import { stripe, appUrl } from "@/lib/billing/stripe";

/** Stripe customer portal: change plan, update card, cancel. */
export async function POST() {
  const player = await getPlayer().catch(() => null);
  if (!player?.stripeCustomerId) return NextResponse.json({ error: "errNoSubscription" }, { status: 404 });
  if (!billingReady()) return NextResponse.json({ error: "errBillingOff" }, { status: 503 });
  const s = await stripe().billingPortal.sessions.create({ customer: player.stripeCustomerId, return_url: `${appUrl()}/account` });
  return NextResponse.json({ url: s.url });
}

import { NextResponse } from "next/server";
import { getPlayer } from "@/lib/session";
import { billingReady, isMember } from "@/lib/plan";
import { stripe, priceFor, appUrl } from "@/lib/billing/stripe";
import { isPiEdition } from "@/lib/edition";

/** Starts a Stripe Checkout subscription for a signed-in account. */
export async function POST(req: Request) {
  if (await isPiEdition()) return NextResponse.json({ error: "errBillingOff" }, { status: 404 });
  const player = await getPlayer().catch(() => null);
  if (!player?.email) return NextResponse.json({ error: "errNeedAccount" }, { status: 401 });
  if (isMember(player)) return NextResponse.json({ error: "errAlreadyMember" }, { status: 409 });
  if (!billingReady()) return NextResponse.json({ error: "errBillingOff" }, { status: 503 });
  const interval = (await req.json().catch(() => ({})))?.interval === "year" ? "year" : "month";
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceFor(interval), quantity: 1 }],
    client_reference_id: player.id,
    metadata: { playerId: player.id },
    subscription_data: { metadata: { playerId: player.id } },
    ...(player.stripeCustomerId ? { customer: player.stripeCustomerId } : { customer_email: player.email }),
    allow_promotion_codes: true,
    success_url: `${appUrl()}/upgrade?ok=1`,
    cancel_url: `${appUrl()}/upgrade`,
  });
  return NextResponse.json({ url: session.url });
}

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma, dbEnabled } from "@/lib/db";
import { stripe } from "@/lib/billing/stripe";

/** Stripe → membership. Only signed events are accepted. */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !dbEnabled) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, req.headers.get("stripe-signature") || "", secret);
  } catch {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    const playerId = s.client_reference_id || s.metadata?.playerId;
    const customer = typeof s.customer === "string" ? s.customer : s.customer?.id;
    if (playerId && s.mode === "subscription" && s.status === "complete") {
      await prisma.player.updateMany({
        where: { id: playerId },
        data: { stripeCustomerId: customer ?? undefined, subStatus: "active" },
      });
    }
  } else if (event.type.startsWith("customer.subscription.")) {
    const sub = event.data.object as Stripe.Subscription;
    const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const item = sub.items?.data?.[0];
    const data = {
      stripeCustomerId: customer,
      subStatus: event.type === "customer.subscription.deleted" ? "canceled" : sub.status,
      subInterval: item?.price?.recurring?.interval ?? null,
      subPeriodEnd: item?.current_period_end ? new Date(item.current_period_end * 1000) : null,
    };
    const byCustomer = await prisma.player.updateMany({ where: { stripeCustomerId: customer }, data });
    if (byCustomer.count === 0 && sub.metadata?.playerId) {
      await prisma.player.updateMany({ where: { id: sub.metadata.playerId }, data });
    }
  }
  return NextResponse.json({ received: true });
}

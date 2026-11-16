import "server-only";
import { isAdmin } from "./admin";

/** Rooms anyone can play. Everything else (rooms 3–6 and every level) is for members. */
export const FREE_ROOMS = ["water", "medical"];

type PlanPlayer = { email: string | null; role: string; subStatus?: string | null } | null | undefined;

/** Stripe keys and both prices are configured. */
export function billingReady(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_MONTHLY && process.env.STRIPE_PRICE_YEARLY);
}

/** The paywall only switches on once people can actually pay (or when forced for tests). */
export function paywallOn(): boolean {
  return process.env.PAYWALL === "on" || billingReady();
}

export function isMember(p: PlanPlayer): boolean {
  if (!p) return false;
  if (isAdmin(p as { email: string | null; role: string })) return true;
  return p.subStatus === "active" || p.subStatus === "trialing";
}

/** True when this content is behind the paywall for this player. */
export function needsPlan(contentId: string, p: PlanPlayer): boolean {
  return paywallOn() && !FREE_ROOMS.includes(contentId) && !isMember(p);
}

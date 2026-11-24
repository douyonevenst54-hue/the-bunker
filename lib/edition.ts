import "server-only";
import { headers } from "next/headers";

/** Hostnames that serve the Pi edition (Pi Browser / PiNet). Comma-separated in PI_HOSTS. */
export const PI_HOSTS = (process.env.PI_HOSTS ?? "pi.buildthebunker.com")
  .split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);

export function isPiHost(host: string | null | undefined): boolean {
  return PI_HOSTS.includes((host ?? "").toLowerCase().split(":")[0]);
}

/** True when this request is for the Pi edition: Pi sign-in, Pi payments, no Stripe. */
export async function isPiEdition(): Promise<boolean> {
  const h = await headers();
  return isPiHost(h.get("x-forwarded-host") ?? h.get("host"));
}

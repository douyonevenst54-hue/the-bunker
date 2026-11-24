import "server-only";
import { headers } from "next/headers";

/** Hostnames that serve the Pi edition (Pi Browser / PiNet). Comma-separated in PI_HOSTS. */
export const PI_HOSTS = (process.env.PI_HOSTS ?? "pi.buildthebunker.com,testnet.buildthebunker.com")
  .split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);

export function isPiHost(host: string | null | undefined): boolean {
  return PI_HOSTS.includes((host ?? "").toLowerCase().split(":")[0]);
}

/** Hosts of the Testnet Pi app (its own API key and domain-verification key). */
export const PI_TESTNET_HOSTS = (process.env.PI_TESTNET_HOSTS ?? "testnet.buildthebunker.com")
  .split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);

async function host(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-host") ?? h.get("host") ?? "").toLowerCase().split(":")[0];
}

/** Which Pi app this request belongs to. */
export async function piNetwork(): Promise<"testnet" | "mainnet"> {
  return PI_TESTNET_HOSTS.includes(await host()) ? "testnet" : "mainnet";
}

/** Server API key of the Pi app serving this request (Testnet and Mainnet apps have different keys). */
export async function piApiKey(): Promise<string | undefined> {
  return (await piNetwork()) === "testnet" ? process.env.PI_API_KEY_TESTNET : process.env.PI_API_KEY;
}

/** True when this request is for the Pi edition: Pi sign-in, Pi payments, no Stripe. */
export async function isPiEdition(): Promise<boolean> {
  const h = await headers();
  return isPiHost(h.get("x-forwarded-host") ?? h.get("host"));
}

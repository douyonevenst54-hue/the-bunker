import { isPiEdition, piNetwork } from "@/lib/edition";

/**
 * Pi Developer Portal domain verification: https://<app domain>/validation-key.txt
 * Each Pi app (Testnet / Mainnet) has its own key, set in Vercel as
 * PI_VALIDATION_KEY_TESTNET and PI_VALIDATION_KEY.
 */
export async function GET() {
  const key = (await isPiEdition())
    ? ((await piNetwork()) === "testnet" ? process.env.PI_VALIDATION_KEY_TESTNET : process.env.PI_VALIDATION_KEY)
    : undefined;
  if (!key) return new Response("Not found", { status: 404 });
  return new Response(key.trim(), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}

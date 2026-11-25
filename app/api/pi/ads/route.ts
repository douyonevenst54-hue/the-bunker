import { NextResponse } from "next/server";
import { prisma, dbEnabled } from "@/lib/db";
import { getPlayer } from "@/lib/session";
import { isPiEdition, piApiKey } from "@/lib/edition";
import { AD_HOURS } from "@/lib/plan";

const PI_API = process.env.PI_API_BASE ?? "https://api.minepi.com";
const bad = (error: string, status: number) => NextResponse.json({ error }, { status });

/**
 * Pi rewarded ad → Room 3 for 24 hours, at most once a day. The ad is checked with Pi's
 * Platform API (never trusted from the browser alone) and each ad id can be used only once.
 */
export async function POST(req: Request) {
  if (!(await isPiEdition()) || !dbEnabled) return bad("Not found", 404);
  const player = await getPlayer();
  if (!player?.piUid) return bad("piOnly", 401);
  let adId = "";
  try { adId = String((await req.json())?.adId ?? ""); } catch { /* handled below */ }
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(adId)) return bad("Malformed ad id", 400);

  const since = new Date(Date.now() - 24 * 3600 * 1000);
  if (await prisma.adReward.count({ where: { playerId: player.id, createdAt: { gt: since } } })) return bad("errDaily", 429);

  const key = await piApiKey();
  if (!key) return bad("Pi API key missing", 503);
  const r = await fetch(`${PI_API}/v2/ads_network/status/${encodeURIComponent(adId)}`, {
    headers: { Authorization: `Key ${key}` }, cache: "no-store",
  }).catch(() => null);
  if (!r?.ok) return bad("errVerify", 502);
  const status = (await r.json().catch(() => null)) as { mediator_ack_status?: string } | null;
  if (status?.mediator_ack_status !== "granted") return bad("errNotGranted", 402);

  const until = new Date(Date.now() + AD_HOURS * 3600 * 1000);
  try {
    await prisma.$transaction([
      prisma.adReward.create({ data: { adId, playerId: player.id } }),
      prisma.player.update({ where: { id: player.id }, data: { adRoomUntil: until } }),
    ]);
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") return bad("errUsed", 409);
    throw e;
  }
  return NextResponse.json({ ok: true, until: until.toISOString() });
}

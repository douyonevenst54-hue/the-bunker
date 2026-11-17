import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma, dbEnabled } from "@/lib/db";
import { getOrCreatePlayer, getPlayer } from "@/lib/session";

const base = (req: Request) => (process.env.APP_URL || new URL(req.url).origin).replace(/\/$/, "");

/** Turns on the player's public progress page and returns its link. */
export async function POST(req: Request) {
  if (!dbEnabled) return NextResponse.json({ error: "shareErr" }, { status: 503 });
  const player = await getOrCreatePlayer();
  let code = player.shareCode;
  for (let i = 0; !code && i < 5; i++) {
    const c = randomBytes(6).toString("base64url");
    try { await prisma.player.update({ where: { id: player.id }, data: { shareCode: c } }); code = c; } catch { /* collision: retry */ }
  }
  if (!code) return NextResponse.json({ error: "shareErr" }, { status: 500 });
  return NextResponse.json({ url: `${base(req)}/p/${code}` });
}

/** Turns the public page off (the old link stops working). */
export async function DELETE() {
  const player = await getPlayer().catch(() => null);
  if (player?.shareCode) await prisma.player.update({ where: { id: player.id }, data: { shareCode: null } });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { prisma, dbEnabled } from "@/lib/db";
import { getPlayer, setSession } from "@/lib/session";
import { isPiEdition } from "@/lib/edition";

/** Pi's API. Overridable so tests can point at a local stand-in. */
const PI_API = process.env.PI_API_BASE ?? "https://api.minepi.com";

/**
 * Sign in with Pi. The browser sends the accessToken from Pi.authenticate();
 * the only trusted identity is what Pi's /v2/me returns for that token.
 * A guest's progress on this device is kept by attaching the Pi identity to it.
 */
export async function POST(req: Request) {
  if (!(await isPiEdition())) return NextResponse.json({ error: "pi_only" }, { status: 404 });
  if (!dbEnabled) return NextResponse.json({ error: "no_db" }, { status: 503 });
  let token = "";
  try { token = String((await req.json()).accessToken ?? ""); } catch { /* bad body */ }
  if (!token || token.length > 4096) return NextResponse.json({ error: "token_required" }, { status: 400 });

  let me: { uid?: string; username?: string } | null = null;
  try {
    const r = await fetch(`${PI_API}/v2/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (r.ok) me = await r.json();
  } catch (e) { console.error("pi /v2/me failed", e); }
  if (!me?.uid || !me.username) return NextResponse.json({ error: "invalid_token" }, { status: 401 });

  const uid = String(me.uid), username = String(me.username).slice(0, 60);
  let player = await prisma.player.findUnique({ where: { piUid: uid } });
  if (player) {
    if (player.piUsername !== username) player = await prisma.player.update({ where: { id: player.id }, data: { piUsername: username } });
  } else {
    const current = await getPlayer();
    // Keep this device's guest progress: attach Pi to a plain guest (no email, no Pi yet).
    if (current && !current.email && !current.piUid) {
      player = await prisma.player.update({ where: { id: current.id }, data: { piUid: uid, piUsername: username, displayName: current.displayName ?? username } });
    } else {
      player = await prisma.player.create({ data: { piUid: uid, piUsername: username, displayName: username } });
    }
  }
  await setSession(player.id);
  return NextResponse.json({ ok: true, username });
}

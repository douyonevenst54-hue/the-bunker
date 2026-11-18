import { NextResponse } from "next/server";
import { prisma, dbEnabled } from "@/lib/db";
import { getPlayerId } from "@/lib/session";
import { ROOMS } from "@/lib/rooms";
import { SCENARIO_IDS } from "@/lib/scenarios/ids";

const IDS = new Set([...ROOMS.map((r) => r.id), ...SCENARIO_IDS]);
const KINDS = new Set(["start", "finish"]);
const MODES = new Set(["2d", "3d", "level"]);
const DEVICES = new Set(["phone", "desktop"]);

/** Records one funnel event (room started / finished). Anonymous; ignores anything malformed. */
export async function POST(req: Request) {
  let b: Record<string, unknown> = {};
  try { b = JSON.parse(await req.text()); } catch { /* sendBeacon bodies are text */ }
  const visitor = typeof b.visitor === "string" && /^[a-z0-9]{8,40}$/.test(b.visitor) ? b.visitor : null;
  const ok = visitor && KINDS.has(String(b.kind)) && IDS.has(String(b.contentId)) && MODES.has(String(b.mode)) && DEVICES.has(String(b.device));
  if (!ok || !dbEnabled) return new NextResponse(null, { status: 204 });
  try {
    // at most 300 events per visitor per day (keeps the table safe from scripted spam)
    const recent = await prisma.playEvent.count({ where: { visitor, createdAt: { gt: new Date(Date.now() - 864e5) } } });
    if (recent < 300) {
      await prisma.playEvent.create({
        data: { visitor, playerId: await getPlayerId(), kind: String(b.kind), contentId: String(b.contentId), mode: String(b.mode), device: String(b.device) },
      });
    }
  } catch (e) { console.error("event failed", e); }
  return new NextResponse(null, { status: 204 });
}

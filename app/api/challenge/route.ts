import { NextResponse } from "next/server";
import { prisma, dbEnabled } from "@/lib/db";
import { getOrCreatePlayer } from "@/lib/session";
import { cleanName } from "@/lib/names";
import { CREW_MAX, newCrewCode, normCode } from "@/lib/challenge";

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

/** 72-Hour Challenge actions: set a nickname, create / join / leave a crew. Guests can do all of it. */
export async function POST(req: Request) {
  if (!dbEnabled) return bad("Saving is not enabled", 503);
  let body: { action?: string; nickname?: unknown; name?: unknown; code?: unknown };
  try { body = await req.json(); } catch { return bad("Malformed request"); }
  const me = await getOrCreatePlayer();

  if (body.action === "nickname") {
    const nickname = cleanName(body.nickname);
    if (!nickname) return bad("errName");
    await prisma.player.update({ where: { id: me.id }, data: { nickname } });
    return NextResponse.json({ ok: true, nickname });
  }

  if (body.action === "create") {
    const name = cleanName(body.name, 3, 24);
    if (!name) return bad("errName");
    const current = await prisma.player.findUnique({ where: { id: me.id }, select: { crewId: true } });
    if (current?.crewId) return bad("errInCrew", 409);
    for (let i = 0; i < 5; i++) {
      try {
        const crew = await prisma.crew.create({ data: { name, code: newCrewCode(), createdById: me.id, members: { connect: { id: me.id } } } });
        return NextResponse.json({ ok: true, code: crew.code });
      } catch (e) {
        if ((e as { code?: string }).code !== "P2002") throw e; // retry only on a code collision
      }
    }
    return bad("Try again", 500);
  }

  if (body.action === "join") {
    const code = normCode(body.code);
    const crew = code.length === 6 ? await prisma.crew.findUnique({ where: { code }, select: { id: true, _count: { select: { members: true } } } }) : null;
    if (!crew) return bad("errCode", 404);
    const current = await prisma.player.findUnique({ where: { id: me.id }, select: { crewId: true } });
    if (current?.crewId === crew.id) return NextResponse.json({ ok: true });
    if (current?.crewId) return bad("errInCrew", 409);
    if (crew._count.members >= CREW_MAX) return bad("errFull", 409);
    await prisma.player.update({ where: { id: me.id }, data: { crewId: crew.id } });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "leave") {
    const current = await prisma.player.findUnique({ where: { id: me.id }, select: { crewId: true } });
    if (!current?.crewId) return NextResponse.json({ ok: true });
    await prisma.player.update({ where: { id: me.id }, data: { crewId: null } });
    // an empty crew is removed
    await prisma.crew.deleteMany({ where: { id: current.crewId, members: { none: {} } } });
    return NextResponse.json({ ok: true });
  }

  return bad("Unknown action");
}

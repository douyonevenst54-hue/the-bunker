import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getSurvival, simulate, validateAnswers, validateKit } from "@/lib/survival";
import { prisma, dbEnabled } from "@/lib/db";
import { getOrCreatePlayer } from "@/lib/session";
import { getBadgeIds } from "@/lib/progress";

/** A 72-hour run is replayed and scored on the server from the kit and the choices. Free for everyone. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const mode = getSurvival(id);
  if (!mode) return NextResponse.json({ error: "Unknown mode" }, { status: 404 });
  if (!dbEnabled) return NextResponse.json({ error: "Saving is not enabled" }, { status: 503 });

  let kit: string[], answers: number[], result;
  try {
    const body = await req.json();
    kit = validateKit(mode, body?.kit);
    answers = validateAnswers(body?.answers);
    result = simulate(mode, kit, answers);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  const player = await getOrCreatePlayer();
  const before = new Set(await getBadgeIds(player.id));
  const summary = { ...result, steps: undefined };
  await prisma.roomAttempt.create({
    data: {
      playerId: player.id, roomId: mode.id, score: result.score, passed: result.passed,
      criticalErrors: result.criticalMisses.length,
      breakdown: summary as unknown as Prisma.InputJsonValue,
      answers: { kit, answers } as unknown as Prisma.InputJsonValue,
    },
  });
  const newBadges = (await getBadgeIds(player.id)).filter((b) => !before.has(b));
  return NextResponse.json({ saved: true, result, newBadges });
}

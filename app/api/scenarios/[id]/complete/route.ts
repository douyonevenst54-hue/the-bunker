import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getScenario, scoreScenario, validateScenarioAnswers } from "@/lib/scenarios";
import { prisma, dbEnabled } from "@/lib/db";
import { getPlayer } from "@/lib/session";
import { getBadgeIds, getLevels } from "@/lib/progress";
import { needsPlan } from "@/lib/plan";

/** Scenario results are scored on the server and stored like room attempts (roomId = scenario id). */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const sc = getScenario(id);
  if (!sc) return NextResponse.json({ error: "Unknown scenario" }, { status: 404 });
  if (!dbEnabled) return NextResponse.json({ error: "Saving is not enabled" }, { status: 503 });

  const player = await getPlayer();
  const level = (await getLevels(player?.id ?? null)).find((l) => l.id === id);
  if (!player || !level?.unlocked) {
    return NextResponse.json({ error: "This level is locked" }, { status: 403 });
  }
  if (needsPlan(sc.id, player)) return NextResponse.json({ error: "membersOnly" }, { status: 402 });

  let answers: number[];
  try {
    answers = validateScenarioAnswers(sc, (await req.json())?.answers);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  const result = scoreScenario(sc, answers);
  const before = new Set(await getBadgeIds(player.id));
  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.roomAttempt.create({
      data: {
        playerId: player.id, roomId: sc.id, score: result.score, passed: result.passed,
        criticalErrors: result.criticalMisses.length,
        breakdown: result as unknown as Prisma.InputJsonValue,
        answers: answers as unknown as Prisma.InputJsonValue,
      },
    });
    const key = { playerId_roomId: { playerId: player.id, roomId: sc.id } };
    const prev = await tx.roomProgress.findUnique({ where: key });
    if (!prev) {
      await tx.roomProgress.create({ data: { playerId: player.id, roomId: sc.id, bestScore: result.score, passed: result.passed, attempts: 1, lastPlayedAt: now, passedAt: result.passed ? now : null } });
    } else {
      await tx.roomProgress.update({ where: key, data: {
        bestScore: Math.max(prev.bestScore, result.score), passed: prev.passed || result.passed,
        attempts: prev.attempts + 1, lastPlayedAt: now, passedAt: prev.passedAt ?? (result.passed ? now : null),
      } });
    }
  });
  const newBadges = (await getBadgeIds(player.id)).filter((b) => !before.has(b));
  return NextResponse.json({ saved: true, result, newBadges });
}

import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getRoom } from "@/lib/rooms";
import { scoreRoom, validateAnswers } from "@/lib/scoring";
import { prisma, dbEnabled } from "@/lib/db";
import { getOrCreatePlayer } from "@/lib/session";

/** The client sends raw answers; the server scores them. The client never sets the score. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const room = getRoom(id);
  if (!room) return NextResponse.json({ error: "Unknown room" }, { status: 404 });
  if (!dbEnabled) return NextResponse.json({ error: "Saving is not enabled" }, { status: 503 });

  let answers;
  try {
    answers = validateAnswers(room, (await req.json())?.answers);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  const result = scoreRoom(room, answers);
  try {
    const player = await getOrCreatePlayer();
    const now = new Date();
    await prisma.$transaction(async (tx) => {
      await tx.roomAttempt.create({
        data: {
          playerId: player.id, roomId: room.id, score: result.score, passed: result.passed,
          criticalErrors: result.criticalMisses.length,
          breakdown: { categories: result.categories, criticalMisses: result.criticalMisses, level: result.level } as unknown as Prisma.InputJsonValue,
          answers: answers as unknown as Prisma.InputJsonValue,
        },
      });
      const prev = await tx.roomProgress.findUnique({ where: { playerId_roomId: { playerId: player.id, roomId: room.id } } });
      if (!prev) {
        await tx.roomProgress.create({
          data: { playerId: player.id, roomId: room.id, bestScore: result.score, passed: result.passed, attempts: 1, lastPlayedAt: now, passedAt: result.passed ? now : null },
        });
      } else {
        await tx.roomProgress.update({
          where: { playerId_roomId: { playerId: player.id, roomId: room.id } },
          data: {
            bestScore: Math.max(prev.bestScore, result.score),
            passed: prev.passed || result.passed,
            attempts: prev.attempts + 1,
            lastPlayedAt: now,
            passedAt: prev.passedAt ?? (result.passed ? now : null),
          },
        });
      }
    });
    return NextResponse.json({ saved: true, result });
  } catch (e) {
    console.error("save failed", e);
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }
}

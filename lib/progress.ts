import "server-only";
import { prisma, dbEnabled } from "./db";
import { ROOMS } from "./rooms";
import { earnedBadgeIds, type AttemptLite } from "./badges";

export interface RoomStatus {
  id: string;
  unlocked: boolean;
  played: boolean;
  passed: boolean;
  bestScore: number | null;
}

/** Status of every playable room for a player (null = new visitor). Room 1 is always open. */
export async function getRoomStatuses(playerId: string | null): Promise<RoomStatus[]> {
  let rows: { roomId: string; passed: boolean; bestScore: number }[] = [];
  if (dbEnabled && playerId) {
    try {
      rows = await prisma.roomProgress.findMany({ where: { playerId } });
    } catch (e) {
      console.error("progress lookup failed", e);
    }
  }
  const by = new Map(rows.map((r) => [r.roomId, r]));
  return ROOMS.map((room, i) => {
    const r = by.get(room.id);
    const prevPassed = i === 0 || Boolean(by.get(ROOMS[i - 1].id)?.passed);
    return { id: room.id, unlocked: prevPassed, played: Boolean(r), passed: Boolean(r?.passed), bestScore: r?.bestScore ?? null };
  });
}

/** Best result for a scenario (stored in RoomProgress under the scenario id). */
export async function getScenarioProgress(playerId: string | null, id: string) {
  if (!dbEnabled || !playerId) return null;
  try {
    return await prisma.roomProgress.findUnique({ where: { playerId_roomId: { playerId, roomId: id } } });
  } catch { return null; }
}

/** Attempt history (oldest first) used for badges. */
export async function getAttempts(playerId: string | null): Promise<AttemptLite[]> {
  if (!dbEnabled || !playerId) return [];
  try {
    return await prisma.roomAttempt.findMany({
      where: { playerId }, orderBy: { createdAt: "asc" },
      select: { roomId: true, score: true, passed: true },
    });
  } catch (e) {
    console.error("attempt lookup failed", e);
    return [];
  }
}

export async function getBadgeIds(playerId: string | null): Promise<string[]> {
  return earnedBadgeIds(await getAttempts(playerId));
}

/** Moves a guest's progress into an account, keeping the better result per room. */
export async function mergeGuestInto(guestId: string, accountId: string) {
  if (guestId === accountId) return;
  const guest = await prisma.player.findUnique({ where: { id: guestId }, include: { progress: true } });
  if (!guest || guest.email) return; // only merge true guests
  await prisma.$transaction(async (tx) => {
    await tx.roomAttempt.updateMany({ where: { playerId: guestId }, data: { playerId: accountId } });
    for (const g of guest.progress) {
      const a = await tx.roomProgress.findUnique({ where: { playerId_roomId: { playerId: accountId, roomId: g.roomId } } });
      if (!a) {
        await tx.roomProgress.create({ data: { ...g, playerId: accountId } });
      } else {
        await tx.roomProgress.update({
          where: { playerId_roomId: { playerId: accountId, roomId: g.roomId } },
          data: {
            bestScore: Math.max(a.bestScore, g.bestScore),
            passed: a.passed || g.passed,
            attempts: a.attempts + g.attempts,
            lastPlayedAt: a.lastPlayedAt > g.lastPlayedAt ? a.lastPlayedAt : g.lastPlayedAt,
            passedAt: a.passedAt ?? g.passedAt,
          },
        });
      }
    }
    await tx.player.delete({ where: { id: guestId } });
  });
}

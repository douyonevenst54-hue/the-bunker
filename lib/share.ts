import "server-only";
import { prisma, dbEnabled } from "./db";
import { getRoomStatuses, getLevels, getBadgeIds } from "./progress";

/** What a public share page shows. Never the email: first name only. */
export async function sharedProgress(code: string) {
  if (!dbEnabled || !/^[A-Za-z0-9_-]{6,16}$/.test(code)) return null;
  const p = await prisma.player.findUnique({ where: { shareCode: code }, select: { id: true, displayName: true } });
  if (!p) return null;
  const [rooms, levels, badges] = await Promise.all([getRoomStatuses(p.id), getLevels(p.id), getBadgeIds(p.id)]);
  return { name: p.displayName?.trim().split(/\s+/)[0] || null, rooms, levels, badges };
}

import "server-only";
import { randomInt } from "crypto";
import { prisma } from "./db";
import { publicName } from "./names";

/** The 72-Hour Challenge: weekly leaderboards for the survival mode, for players and for crews. */
export const CHALLENGE_ID = "survival-72";
export const CREW_MAX = 12;
/** A crew's weekly score is the sum of its members' 5 best scores (one per member). */
export const CREW_TOP = 5;
const BOARD_SIZE = 20;

/** Weeks start Monday 00:00 UTC. */
export function weekStart(now = new Date()): Date {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d;
}

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const newCrewCode = () => Array.from({ length: 6 }, () => CODE_CHARS[randomInt(CODE_CHARS.length)]).join("");
export const normCode = (c: unknown) => (typeof c === "string" ? c.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) : "");

export interface PlayerRow { rank: number; name: string; score: number; crew: string | null; me: boolean }
export interface CrewRow { rank: number; name: string; score: number; members: number; me: boolean }
export interface MyCrew { name: string; code: string; score: number; rank: number | null; members: { name: string; best: number | null; me: boolean }[] }
export interface Boards {
  weekStart: string;
  players: PlayerRow[];
  crews: CrewRow[];
  me: { name: string; nickname: string | null; best: number | null; rank: number | null; crew: MyCrew | null } | null;
}

export async function getBoards(meId: string | null): Promise<Boards> {
  const since = weekStart();
  const bests = await prisma.roomAttempt.groupBy({
    by: ["playerId"], where: { roomId: CHALLENGE_ID, createdAt: { gte: since } }, _max: { score: true }, _min: { createdAt: true },
  });
  bests.sort((a, b) => (b._max.score ?? 0) - (a._max.score ?? 0) || +a._min.createdAt! - +b._min.createdAt!);
  const best = new Map(bests.map((b) => [b.playerId, b._max.score ?? 0]));

  const top = bests.slice(0, BOARD_SIZE).map((b) => b.playerId);
  const me = meId ? await prisma.player.findUnique({
    where: { id: meId },
    select: { id: true, nickname: true, crew: { select: { id: true, name: true, code: true, members: { select: { id: true, nickname: true } } } } },
  }) : null;
  const people = await prisma.player.findMany({ where: { id: { in: top } }, select: { id: true, nickname: true, crew: { select: { name: true } } } });
  const byId = new Map(people.map((p) => [p.id, p]));
  const players: PlayerRow[] = top.map((id, i) => {
    const p = byId.get(id)!;
    return { rank: i + 1, name: publicName(p), score: best.get(id)!, crew: p.crew?.name ?? null, me: id === meId };
  });

  // Crews: sum of the top 5 member scores this week.
  const inCrews = await prisma.player.findMany({
    where: { crewId: { not: null }, id: { in: bests.map((b) => b.playerId) } }, select: { id: true, crewId: true },
  });
  const crewScores = new Map<string, number[]>();
  for (const p of inCrews) crewScores.set(p.crewId!, [...(crewScores.get(p.crewId!) ?? []), best.get(p.id)!]);
  const totals = [...crewScores.entries()]
    .map(([id, s]) => ({ id, score: s.sort((a, b) => b - a).slice(0, CREW_TOP).reduce((x, y) => x + y, 0) }))
    .sort((a, b) => b.score - a.score);
  const crewInfo = await prisma.crew.findMany({
    where: { id: { in: totals.slice(0, BOARD_SIZE).map((t) => t.id) } }, select: { id: true, name: true, _count: { select: { members: true } } },
  });
  const ci = new Map(crewInfo.map((c) => [c.id, c]));
  const crews: CrewRow[] = totals.slice(0, BOARD_SIZE).map((t, i) => ({
    rank: i + 1, name: ci.get(t.id)!.name, score: t.score, members: ci.get(t.id)!._count.members, me: t.id === me?.crew?.id,
  }));

  let mine: Boards["me"] = null;
  if (me) {
    const rankIdx = bests.findIndex((b) => b.playerId === me.id);
    let crew: MyCrew | null = null;
    if (me.crew) {
      const ri = totals.findIndex((t) => t.id === me.crew!.id);
      crew = {
        name: me.crew.name, code: me.crew.code, score: ri >= 0 ? totals[ri].score : 0, rank: ri >= 0 ? ri + 1 : null,
        members: me.crew.members
          .map((m) => ({ name: publicName(m), best: best.get(m.id) ?? null, me: m.id === me.id }))
          .sort((a, b) => (b.best ?? -1) - (a.best ?? -1)),
      };
    }
    mine = { name: publicName(me), nickname: me.nickname, best: best.get(me.id) ?? null, rank: rankIdx >= 0 ? rankIdx + 1 : null, crew };
  }
  return { weekStart: since.toISOString(), players, crews, me: mine };
}

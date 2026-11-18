// Readiness profile: a knowledge score built from each room's best score (one room = one area).
// It measures what the player learned in the game — never a promise of safety in a real emergency.
import { ROOMS } from "./rooms";
import type { RoomStatus } from "./progress";

export interface Area { id: string; emoji: string; score: number; played: boolean; passed: boolean }
export interface Readiness {
  score: number;              // 0–100, average of the six areas (unplayed = 0)
  areas: Area[];
  next: { id: string; why: "continue" | "improve" } | null;
}

export function readiness(statuses: RoomStatus[], premium: string[]): Readiness {
  const areas = ROOMS.map((r) => {
    const st = statuses.find((s) => s.id === r.id);
    return { id: r.id, emoji: r.emoji, score: st?.bestScore ?? 0, played: !!st?.played, passed: !!st?.passed };
  });
  const score = Math.round(areas.reduce((n, a) => n + a.score, 0) / (areas.length || 1));
  const open = (id: string) => !!statuses.find((s) => s.id === id)?.unlocked && !premium.includes(id);
  // 1) the next room not yet passed that the player can open; 2) else their weakest area below 100
  const cont = areas.find((a) => !a.passed && open(a.id));
  if (cont) return { score, areas, next: { id: cont.id, why: cont.played ? "improve" : "continue" } };
  const weak = areas.filter((x) => x.played && x.score < 100 && open(x.id)).sort((x, y) => x.score - y.score)[0];
  return { score, areas, next: weak ? { id: weak.id, why: "improve" } : null };
}

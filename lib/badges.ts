import type { Tx } from "./rooms/types";

/** What badge rules can look at: one entry per finished attempt, oldest first. */
export interface AttemptLite {
  roomId: string;
  score: number;
  passed: boolean;
}

export interface Badge {
  id: string;
  emoji: string;
  name: Tx;
  desc: Tx;
  earned: (attempts: AttemptLite[]) => boolean;
}

const passedRoom = (id: string) => (a: AttemptLite[]) => a.some((x) => x.roomId === id && x.passed);

/** Badges are derived from attempt history, so they can't drift out of sync with progress. */
export const BADGES: Badge[] = [
  {
    id: "first_steps", emoji: "👣",
    name: { en: "First Steps", ht: "Premye Pa" },
    desc: { en: "Finish any room", ht: "Fini nenpòt chanm" },
    earned: (a) => a.length > 0,
  },
  {
    id: "water_guardian", emoji: "💧",
    name: { en: "Water Guardian", ht: "Gadyen Dlo" },
    desc: { en: "Pass the Water room", ht: "Reyisi chanm Dlo a" },
    earned: passedRoom("water"),
  },
  {
    id: "first_responder", emoji: "🩹",
    name: { en: "First Responder", ht: "Premye Sekouris" },
    desc: { en: "Pass the Medical room", ht: "Reyisi chanm Medikal la" },
    earned: passedRoom("medical"),
  },
  {
    id: "first_try", emoji: "🎯",
    name: { en: "Ready on Day One", ht: "Pare Depi Premye Jou" },
    desc: { en: "Pass a room on your first try", ht: "Reyisi yon chanm depi premye fwa" },
    earned: (a) => {
      const first = new Map<string, AttemptLite>();
      for (const x of a) if (!first.has(x.roomId)) first.set(x.roomId, x);
      return [...first.values()].some((x) => x.passed);
    },
  },
  {
    id: "perfect", emoji: "🏅",
    name: { en: "Perfect Score", ht: "Nòt Pafè" },
    desc: { en: "Score 100 in a room", ht: "Fè 100 nan yon chanm" },
    earned: (a) => a.some((x) => x.score === 100),
  },
  {
    id: "comeback", emoji: "💪",
    name: { en: "Never Give Up", ht: "Pa Janm Bay Legen" },
    desc: { en: "Pass a room after missing it", ht: "Reyisi yon chanm apre ou te rate l" },
    earned: (a) => {
      const failed = new Set<string>();
      for (const x of a) {
        if (!x.passed) failed.add(x.roomId);
        else if (failed.has(x.roomId)) return true;
      }
      return false;
    },
  },
  {
    id: "bunker_complete", emoji: "🛡️",
    name: { en: "Bunker Commander", ht: "Kòmandan Bunker" },
    desc: { en: "Pass all six rooms", ht: "Reyisi tout sis chanm yo" },
    earned: (a) => new Set(a.filter((x) => x.passed).map((x) => x.roomId)).size >= 6,
  },
];

export function earnedBadgeIds(attempts: AttemptLite[]): string[] {
  return BADGES.filter((b) => b.earned(attempts)).map((b) => b.id);
}

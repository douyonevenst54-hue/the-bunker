import { stageLength, type PlaceItem, type PlaceStage, type Room, type RoomAnswers } from "./rooms/types";

export type Placement = "correct" | "incorrect" | "unsafe";

/** Judges one placement. Exported so the game can give instant feedback with the same rules. */
export function judgePlacement(S: PlaceStage, item: PlaceItem, zoneIndex: number): Placement {
  const zone = S.zones[zoneIndex]?.id;
  if (zone && item.ok.includes(zone)) return "correct";
  if (zone && item.unsafe?.includes(zone)) return "unsafe";
  return "incorrect";
}

export type Level = "expert" | "well" | "improve" | "training";

export interface CategoryScore {
  key: string; // "sort" or stage key
  correct: number;
  total: number;
}

export interface RoomResult {
  score: number; // 0–100
  level: Level;
  passed: boolean; // unlocks the next room
  categories: CategoryScore[];
  /** English text of each safety-critical item/question the player got wrong. */
  criticalMisses: string[];
}

export const PASS_SCORE = 60;

export function levelFor(score: number): Level {
  if (score >= 90) return "expert";
  if (score >= 75) return "well";
  if (score >= PASS_SCORE) return "improve";
  return "training";
}

/** Throws if the answers don't match the room's shape. */
export function validateAnswers(room: Room, a: unknown): RoomAnswers {
  const ans = a as RoomAnswers;
  if (!ans || !Array.isArray(ans.sort) || typeof ans.stages !== "object" || ans.stages === null) {
    throw new Error("Malformed answers");
  }
  if (ans.sort.length !== room.items.length || !ans.sort.every((b) => b === "u" || b === "s" || b === "a")) {
    throw new Error("Invalid sort answers");
  }
  for (const S of room.stages) {
    const arr = ans.stages[S.key];
    if (!Array.isArray(arr) || arr.length !== stageLength(S)) throw new Error(`Missing answers for ${S.key}`);
    arr.forEach((v, i) => {
      const max = S.kind === "place" ? S.zones.length : S.qs[i].en.o.length;
      if (!Number.isInteger(v) || v < 0 || v >= max) throw new Error(`Invalid answer in ${S.key}`);
    });
  }
  return { sort: ans.sort, stages: Object.fromEntries(room.stages.map((S) => [S.key, ans.stages[S.key]])) };
}

/**
 * Scores a finished room. Runs on the client for instant feedback and again on the
 * server, which is the only score that gets saved.
 * A critical safety error blocks passing no matter how high the score is.
 */
export function scoreRoom(room: Room, ans: RoomAnswers): RoomResult {
  const criticalMisses: string[] = [];
  let sortCorrect = 0;
  room.items.forEach((it, i) => {
    if (ans.sort[i] === it.b) sortCorrect++;
    else if (it.critical) criticalMisses.push(it.en[0]);
  });
  const categories: CategoryScore[] = [{ key: "sort", correct: sortCorrect, total: room.items.length }];
  let weighted = (sortCorrect / room.items.length) * room.sortWeight;
  let weightSum = room.sortWeight;

  for (const S of room.stages) {
    let c = 0;
    if (S.kind === "place") {
      S.items.forEach((it, i) => {
        const j = judgePlacement(S, it, ans.stages[S.key][i]);
        if (j === "correct") c++;
        else if (j === "unsafe") criticalMisses.push(it.name.en);
      });
    } else {
      S.qs.forEach((q, i) => {
        if (ans.stages[S.key][i] === q.a) c++;
        else if (q.critical) criticalMisses.push(q.en.q);
      });
    }
    const n = stageLength(S);
    categories.push({ key: S.key, correct: c, total: n });
    weighted += (c / n) * S.w;
    weightSum += S.w;
  }

  const score = Math.round((weighted / weightSum) * 100);
  const passed = score >= PASS_SCORE && criticalMisses.length === 0;
  return { score, level: criticalMisses.length ? "training" : levelFor(score), passed, categories, criticalMisses };
}

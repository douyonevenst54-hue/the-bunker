import type { Outcome, Stats, SurvivalChoice, SurvivalMode } from "./types";
import { hurricane72 } from "./hurricane72";

/** 72-hour survival runs. Same rules on the client (live display) and the server (scoring). */
export const SURVIVAL_MODES: SurvivalMode[] = [hurricane72];
export const getSurvival = (id: string) => SURVIVAL_MODES.find((m) => m.id === id);

export const END_HOUR = 72;
/** Per 6-hour turn, for a family of five: 1 gallon per person per day, 3 meals a day. */
export const WATER_PER_TURN = 1.25;
export const FOOD_PER_TURN = 0.25;
export const POWER_PER_TURN = 5;

const clamp = (n: number, max = 100) => Math.max(0, Math.min(max, Math.round(n * 100) / 100));

export const kitSlots = (mode: SurvivalMode, kit: string[]) =>
  kit.reduce((n, id) => n + (mode.kit.find((k) => k.id === id)?.slots ?? 0), 0);

export function validateKit(mode: SurvivalMode, kit: unknown): string[] {
  if (!Array.isArray(kit) || kit.some((x) => typeof x !== "string")) throw new Error("Malformed kit");
  if (new Set(kit).size !== kit.length) throw new Error("Duplicate kit item");
  if (kit.some((id) => !mode.kit.some((k) => k.id === id))) throw new Error("Unknown kit item");
  if (kitSlots(mode, kit) > mode.kitBudget) throw new Error("Kit too big");
  return kit as string[];
}

export function startStats(kit: string[]): Stats {
  const has = (id: string) => kit.includes(id);
  return {
    water: (has("water3") ? 15 : 0) + (has("water1") ? 5 : 0),
    // without a can opener, only the dry half of the food is usable
    food: has("food3") ? (has("opener") ? 3 : 1.5) : 0,
    power: has("powerbank") ? 70 : 40,
    health: 100,
    morale: 70,
  };
}

export const isLocked = (c: SurvivalChoice, kit: string[]) => !!c.needs?.some((id) => !kit.includes(id));

export function applyEffects(s: Stats, e?: Partial<Stats>): Stats {
  if (!e) return s;
  return {
    water: clamp(s.water + (e.water ?? 0), 40), food: clamp(s.food + (e.food ?? 0), 10),
    power: clamp(s.power + (e.power ?? 0)), health: clamp(s.health + (e.health ?? 0)), morale: clamp(s.morale + (e.morale ?? 0)),
  };
}

export type Shortage = "water" | "food" | "power";

/** Six hours pass: the family drinks, eats and uses the phones. Running out hurts. */
export function passTime(s: Stats): { stats: Stats; short: Shortage[] } {
  const short: Shortage[] = [];
  const e: Partial<Stats> = { water: -WATER_PER_TURN, food: -FOOD_PER_TURN, power: -POWER_PER_TURN, health: 0, morale: 0 };
  if (s.water < WATER_PER_TURN) { short.push("water"); e.health! -= 10; e.morale! -= 5; }
  if (s.food < FOOD_PER_TURN) { short.push("food"); e.health! -= 3; e.morale! -= 8; }
  if (s.power < POWER_PER_TURN) { short.push("power"); e.morale! -= 3; }
  return { stats: applyEffects(s, e), short };
}

export interface SurvivalStep { stats: Stats; short: Shortage[] }

export interface SurvivalResult {
  score: number;
  passed: boolean;
  survived: boolean;
  hoursSurvived: number;
  outcomes: Outcome[];
  stats: Stats;
  steps: SurvivalStep[];
  /** English text of each turn where an unsafe choice was made. */
  criticalMisses: string[];
  reviewRooms: string[];
}

/** Plays the run. Stops early if the family's health reaches 0. Throws on an impossible answer. */
export function simulate(mode: SurvivalMode, kit: string[], answers: number[]): SurvivalResult {
  let stats = startStats(kit);
  const outcomes: Outcome[] = [];
  const steps: SurvivalStep[] = [];
  const criticalMisses: string[] = [];
  const review = new Set<string>();
  let best = 0;
  let hours = END_HOUR;
  for (let i = 0; i < mode.turns.length; i++) {
    const t = mode.turns[i];
    const a = answers[i];
    if (!Number.isInteger(a) || a < 0 || a >= t.choices.length) throw new Error("Invalid choice");
    const c = t.choices[a];
    if (isLocked(c, kit)) throw new Error("Choice needs a kit item you didn't pack");
    outcomes.push(c.outcome);
    if (c.outcome === "best") best++;
    else {
      review.add(t.room);
      if (c.outcome === "unsafe") criticalMisses.push(t.text.en);
    }
    stats = applyEffects(stats, c.effects);
    const p = passTime(stats);
    stats = p.stats;
    steps.push({ stats, short: p.short });
    if (stats.health <= 0) { hours = t.hour + 6; break; }
  }
  if (answers.length !== steps.length) throw new Error("Wrong number of answers");
  const survived = stats.health > 0;
  if (survived && kit.includes("docs")) stats = applyEffects(stats, { morale: 10 });
  const score = survived
    ? Math.round(0.45 * stats.health + 0.15 * stats.morale + 40 * (best / mode.turns.length))
    : Math.round((30 * hours) / END_HOUR);
  return {
    score: Math.min(100, score), passed: survived && stats.health >= 50 && criticalMisses.length === 0,
    survived, hoursSurvived: survived ? END_HOUR : hours, outcomes, stats, steps, criticalMisses, reviewRooms: [...review],
  };
}

export function validateAnswers(a: unknown): number[] {
  if (!Array.isArray(a) || a.length === 0 || a.length > 20 || a.some((v) => !Number.isInteger(v))) throw new Error("Malformed answers");
  return a as number[];
}

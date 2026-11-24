import type { Tx } from "../rooms/types";

/** best = right call · poor = not dangerous, but costs you · unsafe = critical safety error */
export type Outcome = "best" | "poor" | "unsafe";

/** water in gallons, food in days for the family, the others 0–100. */
export interface Stats { water: number; food: number; power: number; health: number; morale: number }

export interface KitItem {
  id: string;
  emoji: string;
  name: Tx;
  /** Space it takes in the kit. */
  slots: number;
  /** Shown after the run: why it mattered (or why it's a trap). */
  note: Tx;
}

export interface SurvivalChoice {
  text: Tx;
  outcome: Outcome;
  why: Tx;
  /** Kit items this choice needs; without them it's shown locked. */
  needs?: string[];
  effects?: Partial<Stats>;
}

export interface SurvivalTurn {
  /** Game hour (0–66) when this happens. */
  hour: number;
  time: Tx;
  text: Tx;
  /** The room that teaches this skill (used in the debrief). */
  room: string;
  choices: SurvivalChoice[];
}

export interface SurvivalMode {
  id: string;
  title: Tx;
  briefing: Tx[];
  kitBudget: number;
  kit: KitItem[];
  turns: SurvivalTurn[];
  sources: [string, string][];
}

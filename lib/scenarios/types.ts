import type { Tx } from "../rooms/types";

/** best = right call · poor = not dangerous, but costs you · unsafe = critical safety error */
export type Outcome = "best" | "poor" | "unsafe";

export interface Meters { power: number; food: number; safety: number } // each 0–100

export interface Choice {
  text: Tx;
  outcome: Outcome;
  why: Tx;
  /** Change to the meters when this choice is made. */
  effects?: Partial<Meters>;
}

export interface ScenarioEvent {
  time: Tx;
  text: Tx;
  /** The room that teaches this skill (used in the debrief). */
  room: string;
  choices: Choice[];
}

export interface Scenario {
  id: string;
  emoji: string;
  title: Tx;
  briefing: Tx[];
  events: ScenarioEvent[];
  sources: [string, string][];
}

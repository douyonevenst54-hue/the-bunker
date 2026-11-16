import type { Meters, Outcome, Scenario } from "./types";
import { powerOutage } from "./power-outage";

export const SCENARIOS: Scenario[] = [powerOutage];
export const getScenario = (id: string) => SCENARIOS.find((s) => s.id === id);

export const START_METERS: Meters = { power: 70, food: 80, safety: 100 };
const clamp = (n: number) => Math.max(0, Math.min(100, n));

export interface ScenarioResult {
  score: number;
  passed: boolean;
  outcomes: Outcome[];
  meters: Meters;
  /** English text of each event where an unsafe choice was made. */
  criticalMisses: string[];
  /** Rooms to review, from events that weren't handled with the best choice. */
  reviewRooms: string[];
}

export function validateScenarioAnswers(sc: Scenario, a: unknown): number[] {
  if (!Array.isArray(a) || a.length !== sc.events.length) throw new Error("Malformed answers");
  a.forEach((v, i) => {
    if (!Number.isInteger(v) || v < 0 || v >= sc.events[i].choices.length) throw new Error("Invalid choice");
  });
  return a as number[];
}

export function applyEffects(m: Meters, e?: Partial<Meters>): Meters {
  if (!e) return m;
  return { power: clamp(m.power + (e.power ?? 0)), food: clamp(m.food + (e.food ?? 0)), safety: clamp(m.safety + (e.safety ?? 0)) };
}

/** Best = 1 point, poor = ½ point, unsafe = 0 and a critical error. Same rules on client and server. */
export function scoreScenario(sc: Scenario, answers: number[]): ScenarioResult {
  let pts = 0;
  let meters = { ...START_METERS };
  const outcomes: Outcome[] = [];
  const criticalMisses: string[] = [];
  const review = new Set<string>();
  sc.events.forEach((ev, i) => {
    const c = ev.choices[answers[i]];
    outcomes.push(c.outcome);
    meters = applyEffects(meters, c.effects);
    if (c.outcome === "best") pts += 1;
    else {
      review.add(ev.room);
      if (c.outcome === "poor") pts += 0.5;
      else criticalMisses.push(ev.text.en);
    }
  });
  const score = Math.round((pts / sc.events.length) * 100);
  return { score, passed: score >= 60 && criticalMisses.length === 0, outcomes, meters, criticalMisses, reviewRooms: [...review] };
}

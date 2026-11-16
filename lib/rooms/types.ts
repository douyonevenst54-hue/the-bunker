export type Lang = "en" | "ht";
export type Bin = "u" | "s" | "a"; // use / skip (not needed) / avoid
export type Tx = { en: string; ht: string };

export interface Item {
  e: string;
  b: Bin;
  /** Getting this wrong is a critical safety error. */
  critical?: boolean;
  en: [name: string, explanation: string];
  ht: [name: string, explanation: string];
}

export interface QText {
  q: string;
  o: string[];
  x: string;
}

export interface Question {
  a: number;
  critical?: boolean;
  en: QText;
  ht: QText;
}

interface StageBase {
  key: string;
  w: number;
  label: Tx;
  cat: Tx;
  scene?: Tx;
}

/** Multiple-choice questions. */
export interface QuizStage extends StageBase {
  kind?: "quiz";
  qs: Question[];
}

/** A spot in the drawn room where items can be dropped (coordinates in a 360×300 plan). */
export interface PlaceZone {
  id: string;
  label: Tx;
  x: number; y: number; w: number; h: number;
}

export interface PlaceItem {
  id: string;
  e: string;
  name: Tx;
  /** Zones that are correct for this item (several layouts can be valid). */
  ok: string[];
  /** Zones that are dangerous for this item. Placing it there is a critical safety error. */
  unsafe?: string[];
  why: { ok: Tx; wrong: Tx; unsafe?: Tx };
}

/** Drag-and-drop placement: every item is judged correct, incorrect or unsafe. */
export interface PlaceStage extends StageBase {
  kind: "place";
  zones: PlaceZone[];
  items: PlaceItem[];
}

export type Stage = QuizStage | PlaceStage;

export const stageLength = (S: Stage) => (S.kind === "place" ? S.items.length : S.qs.length);

export interface RoomUI {
  room: string;
  title: string;
  intro1: string;
  intro2: string;
  catSort: string;
}

export interface Room {
  id: string;
  n: number;
  emoji: string;
  sortWeight: number;
  next?: string;
  ui: Record<Lang, RoomUI>;
  items: Item[];
  stages: Stage[];
  check: Record<Lang, string[]>;
  sources: [string, string][];
}

/** What a player submits at the end of a room.
 *  Quiz stages: chosen option index per question. Place stages: chosen zone index per item. */
export interface RoomAnswers {
  sort: Bin[];
  stages: Record<string, number[]>;
}

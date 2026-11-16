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

export interface Stage {
  key: string;
  w: number;
  label: Tx;
  cat: Tx;
  scene?: Tx;
  qs: Question[];
}

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

/** What a player submits at the end of a room. */
export interface RoomAnswers {
  sort: Bin[];
  stages: Record<string, number[]>;
}

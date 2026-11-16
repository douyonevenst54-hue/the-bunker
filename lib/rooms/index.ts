import type { Room, Tx } from "./types";
import { waterRoom } from "./water";
import { medicalRoom } from "./medical";

/** Playable rooms, in unlock order. */
export const ROOMS: Room[] = [waterRoom, medicalRoom];

export function getRoom(id: string): Room | undefined {
  return ROOMS.find((r) => r.id === id);
}

/** Rooms planned for the six-room MVP that are not built yet. */
export const COMING_SOON: { id: string; emoji: string; name: Tx }[] = [
  { id: "security", emoji: "🚪", name: { en: "Security & Entrance", ht: "Sekirite ak Antre" } },
  { id: "food", emoji: "🥫", name: { en: "Food & Nutrition", ht: "Manje ak Nitrisyon" } },
  { id: "air", emoji: "🌬️", name: { en: "Air & Ventilation", ht: "Lè ak Vantilasyon" } },
  { id: "energy", emoji: "🔋", name: { en: "Energy & Electricity", ht: "Enèji ak Elektrisite" } },
];

/**
 * Bunker floor plan: a central corridor with three rooms on each side.
 * The entrance (Security) sits by the door, as in the game design document.
 */
export const MAP_LAYOUT: { id: string; side: "left" | "right"; row: 0 | 1 | 2 }[] = [
  { id: "security", side: "left", row: 0 },
  { id: "water", side: "right", row: 0 },
  { id: "medical", side: "left", row: 1 },
  { id: "food", side: "right", row: 1 },
  { id: "air", side: "left", row: 2 },
  { id: "energy", side: "right", row: 2 },
];

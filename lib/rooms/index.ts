import type { Room, Tx } from "./types";
import { waterRoom } from "./water";
import { medicalRoom } from "./medical";

/** Playable rooms, in unlock order. */
export const ROOMS: Room[] = [waterRoom, medicalRoom];

export function getRoom(id: string): Room | undefined {
  return ROOMS.find((r) => r.id === id);
}

/** Rooms planned for the six-room MVP that are not built yet (shown on the bunker map). */
export const COMING_SOON: { emoji: string; name: Tx }[] = [
  { emoji: "🚪", name: { en: "Security & Entrance", ht: "Sekirite ak Antre" } },
  { emoji: "🥫", name: { en: "Food & Nutrition", ht: "Manje ak Nitrisyon" } },
  { emoji: "🌬️", name: { en: "Air & Ventilation", ht: "Lè ak Vantilasyon" } },
  { emoji: "🔋", name: { en: "Energy & Electricity", ht: "Enèji ak Elektrisite" } },
];

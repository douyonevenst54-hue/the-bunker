import type { Room, Tx } from "./types";
import { waterRoom } from "./water";
import { medicalRoom } from "./medical";
import { securityRoom } from "./security";
import { foodRoom } from "./food";
import { airRoom } from "./air";
import { energyRoom } from "./energy";

/** Playable rooms, in unlock order. */
export const ROOMS: Room[] = [waterRoom, medicalRoom, securityRoom, foodRoom, airRoom, energyRoom];

export function getRoom(id: string): Room | undefined {
  return ROOMS.find((r) => r.id === id);
}

/** Rooms planned for the six-room MVP that are not built yet. */
export const COMING_SOON: { id: string; emoji: string; name: Tx }[] = [];

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

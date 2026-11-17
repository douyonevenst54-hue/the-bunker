// Walkable space, walls and furniture as boxes on the floor (x/z), plus the doorway path used by
// automatic moves so the camera never cuts through a wall.
import type { V3 } from "./World";

export type AABB = { x0: number; x1: number; z0: number; z1: number };
export type Region = "outside" | "corridor" | "room";
export const RADIUS = 0.3;
export const EYE = 1.6;

const WALLS: AABB[] = [
  // outside: fences and the facade (doorway x -1..1)
  { x0: -14, x1: -13, z0: -1, z1: 16 }, { x0: 13, x1: 14, z0: -1, z1: 16 }, { x0: -14, x1: 14, z0: 15, z1: 16 },
  { x0: -14, x1: -1, z0: -0.45, z1: 0.45 }, { x0: 1, x1: 14, z0: -0.45, z1: 0.45 },
  // corridor (room door gap on the right, z -8.2..-6.8)
  { x0: -1.7, x1: -1.5, z0: -12.2, z1: 0 }, { x0: 1.5, x1: 1.7, z0: -6.8, z1: 0 }, { x0: 1.5, x1: 1.7, z0: -12.2, z1: -8.2 },
  { x0: -1.6, x1: 1.6, z0: -12.3, z1: -12 },
  // room
  { x0: 1.5, x1: 10.7, z0: -12.3, z1: -12 }, { x0: 1.5, x1: 10.7, z0: -3, z1: -2.8 }, { x0: 10.5, x1: 10.7, z0: -12.3, z1: -2.8 },
  // survival terminal
  { x0: 1.5, x1: 2.15, z0: -11.1, z1: -10.1 },
];
export const MAIN_DOOR: AABB = { x0: -1, x1: 1, z0: -0.35, z1: 0.35 };
export const ROOM_DOOR: AABB = { x0: 1.4, x1: 1.75, z0: -8.2, z1: -6.8 };

/** Footprint of a placement station, by which wall it stands against. */
export function stationBox(at: V3, deep = 0.9): AABB {
  const [x, , z] = at;
  if (x > 10) return { x0: 10.5 - deep, x1: 10.5, z0: z - 0.9, z1: z + 0.9 };
  if (z > -4) return { x0: x - 0.9, x1: x + 0.9, z0: -3 - deep, z1: -3 };
  return { x0: x - 0.9, x1: x + 0.9, z0: -12, z1: -12 + deep };
}

export function buildObstacles(extra: AABB[], mainDoorOpen: boolean, roomDoorOpen: boolean): AABB[] {
  return [...WALLS, ...extra, ...(mainDoorOpen ? [] : [MAIN_DOOR]), ...(roomDoorOpen ? [] : [ROOM_DOOR])];
}

export function blocked(x: number, z: number, obs: AABB[]): boolean {
  for (const b of obs) if (x > b.x0 - RADIUS && x < b.x1 + RADIUS && z > b.z0 - RADIUS && z < b.z1 + RADIUS) return true;
  return false;
}

export function regionAt(x: number, z: number): Region {
  if (z > 0.3) return "outside";
  if (x < 1.5) return "corridor";
  return "room";
}

const ORDER: Region[] = ["outside", "corridor", "room"];
/** Waypoints through the doorways from one region to another (in travel order). */
function portals(from: Region, to: Region): [number, number][] {
  const out: [number, number][] = [];
  let i = ORDER.indexOf(from);
  const j = ORDER.indexOf(to);
  while (i !== j) {
    const step = j > i ? 1 : -1;
    const a = ORDER[i], b = ORDER[i + step];
    if ((a === "outside" && b === "corridor")) out.push([0, 2], [0, -1.2]);
    if ((a === "corridor" && b === "outside")) out.push([0, -1.2], [0, 2]);
    if ((a === "corridor" && b === "room")) out.push([0, -7.5], [2.4, -7.5], [4, -7.5]);
    if ((a === "room" && b === "corridor")) out.push([4, -7.5], [2.4, -7.5], [0, -7.5]);
    i += step;
  }
  return out;
}

/** Path for an automatic move: line up with the doorway, go through, then to the target. */
export function pathTo(fromX: number, fromZ: number, toX: number, toZ: number): [number, number][] {
  const a = regionAt(fromX, fromZ), b = regionAt(toX, toZ);
  const pts: [number, number][] = [];
  if (a !== b && a === "corridor") pts.push([0, fromZ]);
  if (a !== b && a === "outside") pts.push([0, Math.max(fromZ, 2)]);
  pts.push(...portals(a, b), [toX, toZ]);
  return pts.filter((p, k) => k === 0 || Math.hypot(p[0] - pts[k - 1][0], p[1] - pts[k - 1][1]) > 0.05);
}

/** A spot to stand in front of something at (x, z), on the room side. */
export function standSpot(x: number, z: number, dist = 1.3): [number, number] {
  const cx = 6, cz = -7.5;
  if (regionAt(x, z) !== "room") return [x, z];
  const dx = cx - x, dz = cz - z, d = Math.hypot(dx, dz) || 1;
  return [x + (dx / d) * dist, z + (dz / d) * dist];
}

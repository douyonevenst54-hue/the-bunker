import "server-only";
import { prisma, dbEnabled } from "./db";
import { ROOMS, getRoom } from "./rooms";
import { SCENARIOS, getScenario } from "./scenarios";
import type { Room } from "./rooms/types";
import type { Scenario } from "./scenarios/types";

/** Everything an admin can edit: the six rooms and the scenarios. */
export const CONTENT_IDS = [...ROOMS.map((r) => r.id), ...SCENARIOS.map((s) => s.id)];
export const baseContent = (id: string): Room | Scenario | undefined => getRoom(id) ?? getScenario(id);

// Keys whose string values are identifiers, symbols or links, never player-facing text.
const SKIP = new Set(["id", "e", "b", "key", "kind", "emoji", "next", "ok", "unsafe", "outcome", "sources"]);

export interface TextField { path: string; value: string }

/** Every editable player-facing string in a piece of content, with its dotted path. */
export function textFields(obj: unknown, prefix = ""): TextField[] {
  const out: TextField[] = [];
  const walk = (v: unknown, path: string, key: string) => {
    if (SKIP.has(key)) return;
    if (key === "room" && /^events\.\d+\.room$/.test(path)) return; // scenario event → room id link
    if (typeof v === "string") out.push({ path, value: v });
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, path ? `${path}.${i}` : String(i), key));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k, k);
  };
  walk(obj, prefix, "");
  return out;
}

export function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

function setByPath(obj: unknown, path: string, value: string) {
  const keys = path.split(".");
  const last = keys.pop()!;
  const parent = keys.reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], obj) as Record<string, unknown>;
  parent[last] = value;
}

/** A path is editable only if it points at an existing player-facing string. */
export function isEditablePath(id: string, path: string): boolean {
  const base = baseContent(id);
  return !!base && textFields(base).some((f) => f.path === path);
}

/** Base content with every approved revision applied (newest wins). */
export async function liveContent<T extends Room | Scenario>(base: T): Promise<T> {
  if (!dbEnabled) return base;
  let revs: { path: string; newValue: string }[] = [];
  try {
    revs = await prisma.contentRevision.findMany({
      where: { contentId: base.id, status: "approved" }, orderBy: { reviewedAt: "asc" },
      select: { path: true, newValue: true },
    });
  } catch (e) {
    console.error("revision lookup failed", e);
  }
  if (!revs.length) return base;
  const copy = structuredClone(base);
  for (const r of revs) if (typeof getByPath(copy, r.path) === "string") setByPath(copy, r.path, r.newValue);
  return copy;
}

export async function liveRoom(id: string) { const b = getRoom(id); return b ? liveContent(b) : undefined; }
export async function liveScenario(id: string) { const b = getScenario(id); return b ? liveContent(b) : undefined; }

export async function latestSignoff(contentId: string) {
  if (!dbEnabled) return null;
  try {
    return await prisma.contentSignoff.findFirst({ where: { contentId }, orderBy: { createdAt: "desc" } });
  } catch { return null; }
}

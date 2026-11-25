/** Public names (nicknames, crew names): short, plain, and nothing rude or misleading. */
const BLOCKED = [
  "fuck", "shit", "bitch", "cunt", "dick", "pussy", "nigg", "fag", "whore", "slut", "rape", "nazi", "hitler", "porn", "sex",
  "kaka", "koko", "zozo", "bouzen", "manman w", "langet", "masisi", "pitit pis",
  "admin", "moderator", "official", "bunker staff", "support",
];

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[0@]/g, "o").replace(/[1!]/g, "i").replace(/3/g, "e").replace(/\$/g, "s");

/** Returns the cleaned name, or null if it isn't allowed. Letters (any language), numbers, spaces and . _ - only. */
export function cleanName(raw: unknown, min = 3, max = 20): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.replace(/\s+/g, " ").trim();
  if (s.length < min || s.length > max) return null;
  if (!/^[\p{L}\p{N} ._-]+$/u.test(s)) return null;
  const n = norm(s);
  const squashed = n.replace(/[^a-z]/g, "");
  if (BLOCKED.some((b) => n.includes(b) || squashed.includes(b.replace(/[^a-z]/g, "")))) return null;
  return s;
}

/** Shown when a player hasn't picked a nickname: never their real name. */
export const defaultName = (id: string) => `Survivor ${id.slice(-4).toUpperCase()}`;
export const publicName = (p: { id: string; nickname: string | null }) => p.nickname || defaultName(p.id);

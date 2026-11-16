import "server-only";
import { getPlayer } from "./session";

/** Admins: accounts with role "admin", or whose email is listed in ADMIN_EMAILS (comma-separated). */
export function isAdmin(p: { email: string | null; role: string } | null | undefined): boolean {
  if (!p?.email) return false;
  if (p.role === "admin") return true;
  const list = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return list.includes(p.email.toLowerCase());
}

export async function getAdmin() {
  const p = await getPlayer().catch(() => null);
  return p && isAdmin(p) ? p : null;
}

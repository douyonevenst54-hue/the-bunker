import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma, dbEnabled } from "./db";

const COOKIE = "bunker_session";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function key() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set (32+ chars)");
  return new TextEncoder().encode(s);
}

export async function setSession(playerId: string) {
  const token = await new SignJWT({ pid: playerId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

/** Player id from the signed cookie, or null. */
export async function getPlayerId(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return typeof payload.pid === "string" ? payload.pid : null;
  } catch {
    return null;
  }
}

export async function getPlayer() {
  if (!dbEnabled) return null;
  const id = await getPlayerId();
  if (!id) return null;
  return prisma.player.findUnique({ where: { id } });
}

/** Returns the current player, creating a guest (and its cookie) if needed. */
export async function getOrCreatePlayer() {
  const existing = await getPlayer();
  if (existing) return existing;
  const p = await prisma.player.create({ data: {} });
  await setSession(p.id);
  return p;
}

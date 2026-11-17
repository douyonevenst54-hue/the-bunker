import "server-only";
import { prisma } from "./db";

const WINDOW_MS = 15 * 60 * 1000;
export const MAX_PER_EMAIL = 8;
export const MAX_PER_IP = 30;

export function clientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
}

/** True when this email or IP had too many failed sign-ins in the last 15 minutes. */
export async function tooManyFailures(email: string, ip: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS);
  const [byEmail, byIp] = await Promise.all([
    prisma.authAttempt.count({ where: { key: `e:${email}`, createdAt: { gt: since } } }),
    prisma.authAttempt.count({ where: { key: `ip:${ip}`, createdAt: { gt: since } } }),
  ]);
  return byEmail >= MAX_PER_EMAIL || byIp >= MAX_PER_IP;
}

export async function recordFailure(email: string, ip: string) {
  await prisma.authAttempt.createMany({ data: [{ key: `e:${email}` }, { key: `ip:${ip}` }] });
  // keep the table small
  if (Math.random() < 0.05) await prisma.authAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 3600 * 1000) } } });
}

export async function clearFailures(email: string) {
  await prisma.authAttempt.deleteMany({ where: { key: `e:${email}` } });
}

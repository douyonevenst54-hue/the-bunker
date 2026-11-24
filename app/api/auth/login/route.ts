import { isPiEdition } from "@/lib/edition";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma, dbEnabled } from "@/lib/db";
import { getPlayer, setSession } from "@/lib/session";
import { mergeGuestInto } from "@/lib/progress";
import { checkCredentials } from "@/lib/auth-input";
import { clientIp, tooManyFailures, recordFailure, clearFailures } from "@/lib/ratelimit";

export async function POST(req: Request) {
  if (await isPiEdition()) return NextResponse.json({ error: "piOnly" }, { status: 404 }); // Pi edition: Pi sign-in only
  if (!dbEnabled) return NextResponse.json({ error: "errServer" }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  const check = checkCredentials(body);
  if ("error" in check) return NextResponse.json({ error: "errLogin" }, { status: 400 });

  const ip = clientIp(req);
  if (await tooManyFailures(check.email, ip)) return NextResponse.json({ error: "errTooMany" }, { status: 429 });
  const account = await prisma.player.findUnique({ where: { email: check.email } });
  if (!account?.passwordHash || !(await bcrypt.compare(check.password, account.passwordHash))) {
    await recordFailure(check.email, ip);
    return NextResponse.json({ error: "errLogin" }, { status: 401 });
  }
  await clearFailures(check.email);
  const current = await getPlayer();
  if (current && !current.email) await mergeGuestInto(current.id, account.id);
  await setSession(account.id);
  return NextResponse.json({ ok: true });
}

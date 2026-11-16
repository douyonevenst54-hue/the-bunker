import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma, dbEnabled } from "@/lib/db";
import { getPlayer, setSession } from "@/lib/session";
import { mergeGuestInto } from "@/lib/progress";
import { checkCredentials } from "@/lib/auth-input";

export async function POST(req: Request) {
  if (!dbEnabled) return NextResponse.json({ error: "errServer" }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  const check = checkCredentials(body);
  if ("error" in check) return NextResponse.json({ error: "errLogin" }, { status: 400 });

  const account = await prisma.player.findUnique({ where: { email: check.email } });
  if (!account?.passwordHash || !(await bcrypt.compare(check.password, account.passwordHash))) {
    return NextResponse.json({ error: "errLogin" }, { status: 401 });
  }
  const current = await getPlayer();
  if (current && !current.email) await mergeGuestInto(current.id, account.id);
  await setSession(account.id);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma, dbEnabled } from "@/lib/db";
import { getPlayer, setSession } from "@/lib/session";
import { checkCredentials } from "@/lib/auth-input";

/** Creates an account. If the visitor was playing as a guest, that guest becomes the account (progress kept). */
export async function POST(req: Request) {
  if (!dbEnabled) return NextResponse.json({ error: "errServer" }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  const check = checkCredentials(body);
  if ("error" in check) return NextResponse.json(check, { status: 400 });
  const { email, password } = check;
  const displayName = typeof body.name === "string" ? body.name.trim().slice(0, 40) || null : null;

  if (await prisma.player.findUnique({ where: { email } })) {
    return NextResponse.json({ error: "errTaken" }, { status: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const current = await getPlayer();
  const player = current && !current.email
    ? await prisma.player.update({ where: { id: current.id }, data: { email, passwordHash, displayName } })
    : await prisma.player.create({ data: { email, passwordHash, displayName } });
  await setSession(player.id);
  return NextResponse.json({ ok: true });
}

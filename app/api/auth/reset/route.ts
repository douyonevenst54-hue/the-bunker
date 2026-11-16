import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma, dbEnabled } from "@/lib/db";
import { setSession } from "@/lib/session";

export async function POST(req: Request) {
  if (!dbEnabled) return NextResponse.json({ error: "errServer" }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < 8 || password.length > 200) return NextResponse.json({ error: "errPassword" }, { status: 400 });
  if (!token) return NextResponse.json({ error: "errResetLink" }, { status: 400 });

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return NextResponse.json({ error: "errResetLink" }, { status: 400 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.$transaction([
    prisma.player.update({ where: { id: row.playerId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    // any other outstanding links for this account stop working
    prisma.passwordResetToken.deleteMany({ where: { playerId: row.playerId, usedAt: null } }),
  ]);
  await setSession(row.playerId);
  return NextResponse.json({ ok: true });
}

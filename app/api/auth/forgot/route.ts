import { isPiEdition } from "@/lib/edition";
import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { prisma, dbEnabled } from "@/lib/db";
import { sendMail, resetEmail } from "@/lib/email";
import { asLang } from "@/lib/i18n";

const TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_HOUR = 3;

/**
 * Always answers { ok: true } so nobody can use this form to find out
 * which emails have accounts.
 */
export async function POST(req: Request) {
  if (await isPiEdition()) return NextResponse.json({ error: "piOnly" }, { status: 404 }); // Pi edition: Pi sign-in only
  if (!dbEnabled) return NextResponse.json({ error: "errServer" }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const lang = asLang(body.lang);
  const ok = NextResponse.json({ ok: true });
  if (!email || email.length > 200) return ok;

  const player = await prisma.player.findUnique({ where: { email } });
  if (!player?.passwordHash) return ok;

  const recent = await prisma.passwordResetToken.count({
    where: { playerId: player.id, createdAt: { gt: new Date(Date.now() - TTL_MS) } },
  });
  if (recent >= MAX_PER_HOUR) return ok;

  const token = randomBytes(32).toString("base64url");
  await prisma.passwordResetToken.create({
    data: {
      playerId: player.id,
      tokenHash: createHash("sha256").update(token).digest("hex"),
      expiresAt: new Date(Date.now() + TTL_MS),
    },
  });
  const base = (process.env.APP_URL || "https://buildthebunker.com").replace(/\/$/, "");
  const mail = resetEmail(`${base}/reset?token=${token}`, lang, player.displayName);
  await sendMail({ ...mail, to: email });
  return ok;
}

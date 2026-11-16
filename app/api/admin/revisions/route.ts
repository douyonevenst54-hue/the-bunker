import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdmin } from "@/lib/admin";
import { baseContent, getByPath, isEditablePath, liveContent } from "@/lib/content";

/** Propose a text change. It stays pending until a reviewer approves it. */
export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const { contentId, path, newValue, note } = body as Record<string, unknown>;
  if (typeof contentId !== "string" || typeof path !== "string" || typeof newValue !== "string") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const base = baseContent(contentId);
  if (!base || !isEditablePath(contentId, path)) return NextResponse.json({ error: "Not an editable field" }, { status: 400 });
  const value = newValue.trim();
  if (!value || value.length > 2000) return NextResponse.json({ error: "Text must be 1–2000 characters" }, { status: 400 });
  const current = getByPath(await liveContent(base), path) as string;
  if (current === value) return NextResponse.json({ error: "No change" }, { status: 400 });

  const rev = await prisma.contentRevision.create({
    data: { contentId, path, oldValue: current, newValue: value, note: typeof note === "string" ? note.slice(0, 500) : null, authorId: admin.id },
  });
  return NextResponse.json({ ok: true, id: rev.id });
}

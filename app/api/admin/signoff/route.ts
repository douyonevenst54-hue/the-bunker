import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdmin } from "@/lib/admin";
import { CONTENT_IDS } from "@/lib/content";

/** Record that an expert reviewed a room or scenario. Blocked while edits are still pending. */
export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { contentId, name, note } = await req.json().catch(() => ({}));
  if (typeof contentId !== "string" || !CONTENT_IDS.includes(contentId)) return NextResponse.json({ error: "Unknown content" }, { status: 400 });
  const pending = await prisma.contentRevision.count({ where: { contentId, status: "pending" } });
  if (pending) return NextResponse.json({ error: "Approve or reject pending edits first" }, { status: 409 });
  const reviewerName = (typeof name === "string" && name.trim()) || admin.displayName || admin.email!;
  await prisma.contentSignoff.create({
    data: { contentId, reviewerId: admin.id, reviewerName: reviewerName.slice(0, 120), note: typeof note === "string" ? note.slice(0, 500) : null },
  });
  return NextResponse.json({ ok: true });
}

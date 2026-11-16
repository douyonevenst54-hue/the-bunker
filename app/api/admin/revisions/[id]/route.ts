import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdmin } from "@/lib/admin";

/** Approve or reject a pending revision. Self-approval is allowed for a solo reviewer but flagged in the log. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const { action } = await req.json().catch(() => ({}));
  if (action !== "approve" && action !== "reject") return NextResponse.json({ error: "Bad action" }, { status: 400 });
  const rev = await prisma.contentRevision.findUnique({ where: { id } });
  if (!rev || rev.status !== "pending") return NextResponse.json({ error: "Not pending" }, { status: 404 });
  await prisma.contentRevision.update({
    where: { id },
    data: {
      status: action === "approve" ? "approved" : "rejected",
      reviewerId: admin.id, reviewedAt: new Date(), selfApproved: action === "approve" && rev.authorId === admin.id,
    },
  });
  return NextResponse.json({ ok: true });
}

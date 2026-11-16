import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/admin";
import { baseContent, liveContent, textFields, latestSignoff } from "@/lib/content";
import { prisma } from "@/lib/db";
import ContentEditor, { type Pair, type Rev } from "@/components/ContentEditor";

export const dynamic = "force-dynamic";

export default async function ContentAdmin({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) notFound();
  const { id } = await params;
  const base = baseContent(id);
  if (!base) notFound();
  const live = await liveContent(base);

  // Pair English and Kreyòl versions of the same text.
  const pairs = new Map<string, Pair>();
  for (const f of textFields(live)) {
    const parts = f.path.split(".");
    const li = parts.findIndex((p) => p === "en" || p === "ht");
    if (li < 0) continue;
    const lang = parts[li] as "en" | "ht";
    parts[li] = "*";
    const key = parts.join(".");
    const p = pairs.get(key) ?? { key, en: null, ht: null };
    p[lang] = { path: f.path, value: f.value };
    pairs.set(key, p);
  }
  const [revs, sign] = await Promise.all([
    prisma.contentRevision.findMany({
      where: { contentId: id }, orderBy: { createdAt: "desc" }, take: 100,
      include: { author: { select: { email: true } }, reviewer: { select: { email: true } } },
    }),
    latestSignoff(id),
  ]);
  const toRev = (r: (typeof revs)[number]): Rev => ({
    id: r.id, path: r.path, oldValue: r.oldValue, newValue: r.newValue, note: r.note, status: r.status,
    author: r.author.email ?? "?", reviewer: r.reviewer?.email ?? null, selfApproved: r.selfApproved,
    createdAt: r.createdAt.toISOString(), reviewedAt: r.reviewedAt?.toISOString() ?? null,
  });
  const title = "ui" in base ? `${base.emoji} ${base.ui.en.room}` : `${base.emoji} ${base.title.en}`;
  return (
    <>
      <div className="card">
        <div className="stage"><Link href="/admin">← Admin</Link></div>
        <h2>{title}</h2>
        <p>Edits become <b>pending revisions</b>. Players only see a change after it is approved. Answer keys can only change in code.</p>
        <p className="status">{sign ? `✅ Last signed off by ${sign.reviewerName} on ${sign.createdAt.toISOString().slice(0, 10)}` : "⏳ Not yet signed off"}</p>
        <Link className="navlink" href={"ui" in base ? `/room/${id}/review` : `/scenario/${id}/review`}>Open the player review page →</Link>
      </div>
      <ContentEditor contentId={id} pairs={[...pairs.values()]} revs={revs.map(toRev)} defaultName={admin.displayName ?? ""} />
    </>
  );
}

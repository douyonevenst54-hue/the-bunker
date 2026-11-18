import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/admin";
import { contentStats, funnelStats } from "@/lib/analytics";
import { prisma } from "@/lib/db";
import { ROOMS } from "@/lib/rooms";
import { SCENARIOS } from "@/lib/scenarios";

export const dynamic = "force-dynamic";

const name = (id: string) => {
  const r = ROOMS.find((x) => x.id === id);
  if (r) return `${r.emoji} ${r.ui.en.room}`;
  const s = SCENARIOS.find((x) => x.id === id);
  return s ? `${s.emoji} ${s.title.en}` : id;
};

/** Admin dashboard: learning analytics + content review status. English only (staff tool). */
export default async function Admin() {
  const admin = await getAdmin();
  if (!admin) notFound();
  const [{ totals, rows }, funnel, pending, signoffs] = await Promise.all([
    contentStats(),
    funnelStats(30),
    prisma.contentRevision.groupBy({ by: ["contentId"], where: { status: "pending" }, _count: true }),
    prisma.contentSignoff.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  const pendingBy = new Map(pending.map((p) => [p.contentId, p._count]));
  const lastSign = new Map<string, (typeof signoffs)[number]>();
  for (const s of signoffs) if (!lastSign.has(s.contentId)) lastSign.set(s.contentId, s);

  return (
    <>
      <div className="card">
        <div className="stage">Admin · {admin.email}</div>
        <h2>THE BUNKER dashboard</h2>
        <div className="kpis">
          <div><b>{totals.players}</b><span>players</span></div>
          <div><b>{totals.registered}</b><span>accounts</span></div>
          <div><b>{totals.attempts}</b><span>attempts</span></div>
          <div><b>{totals.players ? Math.round((totals.registered / totals.players) * 100) : 0}%</b><span>guest → account</span></div>
        </div>
      </div>
      <div className="card funnel">
        <h3>Start → finish · last {funnel.days} days</h3>
        <p className="note" style={{ margin: "4px 0 10px" }}>{funnel.visitors} visitors started something. Finish rate = of the people who started, how many finished. Low rates show where players drop off.</p>
        <div className="kpis">
          <div><b>{funnel.device.phone}</b><span>on phones · {funnel.device.phoneFinishRate ?? "–"}% finish</span></div>
          <div><b>{funnel.device.desktop}</b><span>on computers · {funnel.device.desktopFinishRate ?? "–"}% finish</span></div>
        </div>
        <table className="funnel-t">
          <thead><tr><th>Room / level</th><th>Started</th><th>Finished</th><th>Finish rate</th><th>3D</th></tr></thead>
          <tbody>
            {funnel.rows.map((f) => (
              <tr key={f.id} className={f.rate !== null && f.rate < 50 ? "low" : ""}>
                <td>{name(f.id)}</td><td>{f.started}</td><td>{f.finished}</td><td>{f.rate === null ? "–" : `${f.rate}%`}</td><td>{f.threeD}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.map((r) => {
        const sign = lastSign.get(r.id);
        return (
          <div className="card admin-row" key={r.id}>
            <div className="ar-head">
              <h3>{name(r.id)}</h3>
              <Link className="go" href={`/admin/content/${r.id}`}>Edit & review{pendingBy.get(r.id) ? ` · ${pendingBy.get(r.id)} pending` : ""}</Link>
            </div>
            <div className="ar-stats">
              <span>{r.players} players</span>
              <span>{r.players ? Math.round((r.passed / r.players) * 100) : 0}% passed</span>
              <span>avg best {r.avgBest ?? "–"}</span>
              <span className={r.criticalErrors ? "bad" : ""}>{r.criticalErrors} critical errors</span>
            </div>
            {r.topMisses.length > 0 && (
              <ul className="misses">
                {r.topMisses.map((m, i) => <li key={i}>{m.critical ? "⚠️ " : ""}{m.label} <b>{m.rate}% missed</b></li>)}
              </ul>
            )}
            <div className="ar-sign">{sign ? `✅ Reviewed by ${sign.reviewerName} · ${sign.createdAt.toISOString().slice(0, 10)}` : "⏳ Not yet signed off"}</div>
          </div>
        );
      })}
    </>
  );
}

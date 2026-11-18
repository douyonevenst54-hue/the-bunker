import "server-only";
import { prisma } from "./db";
import { ROOMS } from "./rooms";
import { SCENARIOS } from "./scenarios";
import { judgePlacement } from "./scoring";

export interface Miss { label: string; rate: number; critical: boolean }
export interface ContentStats {
  id: string; players: number; passed: number; attempts: number; avgBest: number | null; criticalErrors: number; topMisses: Miss[];
}

/** Per-room learning analytics (design doc §25 KPIs). Looks at the latest 2,000 attempts per room. */
export async function contentStats(): Promise<{ totals: { players: number; registered: number; attempts: number }; rows: ContentStats[] }> {
  const [players, registered, attempts] = await Promise.all([
    prisma.player.count(), prisma.player.count({ where: { email: { not: null } } }), prisma.roomAttempt.count(),
  ]);
  const rows: ContentStats[] = [];
  for (const id of [...ROOMS.map((r) => r.id), ...SCENARIOS.map((s) => s.id)]) {
    const prog = await prisma.roomProgress.aggregate({ where: { roomId: id }, _count: true, _avg: { bestScore: true } });
    const passed = await prisma.roomProgress.count({ where: { roomId: id, passed: true } });
    const att = await prisma.roomAttempt.findMany({ where: { roomId: id }, orderBy: { createdAt: "desc" }, take: 2000, select: { answers: true, criticalErrors: true } });
    const misses = new Map<string, { n: number; critical: boolean }>();
    const bump = (label: string, critical: boolean) => { const m = misses.get(label) ?? { n: 0, critical }; m.n++; misses.set(label, m); };
    const room = ROOMS.find((r) => r.id === id);
    const sc = SCENARIOS.find((s) => s.id === id);
    for (const a of att) {
      try {
        if (room) {
          const ans = a.answers as { sort: string[]; stages: Record<string, number[]> };
          room.items.forEach((it, i) => { if (ans.sort[i] !== it.b) bump(`${it.e} ${it.en[0]}`, !!it.critical); });
          for (const S of room.stages) {
            const arr = ans.stages[S.key] ?? [];
            if (S.kind === "place") S.items.forEach((it, i) => { const j = judgePlacement(S, it, arr[i]); if (j !== "correct") bump(`${it.e} Place: ${it.name.en}`, j === "unsafe"); });
            else S.qs.forEach((q, i) => { if (arr[i] !== q.a) bump(q.en.q, !!q.critical); });
          }
        } else if (sc) {
          (a.answers as number[]).forEach((c, i) => { const ch = sc.events[i]?.choices[c]; if (ch && ch.outcome !== "best") bump(`${sc.events[i].time.en}: ${sc.events[i].text.en}`, ch.outcome === "unsafe"); });
        }
      } catch { /* old or malformed attempt shape */ }
    }
    const topMisses = [...misses.entries()].sort((x, y) => y[1].n - x[1].n).slice(0, 3)
      .map(([label, m]) => ({ label, rate: att.length ? Math.round((m.n / att.length) * 100) : 0, critical: m.critical }));
    rows.push({
      id, players: prog._count, passed, attempts: att.length,
      avgBest: prog._avg.bestScore === null ? null : Math.round(prog._avg.bestScore),
      criticalErrors: att.reduce((n, a) => n + a.criticalErrors, 0), topMisses,
    });
  }
  return { totals: { players, registered, attempts }, rows };
}

export interface FunnelRow { id: string; started: number; finished: number; rate: number | null; threeD: number }
export interface Funnel {
  days: number;
  visitors: number;
  rows: FunnelRow[];
  device: { phone: number; desktop: number; phoneFinishRate: number | null; desktopFinishRate: number | null };
}

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : null);

/** Start → finish funnel from PlayEvent (distinct visitors, last `days` days). */
export async function funnelStats(days = 30): Promise<Funnel> {
  const since = new Date(Date.now() - days * 864e5);
  const [byContent, byMode, byDevice, total] = await Promise.all([
    prisma.$queryRaw<{ contentId: string; kind: string; n: number }[]>`
      SELECT "contentId", "kind", COUNT(DISTINCT "visitor")::int AS n FROM "PlayEvent" WHERE "createdAt" > ${since} GROUP BY 1, 2`,
    prisma.$queryRaw<{ contentId: string; n: number }[]>`
      SELECT "contentId", COUNT(DISTINCT "visitor")::int AS n FROM "PlayEvent" WHERE "createdAt" > ${since} AND "kind" = 'start' AND "mode" = '3d' GROUP BY 1`,
    prisma.$queryRaw<{ device: string; kind: string; n: number }[]>`
      SELECT "device", "kind", COUNT(DISTINCT "visitor")::int AS n FROM "PlayEvent" WHERE "createdAt" > ${since} GROUP BY 1, 2`,
    prisma.$queryRaw<{ n: number }[]>`SELECT COUNT(DISTINCT "visitor")::int AS n FROM "PlayEvent" WHERE "createdAt" > ${since}`,
  ]);
  const get = (id: string, kind: string) => byContent.find((r) => r.contentId === id && r.kind === kind)?.n ?? 0;
  const rows = [...ROOMS.map((r) => r.id), ...SCENARIOS.map((s) => s.id)].map((id) => {
    const started = get(id, "start"), finished = get(id, "finish");
    return { id, started, finished, rate: pct(Math.min(finished, started), started), threeD: byMode.find((r) => r.contentId === id)?.n ?? 0 };
  });
  const dev = (d: string, k: string) => byDevice.find((r) => r.device === d && r.kind === k)?.n ?? 0;
  return {
    days, visitors: total[0]?.n ?? 0, rows,
    device: {
      phone: dev("phone", "start"), desktop: dev("desktop", "start"),
      phoneFinishRate: pct(Math.min(dev("phone", "finish"), dev("phone", "start")), dev("phone", "start")),
      desktopFinishRate: pct(Math.min(dev("desktop", "finish"), dev("desktop", "start")), dev("desktop", "start")),
    },
  };
}

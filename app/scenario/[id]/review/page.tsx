import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { liveScenario } from "@/lib/content";
import { asLang, LANG_COOKIE, STRINGS } from "@/lib/i18n";

/** Expert review: every event with every choice, its outcome and explanation. */
export default async function ScenarioReview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sc = await liveScenario(id);
  if (!sc) notFound();
  const lang = asLang((await cookies()).get(LANG_COOKIE)?.value);
  const s = STRINGS[lang];
  const mark = { best: "✅", poor: "🟡", unsafe: "⚠️" } as const;
  return (
    <div className="card">
      <div className="stage">{s.scenario}</div>
      <h2>{sc.title[lang]} · {s.review}</h2>
      {sc.briefing.map((b, i) => <p key={i}>{b[lang]}</p>)}
      {sc.events.map((ev, i) => (
        <div className="review-q" key={i}>
          <div className="stage">{ev.time[lang]} · {ev.room}</div>
          <div className="qq">{ev.text[lang]}</div>
          {ev.choices.map((c, k) => (
            <div key={k} style={{ margin: "8px 0" }}>
              <div className={c.outcome === "best" ? "ok" : "bad"} style={c.outcome === "unsafe" ? { color: "var(--bad)" } : undefined}>{mark[c.outcome]} {c.text[lang]}</div>
              <div className="ex">{c.why[lang]}</div>
            </div>
          ))}
        </div>
      ))}
      <p className="note">✅ best · 🟡 {s.couldBeBetter} · ⚠️ {s.unsafe} (critical)</p>
      <Link className="navlink" href="/">{s.backToBunker} →</Link>
    </div>
  );
}

import Icon from "@/components/Icon";
import { notFound, redirect } from "next/navigation";
import { getPlayer } from "@/lib/session";
import { needsPlan } from "@/lib/plan";
import { cookies } from "next/headers";
import Link from "next/link";
import { liveRoom } from "@/lib/content";
import { asLang, LANG_COOKIE, STRINGS } from "@/lib/i18n";

/** Expert review page: every item and question with its correct answer and explanation. */
export default async function Review({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = await liveRoom(id);
  if (!room) notFound();
  if (needsPlan(id, await getPlayer().catch(() => null))) redirect("/upgrade");
  const lang = asLang((await cookies()).get(LANG_COOKIE)?.value);
  const s = STRINGS[lang];
  const bin = { u: `✅ ${s.use}`, s: `➖ ${s.skip}`, a: `⚠️ ${s.avoid}` };
  return (
    <div className="card">
      <div className="stage">{room.ui[lang].room}</div>
      <h2>{s.review}</h2>
      <div className="review-sec">
        <div className="stage">{s.s1}</div>
        {room.items.map((it, i) => (
          <div className="review-q" key={i}>
            <div className="qq"><Icon e={it.e} /> {it[lang][0]}{it.critical ? " ⚠️" : ""}</div>
            <div className="ok">{bin[it.b]}</div>
            <div className="ex">{it[lang][1]}</div>
          </div>
        ))}
      </div>
      {room.stages.map((S) => (
        <div className="review-sec" key={S.key}>
          <div className="stage">{S.label[lang]}</div>
          {S.scene && <p>{S.scene[lang]}</p>}
          {S.kind === "place" ? S.items.map((it) => (
            <div className="review-q" key={it.id}>
              <div className="qq"><Icon e={it.e} /> {it.name[lang]}{it.unsafe?.length ? " ⚠️" : ""}</div>
              {S.zones.map((z) => it.ok.includes(z.id)
                ? <div className="ok" key={z.id}>✅ {z.label[lang]}</div>
                : it.unsafe?.includes(z.id)
                  ? <div className="bad" key={z.id} style={{ color: "var(--bad)" }}>⚠️ {z.label[lang]}</div>
                  : <div className="bad" key={z.id}>✗ {z.label[lang]}</div>)}
              <div className="ex">✅ {it.why.ok[lang]}</div>
              <div className="ex">✗ {it.why.wrong[lang]}</div>
              {it.why.unsafe && <div className="ex">⚠️ {it.why.unsafe[lang]}</div>}
            </div>
          )) : S.qs.map((q, i) => (
            <div className="review-q" key={i}>
              <div className="qq">{q[lang].q}{q.critical ? " ⚠️" : ""}</div>
              {q[lang].o.map((o, k) => k === q.a
                ? <div className="ok" key={k}>✅ {o}</div>
                : <div className="bad" key={k}>✗ {o}</div>)}
              <div className="ex">{q[lang].x}</div>
            </div>
          ))}
        </div>
      ))}
      <div className="review-sec">
        <h2>📋 {s.checklist}</h2>
        <ul className="check">{room.check[lang].map((x, i) => <li key={i}>{x}</li>)}</ul>
      </div>
      <p className="note">⚠️ = critical safety question</p>
      <Link className="navlink" href={`/room/${room.id}`}>{s.play} →</Link>
    </div>
  );
}

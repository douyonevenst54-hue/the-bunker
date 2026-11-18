"use client";
import ShareButton from "./ShareButton";
import { track } from "@/lib/track";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Scenario } from "@/lib/scenarios/types";
import { START_METERS, applyEffects, scoreScenario, type ScenarioResult } from "@/lib/scenarios";
import { optionOrder } from "@/lib/shuffle";
import { ROOMS } from "@/lib/rooms";
import { BADGES } from "@/lib/badges";
import { levelFor } from "@/lib/scoring";
import { useLang } from "./LangProvider";
import type { StringKey } from "@/lib/i18n";

type Save = "saving" | "saved" | "failed";

export default function ScenarioGame({ sc }: { sc: Scenario }) {
  const { lang, t } = useLang();
  const [step, setStep] = useState(-1); // -1 briefing, events…, events.length = debrief
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [meters, setMeters] = useState(START_METERS);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [save, setSave] = useState<Save>("saving");
  const [newBadges, setNewBadges] = useState<string[]>([]);

  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  async function finish(all: number[]) {
    setResult(scoreScenario(sc, all));
    setStep(sc.events.length);
    setSave("saving");
    try {
      const r = await fetch(`/api/scenarios/${sc.id}/complete`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers: all }),
      });
      if (!r.ok) throw new Error();
      const data = await r.json();
      setResult(data.result); setNewBadges(data.newBadges ?? []); setSave("saved"); track("finish", sc.id, "level");
    } catch { setSave("failed"); }
  }

  function restart() { setStep(-1); setAnswers([]); setPicked(null); setMeters(START_METERS); setResult(null); setNewBadges([]); }

  const meterBar = (
    <div className="meters">
      {([["power", "🔋", t("mPower")], ["food", "🧊", t("mFood")], ["safety", "🛡️", t("mSafety")]] as const).map(([k, ic, lb]) => (
        <div key={k} className="meter-row">
          <span>{ic} {lb}</span>
          <div className="track"><div className="fill" style={{ width: `${meters[k]}%`, background: meters[k] >= 60 ? "var(--good)" : meters[k] >= 30 ? "var(--mid)" : "var(--bad)" }} /></div>
        </div>
      ))}
    </div>
  );

  if (step === -1) return (
    <div className="card">
      <div className="stage">{t("scenario")}</div>
      <div className="hero">{sc.emoji}</div>
      <h1>{sc.title[lang]}</h1>
      {sc.briefing.map((b, i) => <p key={i}>{b[lang]}</p>)}
      {meterBar}
      <button className="btn" onClick={() => { track("start", sc.id, "level"); setStep(0); }}>{t("start")}</button>
    </div>
  );

  if (step < sc.events.length) {
    const ev = sc.events[step];
    const order = optionOrder(ev.choices.length, `${sc.id}/${step}`);
    const c = picked !== null ? ev.choices[picked] : null;
    return (
      <>
        <div className="progress">{sc.events.map((_, k) => <div key={k} className={k < step ? "done" : k === step ? "now" : ""} />)}</div>
        <div className="card">
          <div className="stage">{ev.time[lang]}</div>
          {meterBar}
          <h2>{ev.text[lang]}</h2>
          <div className="opts">
            {order.map((k) => (
              <button key={k} disabled={picked !== null}
                className={`opt ${picked !== null ? (ev.choices[k].outcome === "best" ? "right" : k === picked ? "wrong" : "") : ""}`}
                onClick={() => { setPicked(k); setMeters(applyEffects(meters, ev.choices[k].effects)); }}>
                {ev.choices[k].text[lang]}
              </button>
            ))}
          </div>
          {c && (
            <>
              <div className={`fb ${c.outcome === "best" ? "" : "no"} ${c.outcome === "unsafe" ? "unsafe" : ""}`}>
                <strong>{c.outcome === "best" ? "✅ " + t("right") : c.outcome === "unsafe" ? "⚠️ " + t("unsafe") : "🟡 " + t("couldBeBetter")}</strong>
                <p>{c.why[lang]}</p>
              </div>
              <button className="btn" onClick={() => {
                const all = [...answers, picked!];
                setAnswers(all); setPicked(null);
                if (step + 1 < sc.events.length) setStep(step + 1); else finish(all);
              }}>{t("next")}</button>
            </>
          )}
        </div>
      </>
    );
  }

  const r = result!;
  const level = r.criticalMisses.length ? "training" : levelFor(r.score);
  const col = r.criticalMisses.length ? "var(--bad)" : r.score >= 80 ? "var(--good)" : r.score >= 60 ? "var(--mid)" : "var(--bad)";
  return (
    <>
      <div className="card">
        <div className="stage">{t("debrief")}</div>
        <div className="score">
          <div className="big" style={{ color: col }}>{r.score}<small>/100</small></div>
          <span className="badge" style={{ background: col, color: "#111" }}>{t(`level_${level}` as StringKey)}</span>
        </div>
        {r.criticalMisses.length > 0 && (
          <div className="critical"><strong>⚠️ {t("criticalTitle")}</strong><p>{t("scenarioCritical")}</p></div>
        )}
        {newBadges.length > 0 && (
          <div className="new-badges"><strong>{t("newBadges")}</strong>
            {BADGES.filter((b) => newBadges.includes(b.id)).map((b) => <div key={b.id} className="nb"><span>{b.emoji}</span>{b.name[lang]}</div>)}
          </div>
        )}
        <div className="timeline">
          {sc.events.map((ev, i) => (
            <div key={i} className={`tl ${r.outcomes[i]}`}>
              <span className="tl-i">{r.outcomes[i] === "best" ? "✅" : r.outcomes[i] === "unsafe" ? "⚠️" : "🟡"}</span>
              <span className="tl-t"><b>{ev.time[lang]}</b> · {ev.choices[answers[i]].text[lang]}</span>
            </div>
          ))}
        </div>
        {r.reviewRooms.length > 0 && (
          <>
            <p style={{ marginTop: 12 }}>{t("reviewRooms")}</p>
            <div className="review-links">
              {r.reviewRooms.map((id) => { const room = ROOMS.find((x) => x.id === id)!; return (
                <Link key={id} className="btn ghost" href={`/room/${id}`}>{room.emoji} {room.ui[lang].room}</Link>
              ); })}
            </div>
          </>
        )}
        <div className="status">{save === "saving" ? t("saving") : save === "saved" ? t("saved") : t("notSaved")}</div>
        {r.passed && save === "saved" && <ShareButton label={t("shareResult")} text={t("shareLevelText").replace("{level}", sc.title[lang].replace(/^[^:]*:\s*/, ""))} />}
        <button className="btn" onClick={restart}>{t("again")}</button>
        <Link className="btn ghost" href="/">{t("backToBunker")}</Link>
        <div className="src">{t("sources")}<br />
          {sc.sources.map(([n, u]) => <span key={u}><a href={u} target="_blank" rel="noopener">{n}</a><br /></span>)}
        </div>
      </div>
    </>
  );
}

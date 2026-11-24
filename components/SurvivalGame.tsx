"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ShareButton from "./ShareButton";
import { track } from "@/lib/track";
import type { Stats, SurvivalMode } from "@/lib/survival/types";
import {
  END_HOUR, applyEffects, isLocked, kitSlots, passTime, simulate, startStats,
  type Shortage, type SurvivalResult,
} from "@/lib/survival";
import { optionOrder } from "@/lib/shuffle";
import { ROOMS } from "@/lib/rooms";
import { BADGES } from "@/lib/badges";
import { useLang } from "./LangProvider";

const U = {
  en: {
    mode: "Survival mode · 72 hours", packTitle: "Pack your kit", slots: "slots", start: "Start the 72 hours", startBrief: "Pack my kit",
    kitFull: "Your kit is full. Remove something to add this.", needs: "Needs", next: "6 hours pass", finish: "See how you did",
    water: "Water", food: "Food", phone: "Phone", health: "Health", morale: "Morale", gal: "gal", days: "days",
    right: "Good call", poor: "Could be better", unsafe: "Critical safety error", hour: "Hour",
    shortWater: "💧 You ran out of drinking water. Health and morale drop.", shortFood: "🥫 You ran out of food. Morale drops.", shortPower: "🔋 The phones are dead. You can't call for help.",
    madeIt: "Your family made it through 72 hours.", needHelp: "At hour {h}, your family needed emergency help.",
    passed: "Safe and ready", notPassed: "You made it, but it was risky", failed: "Didn't make it",
    critical: "Critical safety errors", criticalBody: "In real life these choices can kill. Read why below and try again.",
    packed: "What you packed", missed: "Worth packing next time", timeline: "Your 72 hours", review: "Rooms to review",
    again: "Play again", back: "Back to my bunker", saving: "Saving…", saved: "Saved", notSaved: "Not saved (you can still play)",
    newBadges: "New badge!", sources: "Sources", share: "Share my result",
    shareText: "My family survived 72 hours in THE BUNKER. Could yours? 🏕️",
    note: "A game for learning. In a real emergency, follow local officials and call 911.",
  },
  ht: {
    mode: "Mòd siviv · 72 èdtan", packTitle: "Ranje twous ou", slots: "plas", start: "Kòmanse 72 èdtan yo", startBrief: "Ranje twous mwen",
    kitFull: "Twous ou plen. Retire yon bagay pou mete sa a.", needs: "Bezwen", next: "6 èdtan pase", finish: "Gade rezilta ou",
    water: "Dlo", food: "Manje", phone: "Telefòn", health: "Sante", morale: "Moral", gal: "gal", days: "jou",
    right: "Bon chwa", poor: "Te ka pi bon", unsafe: "Erè grav pou sekirite", hour: "Èdtan",
    shortWater: "💧 Dlo pou bwè fini. Sante ak moral bese.", shortFood: "🥫 Manje fini. Moral bese.", shortPower: "🔋 Telefòn yo mouri. Ou pa ka rele èd.",
    madeIt: "Fanmi ou travèse 72 èdtan yo.", needHelp: "Nan èdtan {h}, fanmi ou te bezwen èd ijans.",
    passed: "An sekirite epi pare", notPassed: "Nou rive, men te gen danje", failed: "Nou pa rive",
    critical: "Erè grav pou sekirite", criticalBody: "Nan lavi reyèl, chwa sa yo ka touye. Li poukisa anba a epi eseye ankò.",
    packed: "Sa ou te pran", missed: "Sa ki ta bon pou pran pwochen fwa", timeline: "72 èdtan ou yo", review: "Chanm pou revize",
    again: "Jwe ankò", back: "Retounen nan bunker mwen", saving: "Ap sove…", saved: "Sove", notSaved: "Pa sove (ou ka kontinye jwe)",
    newBadges: "Nouvo badj!", sources: "Sous", share: "Pataje rezilta mwen",
    shareText: "Fanmi mwen siviv 72 èdtan nan THE BUNKER. E pa w? 🏕️",
    note: "Se yon jwèt pou aprann. Nan yon vrè ijans, swiv otorite lokal yo epi rele 911.",
  },
} as const;

/** Items a well-prepared family should have; shown after the run if they weren't packed. */
const ESSENTIALS = ["water3", "food3", "opener", "flashlight", "radio", "firstaid", "meds", "baby", "sanitation"];

type Save = "saving" | "saved" | "failed";
type Phase = "brief" | "kit" | "play" | "end";

export default function SurvivalGame({ mode }: { mode: SurvivalMode }) {
  const { lang } = useLang();
  const u = U[lang];
  const [phase, setPhase] = useState<Phase>("brief");
  const [kit, setKit] = useState<string[]>([]);
  const [turn, setTurn] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats>(startStats([]));
  const [short, setShort] = useState<Shortage[]>([]);
  const [warn, setWarn] = useState(false);
  const [result, setResult] = useState<SurvivalResult | null>(null);
  const [save, setSave] = useState<Save>("saving");
  const [newBadges, setNewBadges] = useState<string[]>([]);

  useEffect(() => { window.scrollTo(0, 0); }, [phase, turn]);

  const used = kitSlots(mode, kit);
  const item = (id: string) => mode.kit.find((k) => k.id === id)!;

  function toggle(id: string) {
    if (kit.includes(id)) { setKit(kit.filter((k) => k !== id)); setWarn(false); return; }
    if (used + item(id).slots > mode.kitBudget) { setWarn(true); return; }
    setKit([...kit, id]); setWarn(false);
  }

  function begin() {
    setStats(startStats(kit)); setTurn(0); setAnswers([]); setPicked(null); setShort([]);
    setPhase("play"); track("start", mode.id, "level");
  }

  function choose(k: number) {
    setPicked(k);
    setStats(applyEffects(stats, mode.turns[turn].choices[k].effects));
  }

  async function finish(all: number[]) {
    const r = simulate(mode, kit, all);
    setResult(r); setPhase("end"); setSave("saving");
    try {
      const res = await fetch(`/api/survival/${mode.id}/complete`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kit, answers: all }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data.result); setNewBadges(data.newBadges ?? []); setSave("saved"); track("finish", mode.id, "level");
    } catch { setSave("failed"); }
  }

  function next() {
    const all = [...answers, picked!];
    const p = passTime(stats);
    setAnswers(all); setPicked(null); setStats(p.stats); setShort(p.short);
    if (p.stats.health <= 0 || turn + 1 >= mode.turns.length) finish(all);
    else setTurn(turn + 1);
  }

  function restart() { setPhase("kit"); setResult(null); setNewBadges([]); setShort([]); }

  const bar = (v: number, max = 100) => {
    const pct = Math.max(0, Math.min(100, (v / max) * 100));
    return <div className="track"><div className="fill" style={{ width: `${pct}%`, background: pct >= 60 ? "var(--good)" : pct >= 30 ? "var(--mid)" : "var(--bad)" }} /></div>;
  };
  const statPanel = (s: Stats) => (
    <div className="meters sv-stats">
      <div className="meter-row"><span>💧 {u.water}</span>{bar(s.water, 15)}<b>{s.water.toFixed(1)} {u.gal}</b></div>
      <div className="meter-row"><span>🥫 {u.food}</span>{bar(s.food, 3)}<b>{s.food.toFixed(1)} {u.days}</b></div>
      <div className="meter-row"><span>🔋 {u.phone}</span>{bar(s.power)}<b>{Math.round(s.power)}%</b></div>
      <div className="meter-row"><span>❤️ {u.health}</span>{bar(s.health)}<b>{Math.round(s.health)}</b></div>
      <div className="meter-row"><span>🙂 {u.morale}</span>{bar(s.morale)}<b>{Math.round(s.morale)}</b></div>
    </div>
  );

  if (phase === "brief") return (
    <div className="card">
      <div className="stage">{u.mode}</div>
      <div className="hero">🌀⏱️</div>
      <h1>{mode.title[lang]}</h1>
      {mode.briefing.map((b, i) => <p key={i}>{b[lang]}</p>)}
      <button className="btn" onClick={() => setPhase("kit")}>🎒 {u.startBrief}</button>
      <p className="note">{u.note}</p>
    </div>
  );

  if (phase === "kit") return (
    <div className="card">
      <div className="stage">{u.mode}</div>
      <h1>{u.packTitle}</h1>
      <div className="sv-slots" aria-live="polite">
        <div className="track"><div className="fill" style={{ width: `${(used / mode.kitBudget) * 100}%`, background: "var(--amber)" }} /></div>
        <b>{used} / {mode.kitBudget} {u.slots}</b>
      </div>
      {warn && <p className="note" style={{ color: "var(--bad)" }}>{u.kitFull}</p>}
      <div className="sv-kit">
        {mode.kit.map((k) => {
          const on = kit.includes(k.id);
          return (
            <button key={k.id} className={`sv-item ${on ? "on" : ""}`} aria-pressed={on} onClick={() => toggle(k.id)}>
              <span className="sv-em">{k.emoji}</span>
              <span className="sv-nm">{k.name[lang]}</span>
              <span className="sv-sl">{"▮".repeat(k.slots)}</span>
            </button>
          );
        })}
      </div>
      <button className="btn" onClick={begin}>▶ {u.start}</button>
    </div>
  );

  if (phase === "play") {
    const t = mode.turns[turn];
    const order = optionOrder(t.choices.length, `${mode.id}/${turn}`);
    const c = picked !== null ? t.choices[picked] : null;
    return (
      <>
        <div className="sv-clock">
          <span>⏱️ {u.hour} {t.hour} / {END_HOUR}</span>
          <div className="track"><div className="fill" style={{ width: `${(t.hour / END_HOUR) * 100}%`, background: "var(--amber)" }} /></div>
        </div>
        <div className="card">
          <div className="stage">{t.time[lang]}</div>
          {statPanel(stats)}
          {short.length > 0 && (
            <div className="sv-short">{short.map((s) => <p key={s}>{s === "water" ? u.shortWater : s === "food" ? u.shortFood : u.shortPower}</p>)}</div>
          )}
          <h2>{t.text[lang]}</h2>
          <div className="opts">
            {order.map((k) => {
              const ch = t.choices[k];
              const locked = isLocked(ch, kit);
              const missing = (ch.needs ?? []).filter((id) => !kit.includes(id));
              return (
                <button key={k} disabled={picked !== null || locked}
                  className={`opt ${locked ? "sv-locked" : ""} ${picked !== null ? (ch.outcome === "best" && !locked ? "right" : k === picked ? "wrong" : "") : ""}`}
                  onClick={() => choose(k)}>
                  {ch.text[lang]}
                  {ch.needs && <span className="sv-need">{locked ? "🔒" : "✓"} {u.needs}: {(locked ? missing : ch.needs).map((id) => `${item(id).emoji} ${item(id).name[lang]}`).join(" + ")}</span>}
                </button>
              );
            })}
          </div>
          {c && (
            <>
              <div className={`fb ${c.outcome === "best" ? "" : "no"} ${c.outcome === "unsafe" ? "unsafe" : ""}`}>
                <strong>{c.outcome === "best" ? "✅ " + u.right : c.outcome === "unsafe" ? "⚠️ " + u.unsafe : "🟡 " + u.poor}</strong>
                <p>{c.why[lang]}</p>
              </div>
              <button className="btn" onClick={next}>{turn + 1 >= mode.turns.length ? u.finish : `⏩ ${u.next}`}</button>
            </>
          )}
        </div>
      </>
    );
  }

  const r = result!;
  const col = r.passed ? "var(--good)" : r.survived ? "var(--mid)" : "var(--bad)";
  const missed = ESSENTIALS.filter((id) => !kit.includes(id));
  return (
    <div className="card">
      <div className="stage">{u.mode}</div>
      <div className="score">
        <div className="big" style={{ color: col }}>{r.score}<small>/100</small></div>
        <span className="badge" style={{ background: col, color: "#111" }}>{r.passed ? u.passed : r.survived ? u.notPassed : u.failed}</span>
      </div>
      <h2>{r.survived ? u.madeIt : u.needHelp.replace("{h}", String(r.hoursSurvived))}</h2>
      {statPanel(r.stats)}
      {r.criticalMisses.length > 0 && <div className="critical"><strong>⚠️ {u.critical}</strong><p>{u.criticalBody}</p></div>}
      {newBadges.length > 0 && (
        <div className="new-badges"><strong>{u.newBadges}</strong>
          {BADGES.filter((b) => newBadges.includes(b.id)).map((b) => <div key={b.id} className="nb"><span>{b.emoji}</span>{b.name[lang]}</div>)}
        </div>
      )}
      <div className="stage" style={{ marginTop: 16 }}>{u.packed}</div>
      <ul className="sv-notes">
        {kit.length === 0 ? <li>—</li> : kit.map((id) => <li key={id}><b>{item(id).emoji} {item(id).name[lang]}</b> · {item(id).note[lang]}</li>)}
      </ul>
      {missed.length > 0 && (<>
        <div className="stage" style={{ marginTop: 12 }}>{u.missed}</div>
        <ul className="sv-notes">{missed.map((id) => <li key={id}><b>{item(id).emoji} {item(id).name[lang]}</b> · {item(id).note[lang]}</li>)}</ul>
      </>)}
      <div className="stage" style={{ marginTop: 12 }}>{u.timeline}</div>
      <div className="timeline">
        {answers.map((a, i) => (
          <div key={i} className={`tl ${r.outcomes[i]}`}>
            <span className="tl-i">{r.outcomes[i] === "best" ? "✅" : r.outcomes[i] === "unsafe" ? "⚠️" : "🟡"}</span>
            <span className="tl-t"><b>{mode.turns[i].time[lang]}</b> · {mode.turns[i].choices[a].text[lang]}<br /><small>{mode.turns[i].choices[a].why[lang]}</small></span>
          </div>
        ))}
      </div>
      {r.reviewRooms.length > 0 && (<>
        <p style={{ marginTop: 12 }}>{u.review}</p>
        <div className="review-links">
          {r.reviewRooms.map((id) => { const room = ROOMS.find((x) => x.id === id); return room && (
            <Link key={id} className="btn ghost" href={`/room/${id}`}>{room.emoji} {room.ui[lang].room}</Link>
          ); })}
        </div>
      </>)}
      <div className="status">{save === "saving" ? u.saving : save === "saved" ? u.saved : u.notSaved}</div>
      {r.survived && save === "saved" && <ShareButton label={u.share} text={u.shareText} />}
      <button className="btn" onClick={restart}>{u.again}</button>
      <Link className="btn ghost" href="/">{u.back}</Link>
      <p className="note">{u.note}</p>
      <div className="src">{u.sources}<br />
        {mode.sources.map(([n, url]) => <span key={url}><a href={url} target="_blank" rel="noopener">{n}</a><br /></span>)}
      </div>
    </div>
  );
}

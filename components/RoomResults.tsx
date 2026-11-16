"use client";
import { useState } from "react";
import Link from "next/link";
import type { Room } from "@/lib/rooms/types";
import type { RoomResult } from "@/lib/scoring";
import { useLang } from "./LangProvider";
import { BADGES } from "@/lib/badges";
import type { StringKey } from "@/lib/i18n";

export type Save = "saving" | "saved" | "failed";

/** Score, critical errors, categories, new badges, checklist and sources. Shared by the 2D and 3D rooms. */
export default function RoomResults({ room, result, save, newBadges, onRestart, progress }: {
  room: Room; result: RoomResult; save: Save; newBadges: string[]; onRestart: () => void; progress?: React.ReactNode;
}) {
  const { lang, t } = useLang();
  const [copied, setCopied] = useState(false);
  const ui = room.ui[lang];
  const r = result;
  const col = (v: number) => (v >= 80 ? "var(--good)" : v >= 60 ? "var(--mid)" : "var(--bad)");
  const scoreCol = r.criticalMisses.length ? "var(--bad)" : col(r.score);
  const catName = (key: string) => key === "sort" ? ui.catSort : room.stages.find((s) => s.key === key)!.cat[lang];
  const missedText = r.criticalMisses.map((en) => {
    const it = room.items.find((x) => x.en[0] === en);
    if (it) return it[lang][0];
    for (const S of room.stages) {
      if (S.kind === "place") { const p = S.items.find((x) => x.name.en === en); if (p) return `${p.e} ${p.name[lang]}`; }
      else { const q = S.qs.find((x) => x.en.q === en); if (q) return q[lang].q; }
    }
    return en;
  });
  return (
    <>{progress}
      <div className="card">
        <div className="stage">{t("results")}</div>
        <div className="score">
          <div className="big" style={{ color: scoreCol }}>{r.score}<small>/100</small></div>
          <span className="badge" style={{ background: scoreCol, color: "#111" }}>{r.level === "expert" ? "🏅 " : ""}{t(`level_${r.level}` as StringKey)}</span>
        </div>
        {r.criticalMisses.length > 0 && (
          <div className="critical">
            <strong>⚠️ {t("criticalTitle")}</strong>
            <p>{t("criticalBody")}</p>
            <ul>{missedText.map((m, i) => <li key={i}>{m}</li>)}</ul>
          </div>
        )}
        {r.categories.map((c) => {
          const v = Math.round((c.correct / c.total) * 100);
          return (
            <div className="bar" key={c.key}>
              <div className="row"><span>{catName(c.key)}</span><span>{c.correct}/{c.total}</span></div>
              <div className="track"><div className="fill" style={{ width: `${v}%`, background: col(v) }} /></div>
            </div>
          );
        })}
        {newBadges.length > 0 && (
          <div className="new-badges">
            <strong>{t("newBadges")}</strong>
            {BADGES.filter((b) => newBadges.includes(b.id)).map((b) => (
              <div key={b.id} className="nb"><span>{b.emoji}</span>{b.name[lang]}</div>
            ))}
          </div>
        )}
        <div className="status">{save === "saving" ? t("saving") : save === "saved" ? t("saved") : t("notSaved")}</div>
        {r.passed && room.next
          ? <Link className="btn" href={`/room/${room.next}`}>{t("nextRoom")} →</Link>
          : !r.passed && <p className="status">{t("unlockHint")}</p>}
        <button className={`btn ${r.passed && room.next ? "ghost" : ""}`} onClick={onRestart}>{t("again")}</button>
        <Link className="btn ghost" href="/">{t("backToBunker")}</Link>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h2>📋 {t("checklist")}</h2><p>{t("checkSub")}</p>
        <ul className="check">{room.check[lang].map((x, i) => <li key={i}>{x}</li>)}</ul>
        <button className="btn ghost" onClick={async () => {
          try { await navigator.clipboard.writeText(`THE BUNKER — ${t("checklist")}\n` + room.check[lang].map((x) => "☐ " + x).join("\n")); setCopied(true); } catch {}
        }}>{copied ? t("copied") : t("copy")}</button>
        <div className="src">{t("sources")}<br />
          {room.sources.map(([n, u]) => <span key={u}><a href={u} target="_blank" rel="noopener">{n}</a><br /></span>)}
        </div>
      </div>
      <p className="note" dangerouslySetInnerHTML={{ __html: t("proto") }} />
    </>
  );
}

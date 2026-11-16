"use client";
import { useRef, useState } from "react";
import type { Lang, PlaceStage } from "@/lib/rooms/types";
import { judgePlacement, type Placement } from "@/lib/scoring";
import type { StringKey } from "@/lib/i18n";

const PW = 360, PH = 300;

function wrap(text: string, max = 22): string[] {
  const words = text.split(" ");
  const out: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max && line) { out.push(line); line = w; }
    else line = (line + " " + w).trim();
  }
  if (line) out.push(line);
  return out.slice(0, 3);
}

/**
 * Drag-and-drop room. Works three ways: drag with a finger or mouse,
 * tap an item then tap a spot, or keyboard (Tab to an item, Enter, Tab to a spot, Enter).
 * Each item is placed once; the first placement is the one that counts.
 */
export default function PlaceBoard({ S, lang, t, onDone }: {
  S: PlaceStage; lang: Lang; t: (k: StringKey) => string; onDone: (zoneIndexes: number[]) => void;
}) {
  const [placed, setPlaced] = useState<(number | null)[]>(() => S.items.map(() => null));
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ item: number; result: Placement } | null>(null);
  const [drag, setDrag] = useState<{ item: number; x: number; y: number } | null>(null);
  const start = useRef<{ x: number; y: number; item: number; moved: boolean } | null>(null);

  const results = placed.map((z, i) => (z === null ? null : judgePlacement(S, S.items[i], z)));
  const done = placed.every((z) => z !== null);
  const active = selected ?? drag?.item ?? null;

  function place(item: number, zone: number) {
    if (placed[item] !== null) return;
    const next = [...placed]; next[item] = zone;
    setPlaced(next);
    setSelected(null);
    setFeedback({ item, result: judgePlacement(S, S.items[item], zone) });
  }

  function zoneAt(x: number, y: number): number | null {
    const el = document.elementFromPoint(x, y)?.closest("[data-zone]");
    return el ? Number(el.getAttribute("data-zone")) : null;
  }

  function onPointerDown(e: React.PointerEvent, item: number) {
    if (placed[item] !== null) return;
    start.current = { x: e.clientX, y: e.clientY, item, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    const s = start.current;
    if (!s) return;
    if (!s.moved && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 8) { s.moved = true; setSelected(null); }
    if (s.moved) setDrag({ item: s.item, x: e.clientX, y: e.clientY });
  }
  function onPointerUp(e: React.PointerEvent) {
    const s = start.current;
    start.current = null;
    if (!s) return;
    if (s.moved) {
      setDrag(null);
      const z = zoneAt(e.clientX, e.clientY);
      if (z !== null) place(s.item, z);
    } else {
      setSelected(selected === s.item ? null : s.item); // tap to select
    }
  }

  const fb = feedback && S.items[feedback.item];
  const bestZones = fb ? S.zones.filter((z) => fb.ok.includes(z.id)).map((z) => z.label[lang]).join(" / ") : "";

  return (
    <>
      <p className="place-hint">{active !== null ? t("tapSpot") : t("placeHint")}</p>
      <svg className={`place-plan ${active !== null ? "armed" : ""}`} viewBox={`0 0 ${PW} ${PH}`} role="group" aria-label={S.label[lang]}>
        {S.zones.map((z, zi) => {
          const here = placed.map((p, i) => (p === zi ? i : -1)).filter((i) => i >= 0);
          return (
            <g key={z.id} data-zone={zi} className="pz" tabIndex={active !== null ? 0 : -1} role="button"
              aria-label={z.label[lang]}
              onClick={() => { if (selected !== null) place(selected, zi); }}
              onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && selected !== null) { e.preventDefault(); place(selected, zi); } }}>
              <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="10" />
              {wrap(z.label[lang]).map((ln, k) => (
                <text key={k} x={z.x + 10} y={z.y + 18 + k * 13} className="pz-label">{ln}</text>
              ))}
              {here.map((i, k) => (
                <g key={i}>
                  <rect x={z.x + 8 + k * 38} y={z.y + z.h - 38} width="32" height="30" rx="7" className={`pz-item ${results[i]}`} />
                  <text x={z.x + 24 + k * 38} y={z.y + z.h - 17} textAnchor="middle" className="pz-emoji">{S.items[i].e}</text>
                </g>
              ))}
            </g>
          );
        })}
      </svg>

      {fb && feedback && (
        <div className={`fb ${feedback.result === "correct" ? "" : "no"} ${feedback.result === "unsafe" ? "unsafe" : ""}`}>
          <strong>
            {feedback.result === "correct" ? "✅ " + t("right") : feedback.result === "unsafe" ? "⚠️ " + t("unsafe") : "❌ " + t("wrong")}
            {" · "}{fb.e} {fb.name[lang]}
          </strong>
          <p>{feedback.result === "correct" ? fb.why.ok[lang] : feedback.result === "unsafe" ? (fb.why.unsafe ?? fb.why.wrong)[lang] : fb.why.wrong[lang]}</p>
          {feedback.result !== "correct" && <p className="best">{t("bestSpot")}: {bestZones}</p>}
        </div>
      )}

      {!done && (
        <div className="tray">
          {S.items.map((it, i) => placed[i] === null && (
            <button key={it.id} className={`tray-item ${selected === i ? "sel" : ""} ${drag?.item === i ? "dragging" : ""}`}
              onPointerDown={(e) => onPointerDown(e, i)} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
              onPointerCancel={() => { start.current = null; setDrag(null); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(selected === i ? null : i); } }}
              aria-pressed={selected === i}>
              <span className="ti-e">{it.e}</span><span className="ti-n">{it.name[lang]}</span>
            </button>
          ))}
        </div>
      )}
      {done && <button className="btn" onClick={() => onDone(placed as number[])}>{t("next")}</button>}

      {drag && (
        <div className="drag-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden>
          {S.items[drag.item].e}
        </div>
      )}
    </>
  );
}

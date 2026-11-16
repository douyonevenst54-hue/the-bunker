"use client";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { stageLength, type Bin, type Room, type RoomAnswers } from "@/lib/rooms/types";
import { judgePlacement, scoreRoom, type Placement, type RoomResult } from "@/lib/scoring";
import { optionOrder } from "@/lib/shuffle";
import { useLang } from "../LangProvider";
import RoomResults, { type Save } from "../RoomResults";
import { Scene, VIEWS, SLOTS, crateSpot, type V3, type CrateState } from "./World";

type Phase = "brief" | "outside" | "corridor" | "room" | "results";
type View = { pos: V3; look: V3 };

/**
 * The 3D version of a room. Same items, spots, questions and server scoring as the 2D game;
 * only the way you play changes. Every action also has an on-screen button, so the room can be
 * finished without precise tapping in 3D (and by keyboard / screen reader).
 */
export default function Room3D({ room, otherRooms }: { room: Room; otherRooms: string[] }) {
  const { lang, t } = useLang();
  const ui = room.ui[lang];
  const [phase, setPhase] = useState<Phase>("brief");
  const [view, setView] = useState<View>(VIEWS.outside);
  const [doorOpen, setDoorOpen] = useState(false);
  const [roomDoorOpen, setRoomDoorOpen] = useState(false);

  // step -1 = sorting supplies, then each stage in order
  const [step, setStep] = useState(-1);
  const [sorted, setSorted] = useState<(Bin | null)[]>(() => room.items.map(() => null));
  const [inspect, setInspect] = useState<number | null>(null);

  const [placed, setPlaced] = useState<(number | null)[]>([]);
  const [selItem, setSelItem] = useState<number | null>(null);
  const [placeFb, setPlaceFb] = useState<{ item: number; r: Placement } | null>(null);

  const [terminalOpen, setTerminalOpen] = useState(false);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const ans = useRef<RoomAnswers>({ sort: [], stages: {} });
  const [result, setResult] = useState<RoomResult | null>(null);
  const [save, setSave] = useState<Save>("saving");
  const [newBadges, setNewBadges] = useState<string[]>([]);

  const S = step >= 0 ? room.stages[step] : null;
  const allSorted = sorted.every((b) => b !== null);

  /* --------------------------------------------------------------- moves */
  function enter() { setPhase("outside"); setView(VIEWS.outside); }
  function openMainDoor() {
    if (phase !== "outside") return;
    setDoorOpen(true);
    setTimeout(() => { setPhase("corridor"); setView(VIEWS.corridor); }, 700);
  }
  function openRoomDoor() {
    if (phase !== "corridor") return;
    setView(VIEWS.atDoor);
    setTimeout(() => setRoomDoorOpen(true), 500);
    setTimeout(() => { setPhase("room"); setView(VIEWS.pallet); }, 1500);
  }

  /* ------------------------------------------------------------- sorting */
  function inspectCrate(i: number) {
    if (phase !== "room" || step !== -1 || sorted[i] !== null) return;
    setInspect(i);
    const p = crateSpot(i);
    setView({ pos: [p[0] - 2.2, 1.7, p[2]], look: [p[0], p[1] + 0.2, p[2]] });
  }
  function nextOpenCrate() {
    const i = sorted.findIndex((b) => b === null);
    if (i >= 0) inspectCrate(i);
  }
  function sortAs(b: Bin) {
    if (inspect === null || sorted[inspect] !== null) return;
    ans.current.sort[inspect] = b;
    const nx = [...sorted]; nx[inspect] = b; setSorted(nx);
  }
  function closeInspect() {
    setInspect(null);
    if (allSorted) beginStage(0); else setView(VIEWS.pallet);
  }

  /* -------------------------------------------------------------- stages */
  function beginStage(s: number) {
    if (s >= room.stages.length) { finish(); return; }
    const st = room.stages[s];
    setStep(s); setQi(0); setPicked(null); setTerminalOpen(false); setSelItem(null); setPlaceFb(null);
    if (st.kind === "place") { setPlaced(st.items.map(() => null)); setView(VIEWS.room); }
    else setView(VIEWS.room);
  }

  function chooseZone(z: number) {
    if (!S || S.kind !== "place" || selItem === null || placed[selItem] !== null) return;
    const nx = [...placed]; nx[selItem] = z; setPlaced(nx);
    setPlaceFb({ item: selItem, r: judgePlacement(S, S.items[selItem], z) });
    setSelItem(null);
    const slot = SLOTS[z] ?? SLOTS[0];
    setView(slot.view);
  }
  function lookAtZone(z: number) { const slot = SLOTS[z] ?? SLOTS[0]; setView(slot.view); }
  function finishPlace() {
    if (!S || S.kind !== "place") return;
    ans.current.stages[S.key] = placed as number[];
    beginStage(step + 1);
  }

  function openTerminal() {
    if (phase !== "room" || !S || S.kind === "place") return;
    setTerminalOpen(true); setView(VIEWS.terminal);
  }
  function answer(k: number) {
    if (!S || S.kind === "place" || picked !== null) return;
    (ans.current.stages[S.key] ??= [])[qi] = k;
    setPicked(k);
  }
  function nextQuestion() {
    if (!S) return;
    setPicked(null);
    if (qi + 1 < stageLength(S)) setQi(qi + 1);
    else beginStage(step + 1);
  }

  async function finish() {
    const a = ans.current;
    setResult(scoreRoom(room, a));
    setPhase("results"); setView(VIEWS.room); setSave("saving");
    try {
      const r = await fetch(`/api/rooms/${room.id}/complete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers: a }) });
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json();
      setResult(data.result); setNewBadges(Array.isArray(data.newBadges) ? data.newBadges : []); setSave("saved");
    } catch { setSave("failed"); }
  }
  function restart() {
    ans.current = { sort: [], stages: {} };
    setSorted(room.items.map(() => null)); setInspect(null); setStep(-1); setResult(null); setNewBadges([]);
    setPhase("room"); setView(VIEWS.pallet);
  }

  /* ---------------------------------------------------------------- 3D props */
  const crates: CrateState[] = sorted.map((b, i) => (b === null ? "open" : b === room.items[i].b ? "right" : "wrong"));
  const placeS = S?.kind === "place" ? S : null;
  // The room's furniture (placement spots) is always there, even before or after the placing stage.
  const furniture = room.stages.find((x) => x.kind === "place");
  const placedAt = useMemo(() => {
    const out: string[][] = [];
    if (placeS) placed.forEach((z, i) => { if (z !== null) (out[z] ??= []).push(placeS.items[i].e); });
    return out;
  }, [placeS, placed]);
  const inRoom = phase === "room" || phase === "results";

  /* ------------------------------------------------------------------ HUD */
  const bins: [Bin, string, string][] = [["u", "✅", t("use")], ["s", "➖", t("skip")], ["a", "⚠️", t("avoid")]];
  let panel: React.ReactNode = null;
  if (phase === "brief") {
    panel = (
      <div className="b3-panel">
        <div className="stage">{ui.room}</div>
        <h2>{room.emoji} {ui.title}</h2>
        <p>{ui.intro1}</p><p>{ui.intro2}</p>
        <p className="b3-tip">👆 {t("tipLook")}</p>
        <button className="btn" onClick={enter}>{t("enterBunker")}</button>
      </div>
    );
  } else if (phase === "outside") {
    panel = <div className="b3-panel slim"><p>{t("goDoor")}</p><button className="btn" onClick={openMainDoor}>🚪 {t("openDoor")}</button></div>;
  } else if (phase === "corridor") {
    panel = <div className="b3-panel slim"><p>{t("findRoom")}</p><button className="btn" onClick={openRoomDoor}>{room.emoji} {t("enterRoom")}</button></div>;
  } else if (phase === "room" && step === -1) {
    if (inspect !== null) {
      const it = room.items[inspect];
      const b = sorted[inspect];
      panel = (
        <div className="b3-panel">
          <div className="stage">{t("discovered")} · {sorted.filter(Boolean).length + (b ? 0 : 1)} {t("of")} {room.items.length}</div>
          <h2><span className="b3-em">{it.e}</span> {it[lang][0]}</h2>
          {!b && <p>{t("whatDo")}</p>}
          <div className="bins">
            {bins.map(([k, ic, lb]) => (
              <button key={k} disabled={!!b} className={`bin ${b ? (k === it.b ? "right" : k === b ? "wrong" : "") : ""}`} onClick={() => sortAs(k)}>
                <b>{ic}</b>{lb}
              </button>
            ))}
          </div>
          {b && (<>
            <div className={`fb ${b === it.b ? "" : "no"}`}><strong>{b === it.b ? "✅ " + t("right") : "❌ " + t("wrong")}</strong><p>{it[lang][1]}</p></div>
            <button className="btn" onClick={closeInspect}>{t("next")}</button>
          </>)}
        </div>
      );
    } else {
      panel = (
        <div className="b3-panel slim">
          <div className="stage">{t("s1")} · {sorted.filter(Boolean).length}/{room.items.length} {t("sortedOf")}</div>
          <p>{t("inspectHint")}</p>
          <button className="btn" onClick={nextOpenCrate}>🔍 {t("inspectNext")}</button>
        </div>
      );
    }
  } else if (phase === "room" && placeS) {
    const fb = placeFb && placeS.items[placeFb.item];
    const done = placed.every((z) => z !== null);
    const best = fb ? placeS.zones.filter((z) => fb.ok.includes(z.id)).map((z) => z.label[lang]).join(" / ") : "";
    panel = (
      <div className="b3-panel">
        <div className="stage">{placeS.label[lang]} · {placed.filter((z) => z !== null).length}/{placeS.items.length} {t("placedOf")}</div>
        {placeS.scene && <p className="b3-scene">{placeS.scene[lang]}</p>}
        {fb && placeFb && (
          <div className={`fb ${placeFb.r === "correct" ? "" : "no"} ${placeFb.r === "unsafe" ? "unsafe" : ""}`}>
            <strong>{placeFb.r === "correct" ? "✅ " + t("right") : placeFb.r === "unsafe" ? "⚠️ " + t("unsafe") : "❌ " + t("wrong")} · {fb.e} {fb.name[lang]}</strong>
            <p>{placeFb.r === "correct" ? fb.why.ok[lang] : placeFb.r === "unsafe" ? (fb.why.unsafe ?? fb.why.wrong)[lang] : fb.why.wrong[lang]}</p>
            {placeFb.r !== "correct" && <p className="best">{t("bestSpot")}: {best}</p>}
          </div>
        )}
        {!done && (<>
          <p className="b3-tip">{selItem === null ? t("placeHint3d") : t("pickSpot")}</p>
          <div className="tray">
            {placeS.items.map((it, i) => placed[i] === null && (
              <button key={it.id} className={`tray-item ${selItem === i ? "sel" : ""}`} aria-pressed={selItem === i}
                onClick={() => { setSelItem(selItem === i ? null : i); setPlaceFb(null); }}>
                <span className="ti-e">{it.e}</span><span className="ti-n">{it.name[lang]}</span>
              </button>
            ))}
          </div>
          <div className="b3-zones">
            {placeS.zones.map((z, zi) => (
              <button key={z.id} className="b3-zone" disabled={selItem === null}
                onClick={() => chooseZone(zi)} onMouseEnter={() => selItem !== null && lookAtZone(zi)}>{z.label[lang]}</button>
            ))}
          </div>
        </>)}
        {done && <button className="btn" onClick={finishPlace}>{t("next")}</button>}
      </div>
    );
  } else if (phase === "room" && S && S.kind !== "place") {
    if (!terminalOpen) {
      panel = (
        <div className="b3-panel slim">
          <div className="stage">{S.label[lang]}</div>
          <p>{t("terminalHint")}</p>
          <button className="btn" onClick={openTerminal}>🖥 {t("openTerminal")}</button>
        </div>
      );
    } else {
      const q = S.qs[qi], d = q[lang];
      panel = (
        <div className="b3-panel">
          <div className="stage">🖥 {t("terminal")} · {S.label[lang]} · {qi + 1} {t("of")} {S.qs.length}</div>
          {S.scene && qi === 0 && <p className="b3-scene">{S.scene[lang]}</p>}
          <h2>{d.q}</h2>
          <div className="opts">
            {optionOrder(d.o.length, `${room.id}/${S.key}/${qi}`).map((k) => (
              <button key={k} disabled={picked !== null} className={`opt ${picked !== null ? (k === q.a ? "right" : k === picked ? "wrong" : "") : ""}`} onClick={() => answer(k)}>{d.o[k]}</button>
            ))}
          </div>
          {picked !== null && (<>
            <div className={`fb ${picked === q.a ? "" : "no"}`}><strong>{picked === q.a ? "✅ " + t("right") : "❌ " + t("wrong")}</strong><p>{d.x}</p></div>
            <button className="btn" onClick={nextQuestion}>{t("next")}</button>
          </>)}
        </div>
      );
    }
  }

  return (
    <div className="b3">
      <div className="b3-canvas">
        <Canvas camera={{ fov: 70, position: VIEWS.outside.pos, near: 0.05, far: 80 }} dpr={[1, 1.75]} gl={{ antialias: true }}>
          <Scene
            view={view}
            showRoom={phase === "corridor" || inRoom}
            outside={{ doorOpen, glow: phase === "outside", onDoor: openMainDoor, showLabels: phase === "outside" || phase === "brief", title: "THE BUNKER" }}
            corridor={{ roomDoorOpen, glow: phase === "corridor", onRoomDoor: openRoomDoor, showLabels: phase === "corridor", roomTitle: `${room.emoji} ${ui.room}`, others: otherRooms }}
            room={{
              items: room.items, crates, glowCrates: phase === "room" && step === -1 && inspect === null, onCrate: inspectCrate,
              zones: furniture?.kind === "place" ? furniture.zones.map((z) => z.label[lang]) : [], glowZones: selItem !== null, onZone: chooseZone, placedAt,
              terminalGlow: phase === "room" && !!S && S.kind !== "place" && !terminalOpen, onTerminal: openTerminal,
              showLabels: inRoom, terminalLabel: t("terminal"),
            }}
          />
        </Canvas>
      </div>
      <div className="b3-top">
        <Link href="/" className="b3-x" aria-label={t("exit3d")}>✕</Link>
        <span className="b3-title">{room.emoji} {ui.room}</span>
        <Link href={`/room/${room.id}`} className="b3-lite">{t("lite")}</Link>
      </div>
      {phase === "results" && result ? (
        <div className="b3-results">
          <RoomResults room={room} result={result} save={save} newBadges={newBadges} onRestart={restart} />
        </div>
      ) : panel}
    </div>
  );
}

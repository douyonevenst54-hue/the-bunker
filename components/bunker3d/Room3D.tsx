"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { stageLength, type Bin, type Room, type RoomAnswers } from "@/lib/rooms/types";
import { judgePlacement, scoreRoom, type Placement, type RoomResult } from "@/lib/scoring";
import { optionOrder } from "@/lib/shuffle";
import { useLang } from "../LangProvider";
import RoomResults, { type Save } from "../RoomResults";
import { Scene, SLOTS, crateSpot, themeFor, type V3, type CrateState } from "./World";
import { ROOMS_3D } from "@/lib/rooms/three-d";
import Icon from "../Icon";
import { Walker, type WalkerApi, type MoveInput, type Interactable } from "./Walker";
import { buildObstacles, stationBox, standSpot, type AABB, type Region } from "./nav";
import { LAYOUTS } from "./Props";
import Inspector from "./Inspector";

type Phase = "brief" | "outside" | "corridor" | "room" | "results";

const MAIN_DOOR_AT: V3 = [0, 1.3, 0];
const ROOM_DOOR_AT: V3 = [1.5, 1.3, -7.5];
const TERMINAL_AT: V3 = [1.62, 1.5, -10.6];
const ROOM_VIEW: V3 = [8, 1, -7.5];

/**
 * The 3D version of a room. Same items, spots, questions and server scoring as the 2D game;
 * only the way you play changes. You walk at eye level (stick / keys, drag to look); things you can
 * use glow, and an action button appears when you're close. Every action also has an on-screen
 * button that walks you there, so the room can be finished without precise moves (and by keyboard).
 */
export default function Room3D({ room, otherRooms }: { room: Room; otherRooms: string[] }) {
  const { lang, t } = useLang();
  const ui = room.ui[lang];
  const theme = themeFor(room.id);
  const layout = LAYOUTS[room.id];
  const walker = useRef<WalkerApi>(null);
  const input = useRef<MoveInput>({ fx: 0, fz: 0 });

  const [phase, setPhase] = useState<Phase>("brief");
  const [doorOpen, setDoorOpen] = useState(false);
  const [roomDoorOpen, setRoomDoorOpen] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [touch, setTouch] = useState(false);
  useEffect(() => { setTouch(window.matchMedia("(pointer: coarse)").matches); }, []);

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
  const placeS = S?.kind === "place" ? S : null;
  const furniture = room.stages.find((x) => x.kind === "place");
  const zoneCount = furniture?.kind === "place" ? furniture.zones.length : 0;

  /* ----------------------------------------------------------- where things are */
  const itemAt = useCallback((i: number): V3 => layout?.items[i]?.at ?? crateSpot(i), [layout]);
  const zoneAt = (z: number): V3 => { const a = (SLOTS[z] ?? SLOTS[0]).at; return [a[0], 1.1, a[2]]; };

  const obstacles: AABB[] = useMemo(() => {
    const extra: AABB[] = [];
    for (let z = 0; z < zoneCount; z++) extra.push(stationBox((SLOTS[z] ?? SLOTS[0]).at, z === 1 && room.id === "security" ? 1.9 : 0.9));
    if (layout?.table) extra.push({ x0: layout.table[0] - 0.62, x1: layout.table[0] + 0.62, z0: layout.table[2] - 0.42, z1: layout.table[2] + 0.42 });
    if (!layout) extra.push({ x0: 5.8, x1: 9.0, z0: -9.1, z1: -5.9 });
    if (layout?.removeBoxesFromBackdoor) extra.push({ x0: 8.1, x1: 9.1, z0: -4.6, z1: -3 }); // boxes moved off the back door
    return buildObstacles(extra, doorOpen, roomDoorOpen);
  }, [zoneCount, layout, doorOpen, roomDoorOpen, room.id]);

  /* -------------------------------------------------------------- walking */
  /** Walk to stand in front of `look` (auto path through doorways), then run `then`. */
  function goTo(look: V3, then?: () => void, dist = 1.3) {
    const [x, z] = standSpot(look[0], look[2], dist);
    walker.current?.walkTo(x, z, look, then);
  }
  function onRegion(r: Region) {
    setPhase((p) => (p === "brief" || p === "results" ? p : r));
  }

  /* --------------------------------------------------------------- moves */
  function enter() { setPhase("outside"); setMinimized(false); }
  function walkIntoRoom() { walker.current?.walkTo(4, -7.5, ROOM_VIEW); }
  function openMainDoor() {
    if (doorOpen) { walker.current?.walkTo(0, -1.6, [0, 1.4, -12]); return; }
    walker.current?.walkTo(0, 2.2, MAIN_DOOR_AT, () => {
      setDoorOpen(true);
      setTimeout(() => walker.current?.walkTo(0, -1.6, [0, 1.4, -12]), 600);
    });
  }
  function openRoomDoor() {
    if (roomDoorOpen) { walkIntoRoom(); return; }
    walker.current?.walkTo(0.2, -7.5, ROOM_DOOR_AT, () => {
      setRoomDoorOpen(true);
      setTimeout(walkIntoRoom, 700);
    });
  }

  /* ------------------------------------------------------------- sorting */
  function openInspect(i: number) {
    if (step !== -1 || sorted[i] !== null) return;
    setInspect(i); setMinimized(false);
    walker.current?.lookAt(itemAt(i));
  }
  function inspectItem(i: number) {
    if (phase !== "room" || step !== -1 || sorted[i] !== null) return;
    goTo(itemAt(i), () => openInspect(i), layout ? 1.4 : 1.6);
  }
  function nextOpenItem() {
    const i = sorted.findIndex((b) => b === null);
    if (i >= 0) inspectItem(i);
  }
  function sortAs(b: Bin) {
    if (inspect === null || sorted[inspect] !== null) return;
    ans.current.sort[inspect] = b;
    const nx = [...sorted]; nx[inspect] = b; setSorted(nx);
  }
  function closeInspect() {
    setInspect(null);
    if (allSorted) beginStage(0);
  }

  /* -------------------------------------------------------------- stages */
  function beginStage(s: number) {
    if (s >= room.stages.length) { finish(); return; }
    const st = room.stages[s];
    setStep(s); setQi(0); setPicked(null); setSelItem(null); setPlaceFb(null); setMinimized(false);
    // stay at the terminal when one question stage follows another
    setTerminalOpen((open) => open && st.kind !== "place");
    if (st.kind === "place") { setPlaced(st.items.map(() => null)); walker.current?.walkTo(5.5, -7.5, ROOM_VIEW); }
  }
  function chooseZone(z: number) {
    if (!placeS || selItem === null || placed[selItem] !== null) return;
    const item = selItem;
    const nx = [...placed]; nx[item] = z; setPlaced(nx);
    setPlaceFb({ item, r: judgePlacement(placeS, placeS.items[item], z) });
    setSelItem(null); setMinimized(false);
    goTo(zoneAt(z), undefined, 1.8);
  }
  function finishPlace() {
    if (!placeS) return;
    ans.current.stages[placeS.key] = placed as number[];
    beginStage(step + 1);
  }
  function openTerminal() {
    if (phase !== "room" || !S || S.kind === "place") return;
    goTo(TERMINAL_AT, () => { setTerminalOpen(true); setMinimized(false); }, 1.4);
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
    setPhase("results"); setSave("saving");
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
    setTerminalOpen(false); setPhase("room"); walkIntoRoom();
  }

  /* -------------------------------------------- what's usable right now */
  const interactables: Interactable[] = useMemo(() => {
    if (phase === "outside" && !doorOpen) return [{ id: "door", at: MAIN_DOOR_AT, range: 3.6 }];
    if (phase === "corridor" && !roomDoorOpen) return [{ id: "roomDoor", at: ROOM_DOOR_AT, range: 2.8 }];
    if (phase !== "room") return [];
    if (step === -1 && inspect === null) return sorted.flatMap((b, i) => (b === null ? [{ id: `item:${i}`, at: itemAt(i), range: 2.4 }] : []));
    if (placeS && selItem !== null) return placeS.zones.map((_, z) => ({ id: `zone:${z}`, at: zoneAt(z), range: 2.6 }));
    if (S && S.kind !== "place" && !terminalOpen) return [{ id: "terminal", at: TERMINAL_AT, range: 2.6 }];
    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, doorOpen, roomDoorOpen, step, inspect, sorted, placeS, selItem, S, terminalOpen, itemAt]);

  const actRef = useRef<() => void>(() => {});
  actRef.current = () => {
    if (!focus || paused) return;
    if (focus === "door") { setDoorOpen(true); return; }
    if (focus === "roomDoor") { setRoomDoorOpen(true); return; }
    if (focus === "terminal") { setTerminalOpen(true); setMinimized(false); return; }
    if (focus.startsWith("item:")) { openInspect(Number(focus.slice(5))); return; }
    if (focus.startsWith("zone:")) chooseZone(Number(focus.slice(5)));
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "BUTTON" || tag === "A") { if (e.key === "Escape") setPaused((p) => !p); return; }
      if (e.key === "e" || e.key === "E" || e.key === "Enter") actRef.current();
      if (e.key === "Escape") setPaused((p) => !p);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  const actLabel = !focus ? null : focus === "door" ? t("actOpen") : focus === "roomDoor" ? t("actEnter") : focus === "terminal" ? t("actTerminal") : focus.startsWith("item:") ? t("actInspect") : t("actPlace");

  /* ---------------------------------------------------------------- 3D props */
  const crates: CrateState[] = sorted.map((b, i) => (b === null ? "open" : b === room.items[i].b ? "right" : "wrong"));
  const placedAt = useMemo(() => {
    const out: string[][] = [];
    if (placeS) placed.forEach((z, i) => { if (z !== null) (out[z] ??= []).push(placeS.items[i].e); });
    return out;
  }, [placeS, placed]);
  const inRoom = phase === "room" || phase === "results";

  /* ------------------------------------------------------------------ HUD */
  const bins: [Bin, string, string][] = [["u", "✅", t("use")], ["s", "➖", t("skip")], ["a", "⚠️", t("avoid")]];
  let hint: React.ReactNode = null;   // top bar: where to go next + a button that walks you there
  let sheet: React.ReactNode = null;  // bottom sheet: questions and feedback
  let sheetTitle = "";

  if (phase === "brief") {
    sheet = (
      <div className="b3-panel">
        <div className="stage">{ui.room}</div>
        <h2>{room.emoji} {ui.title}</h2>
        <p>{ui.intro1}</p><p>{ui.intro2}</p>
        <p className="b3-tip">🕹️ {touch ? t("controlsTouch") : t("controlsKeys")}</p>
        <button className="btn" onClick={enter}>{t("enterBunker")}</button>
      </div>
    );
  } else if (phase === "outside") {
    hint = <><span>{t("goDoor")}</span><button className="b3-hbtn" onClick={openMainDoor}>🚪 {t("openDoor")}</button></>;
  } else if (phase === "corridor") {
    hint = <><span>{t("findRoom")}</span><button className="b3-hbtn" onClick={openRoomDoor}>{room.emoji} {t("enterRoom")}</button></>;
  } else if (phase === "room" && step === -1) {
    if (inspect !== null) {
      const it = room.items[inspect];
      const b = sorted[inspect];
      sheetTitle = it[lang][0];
      sheet = (
        <div className="b3-panel">
          <div className="stage">{t("discovered")} · {sorted.filter(Boolean).length + (b ? 0 : 1)} {t("of")} {room.items.length}</div>
          {layout?.items[inspect] && <Inspector model={layout.items[inspect].model} />}
          <h2><span className="b3-em"><Icon e={it.e} /></span> {it[lang][0]}</h2>
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
      hint = <><span>{t("s1")} · {sorted.filter(Boolean).length}/{room.items.length} {t("sortedOf")} · {t("walkHint")}</span>
        <button className="b3-hbtn" onClick={nextOpenItem}>🔍 {t("inspectNext")}</button></>;
    }
  } else if (phase === "room" && placeS) {
    const fb = placeFb && placeS.items[placeFb.item];
    const done = placed.every((z) => z !== null);
    const best = fb ? placeS.zones.filter((z) => fb.ok.includes(z.id)).map((z) => z.label[lang]).join(" / ") : "";
    sheetTitle = placeS.label[lang];
    sheet = (
      <div className="b3-panel">
        <div className="stage">{placeS.label[lang]} · {placed.filter((z) => z !== null).length}/{placeS.items.length} {t("placedOf")}</div>
        {placeS.scene && <p className="b3-scene">{placeS.scene[lang]}</p>}
        {fb && placeFb && (
          <div className={`fb ${placeFb.r === "correct" ? "" : "no"} ${placeFb.r === "unsafe" ? "unsafe" : ""}`}>
            <strong>{placeFb.r === "correct" ? "✅ " + t("right") : placeFb.r === "unsafe" ? "⚠️ " + t("unsafe") : "❌ " + t("wrong")} · <Icon e={fb.e} /> {fb.name[lang]}</strong>
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
                <span className="ti-e"><Icon e={it.e} /></span><span className="ti-n">{it.name[lang]}</span>
              </button>
            ))}
          </div>
          <div className="b3-zones">
            {placeS.zones.map((z, zi) => (
              <button key={z.id} className="b3-zone" disabled={selItem === null} onClick={() => chooseZone(zi)}>{z.label[lang]}</button>
            ))}
          </div>
        </>)}
        {done && <button className="btn" onClick={finishPlace}>{t("next")}</button>}
      </div>
    );
  } else if (phase === "room" && S && S.kind !== "place") {
    if (!terminalOpen) {
      hint = <><span>{S.label[lang]} · {t("terminalHint")}</span><button className="b3-hbtn" onClick={openTerminal}>🖥 {t("openTerminal")}</button></>;
    } else {
      const q = S.qs[qi], d = q[lang];
      sheetTitle = `${t("terminal")} · ${qi + 1}/${S.qs.length}`;
      sheet = (
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

  const sheetOpen = !!sheet && !minimized;
  const canWalk = phase !== "brief" && phase !== "results" && !paused;

  return (
    <div className="b3">
      <div className="b3-canvas">
        <Canvas camera={{ fov: 70, position: [0, 1.6, 9], near: 0.05, far: 80 }} dpr={[1, 1.75]} gl={{ antialias: true }}>
          <Scene
            walker={<Walker api={walker} input={input} obstacles={obstacles} start={{ x: 0, z: 9, yaw: 0 }}
              interactables={interactables} onFocus={setFocus} onRegion={onRegion} paused={!canWalk} />}
            showRoom={phase === "corridor" || inRoom}
            outside={{ doorOpen, glow: phase === "outside", onDoor: openMainDoor, showLabels: phase === "outside" || phase === "brief", title: "THE BUNKER" }}
            corridor={{ roomDoorOpen, glow: phase === "corridor", onRoomDoor: openRoomDoor, showLabels: phase === "corridor", roomTitle: `${room.emoji} ${ui.room}`, others: otherRooms, doorColor: theme.door }}
            room={{
              roomId: room.id, focusId: focus,
              theme, items: room.items, crates, glowCrates: phase === "room" && step === -1 && inspect === null, onCrate: inspectItem,
              zones: furniture?.kind === "place" ? furniture.zones.map((z) => z.label[lang]) : [],
              zoneIds: furniture?.kind === "place" ? furniture.zones.map((z) => z.id) : [], glowZones: selItem !== null, onZone: chooseZone, placedAt,
              terminalGlow: phase === "room" && !!S && S.kind !== "place" && !terminalOpen, onTerminal: openTerminal,
              showLabels: inRoom, terminalLabel: t("terminal"),
            }}
          />
        </Canvas>
      </div>

      <div className="b3-top">
        <a href="/" className="b3-x" aria-label={t("exit3d")}>✕</a>
        <span className="b3-title">{room.emoji} {ui.room}</span>
        {phase !== "brief" && phase !== "results" && <button className="b3-x" onClick={() => setPaused(true)} aria-label={t("pause")}>⏸</button>}
        <a href={`/room/${room.id}`} className="b3-lite">{t("lite")}</a>
      </div>
      {hint && !paused && <div className="b3-hint">{hint}</div>}

      {canWalk && !sheetOpen && (<>
        {touch && <Joystick input={input} />}
        {actLabel && <button className="b3-act" onClick={() => actRef.current()}>{actLabel}</button>}
      </>)}

      {phase === "results" && result ? (
        <div className="b3-results">
          <RoomResults room={room} result={result} save={save} newBadges={newBadges} onRestart={restart}
            nextHref={room.next && ROOMS_3D.includes(room.next) ? `/room/${room.next}/3d` : undefined} hardNav />
        </div>
      ) : sheet && (minimized
        ? <button className="b3-tab" onClick={() => setMinimized(false)}>▲ {t("show")}: {sheetTitle}</button>
        : <div className="b3-sheet">
            {phase !== "brief" && <button className="b3-min" onClick={() => setMinimized(true)} aria-label={t("hide")}>▼ {t("hide")}</button>}
            {sheet}
          </div>)}

      {paused && (
        <div className="b3-pause" role="dialog" aria-label={t("pause")}>
          <div className="b3-panel">
            <h2>⏸ {t("pause")}</h2>
            <p className="b3-tip"><b>{t("controlsTitle")}</b><br />{touch ? t("controlsTouch") : t("controlsKeys")}</p>
            <button className="btn" onClick={() => setPaused(false)}>{t("resume")}</button>
            <a className="btn ghost" href={`/room/${room.id}`}>{t("lite")}</a>
            <a className="btn ghost" href="/">{t("exit3d")}</a>
          </div>
        </div>
      )}
    </div>
  );
}

/** Touch joystick: drag the knob to walk (up = forward). */
function Joystick({ input }: { input: React.RefObject<MoveInput> }) {
  const [k, setK] = useState({ x: 0, y: 0 });
  const base = useRef<HTMLDivElement>(null);
  const R = 46;
  function update(e: React.PointerEvent) {
    const r = base.current!.getBoundingClientRect();
    let x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(x, y);
    if (d > R) { x = (x / d) * R; y = (y / d) * R; }
    setK({ x, y });
    input.current = { fx: x / R, fz: -y / R };
  }
  function end() { setK({ x: 0, y: 0 }); input.current = { fx: 0, fz: 0 }; }
  return (
    <div ref={base} className="b3-joy" onPointerDown={(e) => { e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); update(e); }}
      onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) update(e); }} onPointerUp={end} onPointerCancel={end}>
      <div className="b3-knob" style={{ transform: `translate(${k.x}px, ${k.y}px)` }} />
    </div>
  );
}

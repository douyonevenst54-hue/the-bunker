"use client";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/track";
import { stageLength, type Bin, type Room, type RoomAnswers } from "@/lib/rooms/types";
import PlaceBoard from "./PlaceBoard";
import { optionOrder } from "@/lib/shuffle";
import Link from "next/link";
import { ROOMS_3D } from "@/lib/rooms/three-d";
import { scoreRoom, type RoomResult } from "@/lib/scoring";
import { useLang } from "./LangProvider";
import RoomResults, { type Save } from "./RoomResults";
import Icon from "./Icon";

type Screen = { kind: "intro" } | { kind: "sort"; i: number } | { kind: "stage"; s: number; i: number } | { kind: "results" };

export default function RoomGame({ room, reviewed }: { room: Room; reviewed?: { name: string; date: string } | null }) {
  const { lang, t } = useLang();
  const [screen, setScreen] = useState<Screen>({ kind: "intro" });
  const [picked, setPicked] = useState<string | number | null>(null);
  const ans = useRef<RoomAnswers>({ sort: [], stages: {} });
  const [result, setResult] = useState<RoomResult | null>(null);
  const [save, setSave] = useState<Save>("saving");
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const ui = room.ui[lang];

  const steps = ["sort", ...room.stages.map((s) => s.key), "results"];
  const current = screen.kind === "intro" ? -1 : screen.kind === "sort" ? 0 : screen.kind === "stage" ? screen.s + 1 : steps.length - 1;

  useEffect(() => { window.scrollTo(0, 0); }, [screen]);

  function restart() {
    ans.current = { sort: [], stages: {} };
    setResult(null); setNewBadges([]); setPicked(null); setScreen({ kind: "intro" });
  }

  async function finish() {
    const a = ans.current;
    setResult(scoreRoom(room, a)); // instant, same rules as the server
    setScreen({ kind: "results" });
    setSave("saving");
    try {
      const r = await fetch(`/api/rooms/${room.id}/complete`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers: a }),
      });
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json();
      setResult(data.result); // the server's score is the official one
      setNewBadges(Array.isArray(data.newBadges) ? data.newBadges : []);
      setSave("saved");
      track("finish", room.id, "2d");
    } catch {
      setSave("failed");
    }
  }

  function next() {
    setPicked(null);
    if (screen.kind === "sort") {
      if (screen.i + 1 < room.items.length) setScreen({ kind: "sort", i: screen.i + 1 });
      else setScreen({ kind: "stage", s: 0, i: 0 });
    } else if (screen.kind === "stage") {
      const S = room.stages[screen.s];
      if (screen.i + 1 < stageLength(S)) setScreen({ kind: "stage", s: screen.s, i: screen.i + 1 });
      else nextStage(screen.s);
    }
  }

  function nextStage(s: number) {
    setPicked(null);
    if (s + 1 < room.stages.length) setScreen({ kind: "stage", s: s + 1, i: 0 });
    else finish();
  }

  const progress = (
    <div className="progress">
      {steps.map((_, k) => <div key={k} className={k < current ? "done" : k === current ? "now" : ""} />)}
    </div>
  );

  const feedback = (ok: boolean, x: string) => (
    <>
      <div className={`fb ${ok ? "" : "no"}`}><strong>{ok ? "✅ " + t("right") : "❌ " + t("wrong")}</strong><p>{x}</p></div>
      <button className="btn" onClick={next}>{t("next")}</button>
    </>
  );

  if (screen.kind === "intro") return (
    <>
      <div className="card">
        <div className="stage">{ui.room}</div>
        <div className="hero">{room.emoji}</div>
        <h1>{ui.title}</h1><p>{ui.intro1}</p><p>{ui.intro2}</p>
        {ROOMS_3D.includes(room.id) && <Link className="btn b3-cta" href={`/room/${room.id}/3d`}>{t("play3d")}</Link>}
        <button className={`btn ${ROOMS_3D.includes(room.id) ? "ghost" : ""}`} onClick={() => { track("start", room.id, "2d"); setScreen({ kind: "sort", i: 0 }); }}>{t("start")}</button>
        {reviewed && <p className="reviewed">✅ {t("reviewedBy")} {reviewed.name} · {reviewed.date}</p>}
      </div>
      <p className="note" dangerouslySetInnerHTML={{ __html: t("proto") }} />
    </>
  );

  if (screen.kind === "sort") {
    const it = room.items[screen.i];
    const bins: [Bin, string, string][] = [["u", "✅", t("use")], ["s", "➖", t("skip")], ["a", "⚠️", t("avoid")]];
    const p = picked as Bin | null;
    return (
      <>{progress}
        <div className="card">
          <div className="stage">{t("s1")}</div><h2>{t("s1t")}</h2>
          <div className="count">{screen.i + 1} {t("of")} {room.items.length}</div>
          <div className="item"><div className="em"><Icon e={it.e} /></div><div className="nm">{it[lang][0]}</div></div>
          <div className="bins">
            {bins.map(([k, ic, lb]) => (
              <button key={k} disabled={!!p} className={`bin ${p ? (k === it.b ? "right" : k === p ? "wrong" : "") : ""}`}
                onClick={() => { ans.current.sort[screen.i] = k; setPicked(k); }}>
                <b>{ic}</b>{lb}
              </button>
            ))}
          </div>
          {p && feedback(p === it.b, it[lang][1])}
        </div>
      </>
    );
  }

  if (screen.kind === "stage" && room.stages[screen.s].kind === "place") {
    const S = room.stages[screen.s];
    if (S.kind !== "place") return null;
    return (
      <>{progress}
        <div className="card">
          <div className="stage">{S.label[lang]}</div>
          {S.scene && <div className="scene"><div className="tag">{S.scene[lang]}</div></div>}
          <PlaceBoard key={S.key} S={S} lang={lang} t={t} onDone={(z) => { ans.current.stages[S.key] = z; nextStage(screen.s); }} />
        </div>
      </>
    );
  }

  if (screen.kind === "stage") {
    const S = room.stages[screen.s];
    if (S.kind === "place") return null;
    const q = S.qs[screen.i];
    const d = q[lang];
    const p = picked as number | null;
    return (
      <>{progress}
        <div className="card">
          <div className="stage">{S.label[lang]}</div>
          {S.scene && screen.i === 0 && <div className="scene"><div className="tag">{S.scene[lang]}</div></div>}
          <div className="count">{screen.i + 1} {t("of")} {S.qs.length}</div>
          <h2>{d.q}</h2>
          <div className="opts">
            {optionOrder(d.o.length, `${room.id}/${S.key}/${screen.i}`).map((k) => (
              <button key={k} disabled={p !== null} className={`opt ${p !== null ? (k === q.a ? "right" : k === p ? "wrong" : "") : ""}`}
                onClick={() => { (ans.current.stages[S.key] ??= [])[screen.i] = k; setPicked(k); }}>
                {d.o[k]}
              </button>
            ))}
          </div>
          {p !== null && feedback(p === q.a, d.x)}
        </div>
      </>
    );
  }

  return <RoomResults room={room} result={result!} save={save} newBadges={newBadges} onRestart={restart} progress={progress} />;
}

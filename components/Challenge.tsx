"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Boards } from "@/lib/challenge";
import { useLang } from "./LangProvider";

const U = {
  en: {
    stage: "72-Hour Challenge", title: "This week's survivors",
    sub: "Play the 72-hour survival mode as often as you like: your best score this week counts. Crews add up their 5 best players. A new week starts every Monday.",
    play: "▶ Play the 72 hours", players: "Players", crews: "Crews", empty: "No scores yet this week. Be the first!",
    you: "You", yourBest: "Your best this week", rank: "rank", notYet: "You haven't played this week yet.",
    nick: "Your public name", nickHelp: "Shown on the leaderboard instead of your real name. 3–20 letters or numbers.", save: "Save", saved: "Saved",
    crewTitle: "Your crew", crewNone: "Play with family, friends, your church or school. Everyone plays on their own time.",
    create: "Create a crew", crewName: "Crew name", join: "Join with a code", code: "6-letter code", joinBtn: "Join",
    invite: "Invite to my crew", copied: "Link copied", leave: "Leave crew", members: "members", crewScore: "Crew score", top5: "Top 5 players count",
    noScore: "not played yet", inviteText: "Join my crew in THE BUNKER's 72-Hour Challenge! Can we keep our families safe for 72 hours?",
    errName: "That name isn't allowed. Use 3–20 letters or numbers, nothing rude.", errInCrew: "Leave your current crew first.",
    errCode: "No crew with that code.", errFull: "That crew is full (12 players).", err: "Something went wrong. Try again.",
  },
  ht: {
    stage: "Defi 72 Èdtan", title: "Sivivan semèn sa a",
    sub: "Jwe mòd siviv 72 èdtan an otan fwa ou vle: pi bon nòt ou semèn nan konte. Ekip yo adisyone 5 pi bon jwè yo. Yon nouvo semèn kòmanse chak lendi.",
    play: "▶ Jwe 72 èdtan yo", players: "Jwè", crews: "Ekip", empty: "Poko gen nòt semèn sa a. Se ou ki premye!",
    you: "Ou", yourBest: "Pi bon nòt ou semèn sa a", rank: "plas", notYet: "Ou poko jwe semèn sa a.",
    nick: "Non piblik ou", nickHelp: "Se li ki parèt nan klasman an olye vrè non ou. 3 rive 20 lèt oswa chif.", save: "Sove", saved: "Sove",
    crewTitle: "Ekip ou", crewNone: "Jwe ak fanmi, zanmi, legliz oswa lekòl ou. Chak moun jwe lè yo vle.",
    create: "Kreye yon ekip", crewName: "Non ekip la", join: "Antre ak yon kòd", code: "Kòd 6 lèt", joinBtn: "Antre",
    invite: "Envite nan ekip mwen", copied: "Lyen an kopye", leave: "Kite ekip la", members: "manm", crewScore: "Nòt ekip la", top5: "5 pi bon jwè yo konte",
    noScore: "poko jwe", inviteText: "Vin nan ekip mwen nan Defi 72 Èdtan THE BUNKER! Èske nou ka kenbe fanmi nou an sekirite pandan 72 èdtan?",
    errName: "Non sa a pa otorize. Sèvi ak 3 rive 20 lèt oswa chif, anyen ki malelve.", errInCrew: "Kite ekip ou ye a anvan.",
    errCode: "Pa gen ekip ak kòd sa a.", errFull: "Ekip sa a plen (12 jwè).", err: "Gen yon pwoblèm. Eseye ankò.",
  },
} as const;

type Key = keyof typeof U.en;

export default function Challenge({ data }: { data: Boards }) {
  const { lang } = useLang();
  const u = U[lang];
  const router = useRouter();
  const [tab, setTab] = useState<"players" | "crews">("players");
  const [nick, setNick] = useState(data.me?.nickname ?? "");
  const [crewName, setCrewName] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ where: string; text: string; ok?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const me = data.me;

  async function act(where: string, body: object, okText?: string) {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/challenge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setMsg({ where, text: j.error && j.error in u ? u[j.error as Key] : u.err }); return; }
      if (okText) setMsg({ where, text: okText, ok: true });
      router.refresh();
    } catch { setMsg({ where, text: u.err }); } finally { setBusy(false); }
  }

  async function invite(c: string) {
    const url = `${window.location.origin}/crew/${c}`;
    const share = { title: "THE BUNKER", text: u.inviteText, url };
    if (typeof navigator.share === "function") { try { await navigator.share(share); return; } catch (e) { if ((e as Error).name === "AbortError") return; } }
    try { await navigator.clipboard.writeText(`${u.inviteText} ${url}`); setMsg({ where: "crew", text: u.copied, ok: true }); } catch { setMsg({ where: "crew", text: url, ok: true }); }
  }

  const note = (where: string) => msg?.where === where && <p className="note" style={{ color: msg.ok ? "var(--good)" : "var(--bad)" }}>{msg.text}</p>;

  return (
    <>
      <div className="card">
        <div className="stage">🏆 {u.stage}</div>
        <h1>{u.title}</h1>
        <p>{u.sub}</p>
        <Link className="btn" href="/survival">{u.play}</Link>
        {me && (
          <p className="note">{me.best !== null ? <>{u.yourBest}: <b>{me.best}</b>{me.rank ? ` · ${u.rank} #${me.rank}` : ""}</> : u.notYet}</p>
        )}
      </div>

      <div className="card">
        <div className="ch-tabs" role="tablist">
          <button role="tab" aria-selected={tab === "players"} className={tab === "players" ? "on" : ""} onClick={() => setTab("players")}>{u.players}</button>
          <button role="tab" aria-selected={tab === "crews"} className={tab === "crews" ? "on" : ""} onClick={() => setTab("crews")}>{u.crews}</button>
        </div>
        {tab === "players" ? (
          data.players.length === 0 ? <p className="note">{u.empty}</p> : (
            <ol className="ch-board">
              {data.players.map((p) => (
                <li key={p.rank} className={p.me ? "me" : ""}>
                  <span className="ch-r">{p.rank <= 3 ? ["🥇", "🥈", "🥉"][p.rank - 1] : p.rank}</span>
                  <span className="ch-n">{p.name}{p.me && ` (${u.you})`}{p.crew && <small> · {p.crew}</small>}</span>
                  <b>{p.score}</b>
                </li>
              ))}
            </ol>
          )
        ) : (
          data.crews.length === 0 ? <p className="note">{u.empty}</p> : (
            <ol className="ch-board">
              {data.crews.map((c) => (
                <li key={c.rank} className={c.me ? "me" : ""}>
                  <span className="ch-r">{c.rank <= 3 ? ["🥇", "🥈", "🥉"][c.rank - 1] : c.rank}</span>
                  <span className="ch-n">{c.name}<small> · {c.members} {u.members}</small></span>
                  <b>{c.score}</b>
                </li>
              ))}
            </ol>
          )
        )}
      </div>

      <div className="card">
        <div className="stage">👪 {u.crewTitle}</div>
        {me?.crew ? (
          <>
            <h2>{me.crew.name}</h2>
            <p className="note">{u.crewScore}: <b>{me.crew.score}</b>{me.crew.rank ? ` · #${me.crew.rank}` : ""} · {u.top5}</p>
            <ol className="ch-board">
              {me.crew.members.map((m, i) => (
                <li key={i} className={m.me ? "me" : ""}>
                  <span className="ch-r">{i + 1}</span>
                  <span className="ch-n">{m.name}{m.me && ` (${u.you})`}</span>
                  <b>{m.best ?? <small>{u.noScore}</small>}</b>
                </li>
              ))}
            </ol>
            <p className="note">{u.code}: <b className="ch-code">{me.crew.code}</b></p>
            <button className="btn" onClick={() => invite(me.crew!.code)}>📨 {u.invite}</button>
            {note("crew")}
            <button className="btn ghost" disabled={busy} onClick={() => act("crew", { action: "leave" })}>{u.leave}</button>
          </>
        ) : (
          <>
            <p>{u.crewNone}</p>
            <form className="ch-form" onSubmit={(e) => { e.preventDefault(); act("create", { action: "create", name: crewName }); }}>
              <label>{u.create}<input value={crewName} maxLength={24} placeholder={u.crewName} onChange={(e) => setCrewName(e.target.value)} /></label>
              <button className="btn" disabled={busy || crewName.trim().length < 3}>{u.create}</button>
            </form>
            {note("create")}
            <form className="ch-form" onSubmit={(e) => { e.preventDefault(); act("join", { action: "join", code }); }}>
              <label>{u.join}<input value={code} maxLength={6} placeholder={u.code} autoCapitalize="characters" onChange={(e) => setCode(e.target.value.toUpperCase())} /></label>
              <button className="btn ghost" disabled={busy || code.trim().length !== 6}>{u.joinBtn}</button>
            </form>
            {note("join")}
          </>
        )}
      </div>

      <div className="card">
        <div className="stage">🪪 {u.nick}</div>
        <form className="ch-form" onSubmit={(e) => { e.preventDefault(); act("nick", { action: "nickname", nickname: nick }, u.saved); }}>
          <label>{u.nickHelp}<input value={nick} maxLength={20} placeholder={me?.name ?? ""} onChange={(e) => setNick(e.target.value)} /></label>
          <button className="btn ghost" disabled={busy || nick.trim().length < 3}>{u.save}</button>
        </form>
        {note("nick")}
      </div>
    </>
  );
}

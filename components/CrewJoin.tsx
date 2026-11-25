"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "./LangProvider";

const U = {
  en: { stage: "72-Hour Challenge", invited: "You're invited to join", members: "members", body: "Everyone plays the 72-hour survival mode on their own time. The crew's 5 best scores of the week add up.", join: "Join the crew", full: "This crew is full.", inCrew: "You're already in another crew. Leave it first on the Challenge page.", err: "Something went wrong. Try again." },
  ht: { stage: "Defi 72 Èdtan", invited: "Yo envite ou antre nan", members: "manm", body: "Chak moun jwe mòd siviv 72 èdtan an lè yo vle. 5 pi bon nòt ekip la nan semèn nan adisyone.", join: "Antre nan ekip la", full: "Ekip sa a plen.", inCrew: "Ou deja nan yon lòt ekip. Kite l anvan sou paj Defi a.", err: "Gen yon pwoblèm. Eseye ankò." },
} as const;

export default function CrewJoin({ code, name, members }: { code: string; name: string; members: number }) {
  const { lang } = useLang();
  const u = U[lang];
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function join() {
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/challenge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "join", code }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { router.push("/challenge"); return; }
      setErr(j.error === "errFull" ? u.full : j.error === "errInCrew" ? u.inCrew : u.err);
    } catch { setErr(u.err); } finally { setBusy(false); }
  }
  return (
    <div className="card">
      <div className="stage">🏆 {u.stage}</div>
      <p>{u.invited}</p>
      <h1>👪 {name}</h1>
      <p className="note">{members} {u.members}</p>
      <p>{u.body}</p>
      <button className="btn" disabled={busy} onClick={join}>{u.join}</button>
      {err && <p className="note" style={{ color: "var(--bad)" }}>{err}</p>}
    </div>
  );
}

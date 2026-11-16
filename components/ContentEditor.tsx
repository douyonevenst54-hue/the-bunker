"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export interface Field { path: string; value: string }
export interface Pair { key: string; en: Field | null; ht: Field | null }
export interface Rev {
  id: string; path: string; oldValue: string; newValue: string; note: string | null; status: string;
  author: string; reviewer: string | null; selfApproved: boolean; createdAt: string; reviewedAt: string | null;
}

async function post(url: string, body: unknown) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Request failed");
  return d;
}

export default function ContentEditor({ contentId, pairs, revs, defaultName }: { contentId: string; pairs: Pair[]; revs: Rev[]; defaultName: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ en: "", ht: "", note: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [signName, setSignName] = useState(defaultName || "Dr. Jhon Evenst Douyon, MD, MPH");

  const pending = revs.filter((r) => r.status === "pending");
  const pendingPaths = new Set(pending.map((r) => r.path));
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? pairs.filter((p) => `${p.en?.value} ${p.ht?.value} ${p.key}`.toLowerCase().includes(s)) : pairs;
  }, [q, pairs]);

  async function run(f: () => Promise<unknown>, ok: string) {
    setBusy(true); setMsg(null);
    try { await f(); setMsg(ok); router.refresh(); } catch (e) { setMsg("⚠️ " + (e as Error).message); } finally { setBusy(false); }
  }

  async function submit(p: Pair) {
    await run(async () => {
      let n = 0;
      for (const lang of ["en", "ht"] as const) {
        const f = p[lang];
        if (f && draft[lang].trim() && draft[lang].trim() !== f.value) {
          await post("/api/admin/revisions", { contentId, path: f.path, newValue: draft[lang], note: draft.note }); n++;
        }
      }
      if (!n) throw new Error("Nothing changed");
      setEditing(null);
    }, "Submitted for review.");
  }

  return (
    <>
      <div className="card" style={{ marginTop: 14 }}>
        <h3>Pending review ({pending.length})</h3>
        {pending.length === 0 && <p>No pending edits.</p>}
        {pending.map((r) => (
          <div key={r.id} className="rev">
            <div className="rev-path">{r.path} · by {r.author}</div>
            <div className="rev-old">− {r.oldValue}</div>
            <div className="rev-new">+ {r.newValue}</div>
            {r.note && <div className="rev-note">Note: {r.note}</div>}
            <div className="rev-actions">
              <button className="btn" disabled={busy} onClick={() => run(() => post(`/api/admin/revisions/${r.id}`, { action: "approve" }), "Approved. Players now see the change.")}>Approve</button>
              <button className="btn ghost" disabled={busy} onClick={() => run(() => post(`/api/admin/revisions/${r.id}`, { action: "reject" }), "Rejected.")}>Reject</button>
            </div>
          </div>
        ))}
        {msg && <p className="status">{msg}</p>}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h3>Sign off this content</h3>
        <p>Confirms an expert reviewed every item, answer and explanation. Players see the reviewer and date.</p>
        <div className="form">
          <label htmlFor="signName">Reviewer name as shown to players</label>
          <input id="signName" value={signName} onChange={(e) => setSignName(e.target.value)} />
        </div>
        <button className="btn" disabled={busy || pending.length > 0}
          onClick={() => run(() => post("/api/admin/signoff", { contentId, name: signName }), "Signed off.")}>
          {pending.length > 0 ? "Resolve pending edits first" : "Sign off as reviewed"}
        </button>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h3>All text ({pairs.length})</h3>
        <div className="form"><input placeholder="Search English or Kreyòl…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {shown.map((p) => (
          <div key={p.key} className="pair">
            <div className="rev-path">{p.key}{(p.en && pendingPaths.has(p.en.path)) || (p.ht && pendingPaths.has(p.ht.path)) ? " · ⏳ pending" : ""}</div>
            {editing === p.key ? (
              <div className="form">
                <label>English</label>
                <textarea rows={3} value={draft.en} onChange={(e) => setDraft({ ...draft, en: e.target.value })} />
                <label>Kreyòl</label>
                <textarea rows={3} value={draft.ht} onChange={(e) => setDraft({ ...draft, ht: e.target.value })} />
                <label>Why this change? (optional)</label>
                <input value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
                <div className="rev-actions">
                  <button className="btn" disabled={busy} onClick={() => submit(p)}>Submit for review</button>
                  <button className="btn ghost" onClick={() => setEditing(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="pair-en">🇺🇸 {p.en?.value}</div>
                <div className="pair-ht">🇭🇹 {p.ht?.value}</div>
                <button className="switch" style={{ textAlign: "left" }} onClick={() => { setEditing(p.key); setDraft({ en: p.en?.value ?? "", ht: p.ht?.value ?? "", note: "" }); }}>Edit</button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h3>Change history (audit log)</h3>
        {revs.filter((r) => r.status !== "pending").length === 0 && <p>No changes yet.</p>}
        {revs.filter((r) => r.status !== "pending").map((r) => (
          <div key={r.id} className="rev">
            <div className="rev-path">{r.status === "approved" ? "✅ approved" : "✗ rejected"} · {r.path} · by {r.author}{r.reviewer ? ` · reviewed by ${r.reviewer}` : ""}{r.selfApproved ? " (self-approved)" : ""} · {r.reviewedAt?.slice(0, 10)}</div>
            <div className="rev-old">− {r.oldValue}</div>
            <div className="rev-new">+ {r.newValue}</div>
          </div>
        ))}
      </div>
    </>
  );
}

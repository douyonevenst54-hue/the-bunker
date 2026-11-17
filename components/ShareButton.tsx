"use client";
import { useState } from "react";
import { useLang } from "./LangProvider";

/** Share the player's progress page: the phone's share sheet, or copy / WhatsApp / Facebook / SMS. */
export default function ShareButton({ text, label, ghost }: { text: string; label?: string; ghost?: boolean }) {
  const { t } = useLang();
  const [url, setUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState(false);

  async function go() {
    setErr(false);
    let u = url;
    if (!u) {
      try {
        const r = await fetch("/api/share", { method: "POST" });
        if (!r.ok) throw new Error();
        u = (await r.json()).url as string;
        setUrl(u);
      } catch { setErr(true); return; }
    }
    const data = { title: "THE BUNKER", text, url: u };
    if (typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare(data))) {
      try { await navigator.share(data); return; } catch (e) { if ((e as Error).name === "AbortError") return; }
    }
    setOpen(true);
  }
  const msg = url ? `${text} ${url}` : text;
  return (
    <div className="share">
      <button className={`btn ${ghost ? "ghost" : "share-btn"}`} onClick={go}>{label ?? t("shareProgress")}</button>
      {err && <p className="err">{t("shareErr")}</p>}
      {open && url && (
        <div className="share-pop" role="group" aria-label={t("share")}>
          <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} aria-label="URL" />
          <div className="share-row">
            <button className="btn ghost" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); } catch {} }}>
              {copied ? `✅ ${t("linkCopied")}` : `🔗 ${t("copyLink")}`}
            </button>
            <a className="btn ghost" target="_blank" rel="noopener" href={`https://wa.me/?text=${encodeURIComponent(msg)}`}>WhatsApp</a>
            <a className="btn ghost" target="_blank" rel="noopener" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}>Facebook</a>
            <a className="btn ghost" href={`sms:?&body=${encodeURIComponent(msg)}`}>SMS</a>
          </div>
        </div>
      )}
    </div>
  );
}

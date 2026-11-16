"use client";
import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";

export default function ForgotPage() {
  const { t, lang } = useLang();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setErr(false);
    const email = new FormData(e.currentTarget).get("email");
    try {
      const r = await fetch("/api/auth/forgot", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, lang }),
      });
      if (!r.ok) throw new Error();
      setSent(true);
    } catch { setErr(true); } finally { setBusy(false); }
  }

  return (
    <div className="card">
      <div className="stage">{t("account")}</div>
      <h2>{t("forgotTitle")}</h2>
      {sent ? (
        <>
          <p>{t("forgotSent")}</p>
          <Link className="btn ghost" href="/account">{t("signIn")}</Link>
        </>
      ) : (
        <>
          <p>{t("forgotSub")}</p>
          <form className="form" onSubmit={submit}>
            <label htmlFor="email">{t("email")}</label>
            <input id="email" name="email" type="email" required autoComplete="email" />
            {err && <div className="err">{t("errServer")}</div>}
            <button className="btn" disabled={busy}>{busy ? "…" : t("sendLink")}</button>
          </form>
          <Link className="switch" href="/account">{t("signIn")}</Link>
        </>
      )}
    </div>
  );
}

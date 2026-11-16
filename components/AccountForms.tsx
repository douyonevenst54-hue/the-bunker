"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "./LangProvider";
import type { StringKey } from "@/lib/i18n";

export default function AccountForms({ email, name }: { email: string | null; name: string | null }) {
  const { t } = useLang();
  const router = useRouter();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [err, setErr] = useState<StringKey | null>(null);
  const [busy, setBusy] = useState(false);

  if (email) return (
    <div className="card">
      <div className="stage">{t("account")}</div>
      <h2>{name ? `${name} · ` : ""}{email}</h2>
      <p>{t("signedInAs")} {email}</p>
      <Link className="btn" href="/">{t("backToBunker")}</Link>
      <button className="btn ghost" onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/"); router.refresh();
      }}>{t("signOut")}</button>
    </div>
  );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null); setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch(`/api/auth/${mode}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: f.get("email"), password: f.get("password"), name: f.get("name") }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { setErr((data.error as StringKey) || "errServer"); return; }
      router.push("/"); router.refresh();
    } catch {
      setErr("errServer");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <div className="stage">{t("account")}</div>
      <h2>{mode === "register" ? t("createAccount") : t("signIn")}</h2>
      {mode === "register" && <p>{t("guestNote")}</p>}
      <form className="form" onSubmit={submit}>
        {mode === "register" && (<><label htmlFor="name">{t("name")}</label><input id="name" name="name" autoComplete="given-name" /></>)}
        <label htmlFor="email">{t("email")}</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
        <label htmlFor="password">{t("password")}</label>
        <input id="password" name="password" type="password" required minLength={8}
          autoComplete={mode === "register" ? "new-password" : "current-password"} />
        {err && <div className="err">{t(err)}</div>}
        <button className="btn" disabled={busy}>{busy ? "…" : mode === "register" ? t("createAccount") : t("signIn")}</button>
      </form>
      <button className="switch" onClick={() => { setErr(null); setMode(mode === "register" ? "login" : "register"); }}>
        {mode === "register" ? `${t("haveAccount")} ${t("signIn")}` : `${t("noAccount")} ${t("createAccount")}`}
      </button>
    </div>
  );
}

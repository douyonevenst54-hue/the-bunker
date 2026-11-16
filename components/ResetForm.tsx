"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "./LangProvider";
import type { StringKey } from "@/lib/i18n";

export default function ResetForm({ token }: { token: string }) {
  const { t } = useLang();
  const router = useRouter();
  const [err, setErr] = useState<StringKey | null>(token ? null : "errResetLink");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("password") !== f.get("confirm")) { setErr("errMatch"); return; }
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/auth/reset", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: f.get("password") }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { setErr((data.error as StringKey) || "errServer"); return; }
      router.push("/"); router.refresh();
    } catch { setErr("errServer"); } finally { setBusy(false); }
  }

  return (
    <div className="card">
      <div className="stage">{t("account")}</div>
      <h2>{t("resetTitle")}</h2>
      {token && (
        <form className="form" onSubmit={submit}>
          <label htmlFor="password">{t("newPassword")}</label>
          <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
          <label htmlFor="confirm">{t("confirmPassword")}</label>
          <input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
          {err && <div className="err">{t(err)}</div>}
          <button className="btn" disabled={busy}>{busy ? "…" : t("savePassword")}</button>
        </form>
      )}
      {!token && <div className="err">{t("errResetLink")}</div>}
      <Link className="switch" href="/forgot">{t("forgotLink")}</Link>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useLang } from "./LangProvider";
import { STRINGS, type StringKey } from "@/lib/i18n";

/** Sends the player to Stripe Checkout (monthly / yearly) or to the Stripe customer portal. */
export default function BillingButtons({ mode }: { mode: "checkout" | "portal" }) {
  const { t } = useLang();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function go(path: string, body?: object) {
    setBusy(true); setErr(null);
    try {
      const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.url) { window.location.href = j.url; return; }
      setErr(t(typeof j.error === "string" && j.error in STRINGS.en ? (j.error as StringKey) : "errGeneric"));
    } catch { setErr(t("errGeneric")); }
    setBusy(false);
  }

  if (mode === "portal") {
    return (<>
      <button className="btn ghost" disabled={busy} onClick={() => go("/api/billing/portal")}>{t("manage")}</button>
      {err && <p className="err">{err}</p>}
    </>);
  }
  return (<>
    <div className="plans">
      <button className="plan" disabled={busy} onClick={() => go("/api/billing/checkout", { interval: "month" })}>
        <strong>{t("monthly")}</strong>
      </button>
      <button className="plan best" disabled={busy} onClick={() => go("/api/billing/checkout", { interval: "year" })}>
        <span className="tag">{t("save")}</span><strong>{t("yearly")}</strong>
      </button>
    </div>
    {err && <p className="err">{err}</p>}
  </>);
}

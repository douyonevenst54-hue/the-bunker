"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "./LangProvider";
import { piSdk } from "./PiAuth";

type CreatePayment = (d: { amount: number; memo: string; metadata: Record<string, unknown> }, cb: {
  onReadyForServerApproval: (id: string) => void; onReadyForServerCompletion: (id: string, txid: string) => void;
  onCancel: (id: string) => void; onError: (e: Error) => void;
}) => void;

const post = (action: string, paymentId: string, txid?: string) =>
  fetch("/api/pi/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, paymentId, txid }) });

/** Optional supporter payment in Pi. Nothing in the game depends on it. */
export default function PiSupport({ amount, supporter }: { amount: number; supporter: boolean }) {
  const { t } = useLang();
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">(supporter ? "done" : "idle");
  if (state === "done") return <p className="ok-msg">💛 {t("piThanks")}</p>;
  async function pay() {
    setState("busy");
    const pi = await piSdk();
    const create = (pi as unknown as { createPayment?: CreatePayment })?.createPayment;
    if (!create) { setState("error"); return; }
    create({ amount, memo: "THE BUNKER supporter", metadata: { kind: "supporter" } }, {
      onReadyForServerApproval: (id) => { post("approve", id).catch(() => setState("error")); },
      onReadyForServerCompletion: (id, txid) => { post("complete", id, txid).then((r) => { if (r.ok) { setState("done"); router.refresh(); } else setState("error"); }); },
      onCancel: () => setState("idle"),
      onError: () => setState("error"),
    });
  }
  return (
    <div className="pi-support">
      <button className="btn ghost" disabled={state === "busy"} onClick={pay}>💛 {t("piSupport").replace("{n}", String(amount))}</button>
      <p className="note">{state === "error" ? t("piPayError") : t("piSupportNote")}</p>
    </div>
  );
}

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

/** A Pi payment button: the Bunker Pass (30 days) or the optional supporter badge. */
export default function PiPay({ kind, amount, label, note, doneText, done = false, primary = false }: {
  kind: "pass30" | "supporter"; amount: number; label: string; note: string; doneText: string; done?: boolean; primary?: boolean;
}) {
  const { t } = useLang();
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">(done ? "done" : "idle");
  if (state === "done") return <p className="ok-msg">{doneText}</p>;
  async function pay() {
    setState("busy");
    const pi = await piSdk();
    const create = (pi as unknown as { createPayment?: CreatePayment })?.createPayment;
    if (!create) { setState("error"); return; }
    create({ amount, memo: kind === "pass30" ? "THE BUNKER — Bunker Pass, 30 days" : "THE BUNKER supporter", metadata: { kind } }, {
      onReadyForServerApproval: (id) => { post("approve", id).catch(() => setState("error")); },
      onReadyForServerCompletion: (id, txid) => { post("complete", id, txid).then((r) => { if (r.ok) { setState("done"); router.refresh(); } else setState("error"); }); },
      onCancel: () => setState("idle"),
      onError: () => setState("error"),
    });
  }
  return (
    <div className="pi-support">
      <button className={primary ? "btn" : "btn ghost"} disabled={state === "busy"} onClick={pay}>{label}</button>
      <p className="note">{state === "error" ? t("piPayError") : note}</p>
    </div>
  );
}

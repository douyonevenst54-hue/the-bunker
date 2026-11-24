"use client";
// Pi edition sign-in. The Pi SDK object exists in every browser; only a returned
// Pi.authenticate() proves we're inside the Pi Browser, so it races a short timeout.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "./LangProvider";

type PiSdk = {
  init: (c: { version: string; sandbox?: boolean }) => void | Promise<void>;
  authenticate: (scopes: string[], onIncomplete: (p: unknown) => void) => Promise<{ accessToken: string; user: { uid: string; username: string } }>;
  createPayment?: unknown;
};
declare global { interface Window { Pi?: PiSdk } }

export const PI_SCOPES = ["username", "payments"];

/** Initialise the SDK once; resolves to null when not in the Pi Browser. */
let ready: Promise<PiSdk | null> | null = null;
/** True when the app is open in Pi's developer sandbox (sandbox.minepi.com frames the Development URL). */
function inPiSandbox(): boolean {
  if (process.env.NEXT_PUBLIC_PI_SANDBOX === "true") return true;
  try {
    const anc = (window.location as Location & { ancestorOrigins?: DOMStringList }).ancestorOrigins;
    if (anc && Array.from(anc).some((o) => o.startsWith("https://sandbox.minepi.com"))) return true;
    return document.referrer.startsWith("https://sandbox.minepi.com");
  } catch { return false; }
}

export function piSdk(): Promise<PiSdk | null> {
  if (ready) return ready;
  ready = (async () => {
    for (let i = 0; i < 10 && !window.Pi; i++) await new Promise((r) => setTimeout(r, 150));
    if (!window.Pi) return null;
    try { await Promise.resolve(window.Pi.init({ version: "2.0", sandbox: inPiSandbox() })); return window.Pi; }
    catch { return null; }
  })();
  return ready;
}

/** Incomplete payments found at sign-in are finished by the server (see /api/pi/payments). */
async function onIncomplete(p: unknown) {
  const pay = p as { identifier?: string; transaction?: { txid?: string } | null };
  if (!pay?.identifier) return;
  await fetch("/api/pi/payments", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "recover", paymentId: pay.identifier, txid: pay.transaction?.txid ?? null }) }).catch(() => {});
}

export default function PiAuth({ username }: { username: string | null }) {
  const router = useRouter();
  const { t } = useLang();
  const [state, setState] = useState<"checking" | "in" | "outside" | "failed">(username ? "in" : "checking");

  useEffect(() => {
    let off = false;
    (async () => {
      const pi = await piSdk();
      if (!pi) { if (!off && !username) setState("outside"); return; }
      const auth = await Promise.race([
        pi.authenticate(PI_SCOPES, onIncomplete).catch(() => null),
        new Promise<null>((r) => setTimeout(() => r(null), 6000)),
      ]);
      if (off) return;
      if (!auth) { if (!username) setState("outside"); return; }
      if (username === auth.user.username) return; // already signed in as this Pioneer
      const r = await fetch("/api/auth/pi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessToken: auth.accessToken }) });
      if (off) return;
      if (r.ok) { setState("in"); router.refresh(); } else setState("failed");
    })();
    return () => { off = true; };
  }, [username, router]);

  if (state === "in" && username) return <span className="pi-badge" title={t("piSignedIn")}>π @{username}</span>;
  if (state === "outside") return <span className="pi-badge off" title={t("piOpenInBrowser")}>π {t("piBrowserOnly")}</span>;
  if (state === "failed") return <span className="pi-badge off">π {t("piFailed")}</span>;
  return null;
}

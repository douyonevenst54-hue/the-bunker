"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { piSdk } from "./PiAuth";
import { useLang } from "./LangProvider";

type Res = { result?: string; adId?: string; ready?: boolean };
type PiAds = {
  isAdReady: (t: "rewarded") => Promise<Res>;
  requestAd: (t: "rewarded") => Promise<Res>;
  showAd: (t: "rewarded") => Promise<Res>;
};
type PiWithAds = { Ads?: PiAds; nativeFeaturesList?: () => Promise<string[]> };

/**
 * Optional rewarded ad (Pi Ads only): watch one short ad to open Room 3 for 24 hours, once a day.
 * The server checks the ad with Pi before opening anything.
 */
export default function PiAdUnlock({ until }: { until: string | null }) {
  const { t } = useLang();
  const router = useRouter();
  const [state, setState] = useState<"checking" | "ready" | "busy" | "none" | "done" | "error" | "daily">("checking");

  useEffect(() => {
    (async () => {
      const pi = (await piSdk()) as PiWithAds | null;
      if (!pi?.Ads) return setState("none");
      try {
        const feats = pi.nativeFeaturesList ? await pi.nativeFeaturesList() : [];
        setState(feats.includes("ad_network") ? "ready" : "none");
      } catch { setState("none"); }
    })();
  }, []);

  if (until) return <p className="ok-msg">🎬 {t("piAdOpen").replace("{d}", new Date(until).toLocaleString())}</p>;
  if (state === "checking" || state === "none") return null;

  async function watch() {
    setState("busy");
    try {
      const ads = ((await piSdk()) as PiWithAds | null)?.Ads;
      if (!ads) return setState("error");
      const ready = await ads.isAdReady("rewarded");
      if (!ready.ready) {
        const req = await ads.requestAd("rewarded");
        if (req.result !== "AD_LOADED") return setState("error");
      }
      const shown = await ads.showAd("rewarded");
      if (shown.result !== "AD_REWARDED" || !shown.adId) return setState("ready");
      const r = await fetch("/api/pi/ads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adId: shown.adId }) });
      if (r.status === 429) return setState("daily");
      if (!r.ok) return setState("error");
      setState("done");
      router.refresh();
    } catch { setState("error"); }
  }

  return (
    <div className="pi-ad">
      <button className="btn ghost" disabled={state === "busy" || state === "done"} onClick={watch}>🎬 {t("piAdWatch")}</button>
      <p className="note">{state === "error" ? t("piAdError") : state === "daily" ? t("piAdDaily") : state === "done" ? t("piAdDone") : t("piAdNote")}</p>
    </div>
  );
}

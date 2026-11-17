"use client";
import { useState } from "react";
import { useLang } from "./LangProvider";

export default function StopSharing() {
  const { t } = useLang();
  const [off, setOff] = useState(false);
  if (off) return <p className="note">{t("sharingOff")}</p>;
  return (
    <>
      <p className="note">{t("sharingOn")}</p>
      <button className="btn ghost" onClick={async () => { await fetch("/api/share", { method: "DELETE" }); setOff(true); }}>{t("stopSharing")}</button>
    </>
  );
}

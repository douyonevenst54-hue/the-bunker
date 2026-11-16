"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Room } from "@/lib/rooms/types";
import { useLang } from "../LangProvider";

function Loading() {
  const { t } = useLang();
  return <div className="b3-loading"><div className="b3-spin" />{t("loading3d")}</div>;
}

// three.js only runs in the browser and is loaded only on this page
const Room3D = dynamic(() => import("./Room3D"), { ssr: false, loading: () => <Loading /> });

export default function Room3DLoader({ room, otherRooms }: { room: Room; otherRooms: string[] }) {
  const { t } = useLang();
  const [webgl, setWebgl] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setWebgl(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch { setWebgl(false); }
  }, []);
  if (webgl === null) return <Loading />;
  if (!webgl) return (
    <div className="card">
      <p>{t("no3d")}</p>
      <Link className="btn" href={`/room/${room.id}`}>{t("lite")}</Link>
    </div>
  );
  return <Room3D room={room} otherRooms={otherRooms} />;
}

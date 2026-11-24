import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSurvival } from "@/lib/survival";
import SurvivalGame from "@/components/SurvivalGame";

export const metadata: Metadata = {
  title: "72-Hour Survival · THE BUNKER",
  description: "Pack your kit and keep your family safe for 72 hours after a hurricane. Free, in English and Kreyòl.",
};

/** 72-hour survival mode: free for everyone, guests included. */
export default function SurvivalPage() {
  const mode = getSurvival("survival-72");
  if (!mode) notFound();
  return <SurvivalGame mode={mode} />;
}

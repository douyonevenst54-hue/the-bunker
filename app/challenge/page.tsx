import type { Metadata } from "next";
import { getPlayerId } from "@/lib/session";
import { getBoards } from "@/lib/challenge";
import { dbEnabled } from "@/lib/db";
import Challenge from "@/components/Challenge";

export const metadata: Metadata = {
  title: "72-Hour Challenge · THE BUNKER",
  description: "This week's best survivors and crews in THE BUNKER's 72-hour survival mode.",
};
export const dynamic = "force-dynamic";

export default async function ChallengePage() {
  const data = dbEnabled
    ? await getBoards(await getPlayerId())
    : { weekStart: new Date().toISOString(), players: [], crews: [], me: null };
  return <Challenge data={data} />;
}

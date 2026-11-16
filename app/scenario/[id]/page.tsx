import { notFound, redirect } from "next/navigation";
import { liveScenario } from "@/lib/content";
import { getPlayer } from "@/lib/session";
import { getLevels } from "@/lib/progress";
import ScenarioGame from "@/components/ScenarioGame";

export const dynamic = "force-dynamic";

export default async function ScenarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sc = await liveScenario(id);
  if (!sc) notFound();
  const player = await getPlayer().catch(() => null);
  const level = (await getLevels(player?.id ?? null)).find((l) => l.id === id);
  if (!level?.unlocked) redirect("/");
  return <ScenarioGame sc={sc} />;
}

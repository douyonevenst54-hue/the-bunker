import { notFound, redirect } from "next/navigation";
import { getScenario } from "@/lib/scenarios";
import { getPlayer } from "@/lib/session";
import { getRoomStatuses } from "@/lib/progress";
import ScenarioGame from "@/components/ScenarioGame";

export const dynamic = "force-dynamic";

export default async function ScenarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sc = getScenario(id);
  if (!sc) notFound();
  const player = await getPlayer().catch(() => null);
  const statuses = await getRoomStatuses(player?.id ?? null);
  if (!statuses.every((s) => s.passed)) redirect("/");
  return <ScenarioGame sc={sc} />;
}

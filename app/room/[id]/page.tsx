import { notFound, redirect } from "next/navigation";
import { liveRoom, latestSignoff } from "@/lib/content";
import { getPlayer } from "@/lib/session";
import { getRoomStatuses } from "@/lib/progress";
import RoomGame from "@/components/RoomGame";

export const dynamic = "force-dynamic";

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = await liveRoom(id);
  if (!room) notFound();
  const player = await getPlayer().catch(() => null);
  const st = (await getRoomStatuses(player?.id ?? null)).find((r) => r.id === id);
  if (!st?.unlocked) redirect("/");
  const sign = await latestSignoff(room.id);
  return <RoomGame room={room} reviewed={sign ? { name: sign.reviewerName, date: sign.createdAt.toISOString().slice(0, 10) } : null} />;
}

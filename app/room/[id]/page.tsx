import { notFound, redirect } from "next/navigation";
import { getRoom } from "@/lib/rooms";
import { getPlayer } from "@/lib/session";
import { getRoomStatuses } from "@/lib/progress";
import RoomGame from "@/components/RoomGame";

export const dynamic = "force-dynamic";

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = getRoom(id);
  if (!room) notFound();
  const player = await getPlayer().catch(() => null);
  const st = (await getRoomStatuses(player?.id ?? null)).find((r) => r.id === id);
  if (!st?.unlocked) redirect("/");
  return <RoomGame room={room} />;
}

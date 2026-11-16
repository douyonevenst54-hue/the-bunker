import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { liveRoom } from "@/lib/content";
import { getPlayer } from "@/lib/session";
import { getRoomStatuses } from "@/lib/progress";
import { needsPlan } from "@/lib/plan";
import { ROOMS } from "@/lib/rooms";
import { ROOMS_3D } from "@/lib/rooms/three-d";
import { asLang, LANG_COOKIE } from "@/lib/i18n";
import Room3DLoader from "@/components/bunker3d/Room3DLoader";

export const dynamic = "force-dynamic";

/** 3D version of a room. Same unlock and membership rules as the 2D page. */
export default async function Room3DPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ROOMS_3D.includes(id)) notFound();
  const room = await liveRoom(id);
  if (!room) notFound();
  const player = await getPlayer().catch(() => null);
  const st = (await getRoomStatuses(player?.id ?? null)).find((r) => r.id === id);
  if (!st?.unlocked) redirect("/");
  if (needsPlan(id, player)) redirect("/upgrade");
  const lang = asLang((await cookies()).get(LANG_COOKIE)?.value);
  const others = ROOMS.filter((r) => r.id !== id).map((r) => `${r.emoji} ${r.ui[lang].room.split("·").pop()!.trim()}`);
  return <Room3DLoader room={room} otherRooms={others} />;
}

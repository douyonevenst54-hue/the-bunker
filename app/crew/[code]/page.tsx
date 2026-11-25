import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { normCode } from "@/lib/challenge";
import CrewJoin from "@/components/CrewJoin";

export const metadata: Metadata = { title: "Join my crew · THE BUNKER", description: "Join my crew in THE BUNKER's 72-Hour Challenge." };

/** Invite link: /crew/ABC123 → join that crew. */
export default async function CrewInvite({ params }: { params: Promise<{ code: string }> }) {
  const code = normCode((await params).code);
  const crew = code.length === 6
    ? await prisma.crew.findUnique({ where: { code }, select: { name: true, _count: { select: { members: true } } } })
    : null;
  if (!crew) notFound();
  return <CrewJoin code={code} name={crew.name} members={crew._count.members} />;
}

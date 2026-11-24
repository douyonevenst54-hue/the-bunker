import { redirect } from "next/navigation";
import { isPiEdition } from "@/lib/edition";
import ResetForm from "@/components/ResetForm";

export const dynamic = "force-dynamic";

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  if (await isPiEdition()) redirect("/"); // Pi edition: Pi sign-in only
  const { token } = await searchParams;
  return <ResetForm token={typeof token === "string" ? token : ""} />;
}

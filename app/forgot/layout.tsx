import { redirect } from "next/navigation";
import { isPiEdition } from "@/lib/edition";

// Pi edition: Pi sign-in only, so there is no password to reset.
export default async function ForgotLayout({ children }: { children: React.ReactNode }) {
  if (await isPiEdition()) redirect("/");
  return children;
}

import { getPlayer } from "@/lib/session";
import AccountForms from "@/components/AccountForms";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const player = await getPlayer().catch(() => null);
  return <AccountForms email={player?.email ?? null} name={player?.displayName ?? null} />;
}

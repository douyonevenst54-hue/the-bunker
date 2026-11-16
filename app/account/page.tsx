import Link from "next/link";
import { cookies } from "next/headers";
import { getPlayer } from "@/lib/session";
import { asLang, LANG_COOKIE, STRINGS } from "@/lib/i18n";
import { isMember, paywallOn } from "@/lib/plan";
import AccountForms from "@/components/AccountForms";
import BillingButtons from "@/components/BillingButtons";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const player = await getPlayer().catch(() => null);
  const s = STRINGS[asLang((await cookies()).get(LANG_COOKIE)?.value)];
  const member = isMember(player);
  return (
    <>
      <AccountForms email={player?.email ?? null} name={player?.displayName ?? null} />
      {player?.email && (paywallOn() || member) && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="stage">💎 {s.membership}</div>
          {member ? <p>✅ {s.isMemberMsg}</p> : <p>{s.upSub}</p>}
          {member && player.stripeCustomerId ? <BillingButtons mode="portal" />
            : !member && <Link className="btn" href="/upgrade">{s.upgrade}</Link>}
        </div>
      )}
    </>
  );
}

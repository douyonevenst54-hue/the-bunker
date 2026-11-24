import Link from "next/link";
import { cookies } from "next/headers";
import { asLang, LANG_COOKIE, STRINGS } from "@/lib/i18n";
import { getPlayer } from "@/lib/session";
import { billingReady, isMember } from "@/lib/plan";
import BillingButtons from "@/components/BillingButtons";
import PiSupport from "@/components/PiSupport";
import { isPiEdition } from "@/lib/edition";
import { SUPPORT_AMOUNT } from "@/lib/pi";

export const dynamic = "force-dynamic";

export default async function UpgradePage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const lang = asLang((await cookies()).get(LANG_COOKIE)?.value);
  const s = STRINGS[lang];
  const { ok } = await searchParams;
  const player = await getPlayer().catch(() => null);
  const member = isMember(player);
  if (await isPiEdition()) {
    // Pi edition: no Stripe. Signing in with Pi unlocks every room; supporting in Pi is optional.
    return (
      <div className="card upgrade">
        <div className="stage">π {s.piEdition}</div>
        <h1>{s.piUnlockTitle}</h1>
        <p>{s.piUnlockBody}</p>
        {player?.piUid ? (<>
          <p className="ok-msg">✅ {s.isMemberMsg}</p>
          <PiSupport amount={SUPPORT_AMOUNT} supporter={!!player.piSupporterAt} />
          <Link className="btn" href="/">{s.backToBunker}</Link>
        </>) : <p className="note">{s.piBrowserOnlyLong}</p>}
      </div>
    );
  }
  return (
    <div className="card upgrade">
      <div className="stage">💎 {s.membership}</div>
      <h1>{s.upTitle}</h1>
      <p>{s.upSub}</p>
      <ul className="perks">
        {[s.perk1, s.perk2, s.perk3, s.perk4].map((p) => <li key={p}>✓ {p}</li>)}
      </ul>
      {ok && !member && <p className="note">{s.paidMsg}</p>}
      {member ? (
        <>
          <p className="ok-msg">✅ {s.isMemberMsg}</p>
          {player?.stripeCustomerId && <BillingButtons mode="portal" />}
          <Link className="btn" href="/">{s.backToBunker}</Link>
        </>
      ) : !billingReady() ? (
        <p className="note">{s.billingOff}</p>
      ) : !player?.email ? (
        <>
          <p>{s.needAccount}</p>
          <Link className="btn" href="/account">{s.createAccount}</Link>
        </>
      ) : (
        <>
          <BillingButtons mode="checkout" />
          <p className="note">{s.cancelAnytime}</p>
        </>
      )}
    </div>
  );
}

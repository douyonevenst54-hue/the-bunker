import Link from "next/link";
import { cookies } from "next/headers";
import { asLang, LANG_COOKIE, STRINGS } from "@/lib/i18n";
import { getPlayer } from "@/lib/session";
import { billingReady, isMember } from "@/lib/plan";
import BillingButtons from "@/components/BillingButtons";
import PiPay from "@/components/PiPay";
import PiAdUnlock from "@/components/PiAdUnlock";
import { isPiEdition } from "@/lib/edition";
import { SUPPORT_AMOUNT, PASS_AMOUNT } from "@/lib/pi";

export const dynamic = "force-dynamic";

export default async function UpgradePage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const lang = asLang((await cookies()).get(LANG_COOKIE)?.value);
  const s = STRINGS[lang];
  const { ok } = await searchParams;
  const player = await getPlayer().catch(() => null);
  const member = isMember(player);
  if (await isPiEdition()) {
    // Pi edition: no Stripe. Rooms 1–2 free; the Bunker Pass (paid in Pi) opens the rest for 30 days.
    const until = player?.piPassUntil && player.piPassUntil > new Date() ? player.piPassUntil : null;
    const day = until ? until.toLocaleDateString(lang === "ht" ? "fr-HT" : "en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
    const n = String(PASS_AMOUNT);
    return (
      <div className="card upgrade">
        <div className="stage">π {s.piEdition}</div>
        <h1>{s.piPassTitle}</h1>
        <p>{s.piPassBody.replace("{n}", n)}</p>
        <ul className="perks">
          {[s.perk1, s.perk2, s.perk3, s.perk4].map((p) => <li key={p}>✓ {p}</li>)}
        </ul>
        {!player?.piUid ? <p className="note">{s.piBrowserOnlyLong}</p> : (<>
          {until && <p className="ok-msg">✅ {s.piPassActive.replace("{d}", day)}</p>}
          <PiPay kind="pass30" amount={PASS_AMOUNT} primary={!until}
            label={(until ? s.piPassRenew : s.piPassBuy).replace("{n}", n)} note={s.piPassNote}
            doneText={`✅ ${s.piPassThanks}`} />
          {!until && <PiAdUnlock until={player.adRoomUntil && player.adRoomUntil > new Date() ? player.adRoomUntil.toISOString() : null} />}
          <PiPay kind="supporter" amount={SUPPORT_AMOUNT} label={`💛 ${s.piSupport.replace("{n}", String(SUPPORT_AMOUNT))}`}
            note={s.piSupportNote} doneText={`💛 ${s.piThanks}`} done={!!player.piSupporterAt} />
          <Link className="btn ghost" href="/">{s.backToBunker}</Link>
        </>)}
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

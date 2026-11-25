import Link from "next/link";
import { cookies } from "next/headers";
import { ROOMS, COMING_SOON } from "@/lib/rooms";
import { asLang, LANG_COOKIE, STRINGS } from "@/lib/i18n";
import { getPlayer } from "@/lib/session";
import { getRoomStatuses, getBadgeIds, getLevels } from "@/lib/progress";
import { SCENARIOS } from "@/lib/scenarios";
import BunkerMap from "@/components/BunkerMap";
import ShareButton from "@/components/ShareButton";
import { needsPlan, paywallOn, isMember } from "@/lib/plan";
import BadgeShelf from "@/components/BadgeShelf";
import { readiness } from "@/lib/readiness";
import { isPiEdition } from "@/lib/edition";
import { ROOMS_3D } from "@/lib/rooms/three-d";

export const dynamic = "force-dynamic";

export default async function Bunker() {
  const lang = asLang((await cookies()).get(LANG_COOKIE)?.value);
  const s = STRINGS[lang];
  const player = await getPlayer().catch(() => null);
  const [statuses, badges, levels] = await Promise.all([
    getRoomStatuses(player?.id ?? null),
    getBadgeIds(player?.id ?? null),
    getLevels(player?.id ?? null),
  ]);
  const total = ROOMS.length + COMING_SOON.length;
  const passed = statuses.filter((r) => r.passed).length;
  const premium = ROOMS.map((r) => r.id).filter((id) => needsPlan(id, player));
  const pi = await isPiEdition();
  const showUpgrade = paywallOn() && !isMember(player);
  const returning = statuses.some((r) => r.played);
  const ready = readiness(statuses, premium);
  const short = (id: string) => ROOMS.find((r) => r.id === id)!.ui[lang].room.replace(/^[^·]*·\s*/, "");
  const first = ROOMS[0];
  const how: [string, string, string][] = [["🧭", s.how1, s.how1s], ["🔍", s.how2, s.how2s], ["🧠", s.how3, s.how3s], ["🌀", s.how4, s.how4s]];

  return (
    <>
      {returning ? (
        <div className="card ready">
          <div className="stage">{player?.displayName ? `${s.readyTitle} · ${player.displayName}` : s.readyTitle}</div>
          <div className="ready-top">
            <div className="ready-ring" style={{ ["--p" as string]: `${ready.score}` }} role="img" aria-label={`${s.readyScore}: ${ready.score} / 100`}>
              <b>{ready.score}</b><span>/100</span>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22 }}>{s.readyScore}</h1>
              <div className="count" style={{ marginTop: 4 }}>{passed} / {total} {s.roomsDone} · {badges.length} 🏅</div>
            </div>
          </div>
          <ul className="ready-areas">
            {ready.areas.map((a) => (
              <li key={a.id}>
                <span className="ra-name">{a.emoji} {short(a.id)}</span>
                <span className="ra-bar"><i style={{ width: `${a.score}%` }} className={a.score >= 80 ? "hi" : a.score >= 50 ? "mid" : "lo"} /></span>
                <span className="ra-val">{a.played ? `${a.score}%` : s.readyNotStarted}</span>
              </li>
            ))}
          </ul>
          {ready.next ? (
            <div className="ready-next">
              <div className="stage">{s.readyNext}</div>
              <Link className="btn" href={`/room/${ready.next.id}`}>
                {ROOMS.find((r) => r.id === ready.next!.id)!.emoji} {ready.next.why === "continue" ? s.readyContinue : s.readyImprove}: {short(ready.next.id)}
              </Link>
            </div>
          ) : <p className="note">{s.readyAllDone}</p>}
          <p className="note" style={{ marginTop: 10 }}>{s.readyNote}</p>
          {(passed > 0 || badges.length > 0) && (
            <ShareButton ghost text={s.shareProgressText.replace("{rooms}", String(passed)).replace("{badges}", String(badges.length))} />
          )}
        </div>
      ) : (
        <>
          <section className="hero-card">
            <img className="hero-art" src="/hero-bunker.png" width={1200} height={1200} alt="" />
            <div className="hero-body">
              <div className="hero-tag">{s.heroTag}</div>
              <h1>{s.heroTitle}</h1>
              <p>{s.heroSub}</p>
              <a className="btn b3-cta hero-cta" href={ROOMS_3D.includes(first.id) ? `/room/${first.id}/3d` : `/room/${first.id}`}>▶ {s.heroCta}</a>
              <Link className="hero-classic" href={`/room/${first.id}`}>{s.heroClassic}</Link>
            </div>
          </section>
          <div className="stage" style={{ marginTop: 18 }}>{s.howTitle}</div>
          <div className="how">
            {how.map(([ic, t, d]) => <div key={t} className="how-step"><div className="how-ic" aria-hidden="true">{ic}</div><b>{t}</b><span>{d}</span></div>)}
          </div>
        </>
      )}

      <div className="stage" style={{ marginTop: 18 }}>{s.missionsTitle}</div>
      <div className="card map-card">
        <BunkerMap lang={lang} statuses={statuses} premium={premium} />
        <div className="legend">
          <span><i className="lg passed" />{s.statusPassed}</span>
          <span><i className="lg open" />{s.play_}</span>
          <span><i className="lg locked" />{s.locked}</span>
          <span><i className="lg soon" />{s.comingSoon}</span>
        </div>
        {showUpgrade && <Link className="btn" href="/upgrade">💎 {s.upgrade}</Link>}
      </div>

      <Link className="room scenario sv-card" href="/survival" style={{ marginTop: 18 }}>
        <div className="ic">⏱️</div>
        <div className="mid"><div className="t">{s.survivalTitle} <span className="sv-new">{s.survivalNew}</span></div><div className="s">{s.survivalSub}</div></div>
        <div className="go">{s.survivalPlay}</div>
      </Link>
      <Link className="ch-link" href="/challenge">{s.challengeLink}</Link>

      <div className="stage" style={{ marginTop: 18 }}>{s.levels}</div>
      {levels.map((lv) => {
        const sc = SCENARIOS.find((x) => x.id === lv.id)!;
        const name = `${s.level} ${lv.level} · ${sc.title[lang].replace(/^[^:]*:\s*/, "")}`;
        if (!lv.unlocked) {
          const why = lv.level === 1 ? `${s.scenarioLocked} · ${passed}/6` : s.levelLocked.replace("{n}", String(lv.level - 1));
          return (
            <div key={lv.id} className="room scenario lock" style={{ marginTop: 10 }}>
              <div className="ic">🔒</div>
              <div className="mid"><div className="t">{name}</div><div className="s">{why}</div></div>
            </div>
          );
        }
        if (needsPlan(lv.id, player)) {
          return (
            <Link key={lv.id} className="room scenario premium" href="/upgrade" style={{ marginTop: 10 }}>
              <div className="ic">{sc.emoji}</div>
              <div className="mid"><div className="t">{name}</div><div className="s">💎 {s.membersOnly}</div></div>
              <div className="go">{s.upgrade}</div>
            </Link>
          );
        }
        return (
          <Link key={lv.id} className={`room scenario ${lv.passed ? "done" : ""}`} href={`/scenario/${sc.id}`} style={{ marginTop: 10 }}>
            <div className="ic">{sc.emoji}</div>
            <div className="mid"><div className="t">{name}</div>
              <div className="s">{lv.bestScore !== null ? `${lv.passed ? "✅ " + s.statusPassed + " · " : ""}${s.best} ${lv.bestScore}/100` : s.scenarioOpen}</div></div>
            <div className="go">{lv.bestScore !== null ? s.replay : s.play_}</div>
          </Link>
        );
      })}

      <BadgeShelf lang={lang} earned={badges} />

      {pi ? (!player?.piUid && (
        <div className="card" style={{ marginTop: 14 }}>
          <p>π {s.piGuestNote}</p>
        </div>
      )) : !player?.email && (
        <div className="card" style={{ marginTop: 14 }}>
          <p>{s.guestNote}</p>
          <Link className="btn" href="/account">{s.createAccount}</Link>
        </div>
      )}
      <p className="note" dangerouslySetInnerHTML={{ __html: s.proto }} />
    </>
  );
}

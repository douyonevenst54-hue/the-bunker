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
  const showUpgrade = paywallOn() && !isMember(player);
  const nextUp = statuses.find((r) => r.unlocked && !r.passed && !premium.includes(r.id));
  const nextRoom = nextUp && ROOMS.find((r) => r.id === nextUp.id);

  return (
    <>
      <div className="card">
        <div className="stage">{player?.displayName ? `${s.bunker} · ${player.displayName}` : s.bunker}</div>
        <h1>{s.welcome}</h1>
        <p>{s.welcomeSub}</p>
        <div className="meter"><div style={{ width: `${(passed / total) * 100}%` }} /></div>
        <div className="count" style={{ marginTop: 6 }}>{passed} / {total} {s.roomsDone}</div>
        {nextRoom && <Link className="btn" href={`/room/${nextRoom.id}`}>{nextRoom.emoji} {s.continueWith}: {nextRoom.ui[lang].room.replace(/^[^·]*·\s*/, "")}</Link>}
        {(passed > 0 || badges.length > 0) && (
          <ShareButton ghost text={s.shareProgressText.replace("{rooms}", String(passed)).replace("{badges}", String(badges.length))} />
        )}
      </div>

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

      {!player?.email && (
        <div className="card" style={{ marginTop: 14 }}>
          <p>{s.guestNote}</p>
          <Link className="btn" href="/account">{s.createAccount}</Link>
        </div>
      )}
      <p className="note" dangerouslySetInnerHTML={{ __html: s.proto }} />
    </>
  );
}

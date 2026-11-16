import Link from "next/link";
import { cookies } from "next/headers";
import { ROOMS, COMING_SOON } from "@/lib/rooms";
import { asLang, LANG_COOKIE, STRINGS } from "@/lib/i18n";
import { getPlayer } from "@/lib/session";
import { getRoomStatuses, getBadgeIds, getScenarioProgress } from "@/lib/progress";
import { SCENARIOS } from "@/lib/scenarios";
import BunkerMap from "@/components/BunkerMap";
import BadgeShelf from "@/components/BadgeShelf";

export const dynamic = "force-dynamic";

export default async function Bunker() {
  const lang = asLang((await cookies()).get(LANG_COOKIE)?.value);
  const s = STRINGS[lang];
  const player = await getPlayer().catch(() => null);
  const sc = SCENARIOS[0];
  const [statuses, badges, scProg] = await Promise.all([
    getRoomStatuses(player?.id ?? null),
    getBadgeIds(player?.id ?? null),
    getScenarioProgress(player?.id ?? null, sc.id),
  ]);
  const scOpen = statuses.every((r) => r.passed);
  const total = ROOMS.length + COMING_SOON.length;
  const passed = statuses.filter((r) => r.passed).length;
  const nextUp = statuses.find((r) => r.unlocked && !r.passed);
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
      </div>

      <div className="card map-card">
        <BunkerMap lang={lang} statuses={statuses} />
        <div className="legend">
          <span><i className="lg passed" />{s.statusPassed}</span>
          <span><i className="lg open" />{s.play_}</span>
          <span><i className="lg locked" />{s.locked}</span>
          <span><i className="lg soon" />{s.comingSoon}</span>
        </div>
      </div>

      {scOpen ? (
        <Link className={`room scenario ${scProg?.passed ? "done" : ""}`} href={`/scenario/${sc.id}`} style={{ marginTop: 14 }}>
          <div className="ic">{sc.emoji}</div>
          <div className="mid"><div className="t">{sc.title[lang]}</div>
            <div className="s">{scProg ? `${scProg.passed ? "✅ " + s.statusPassed + " · " : ""}${s.best} ${scProg.bestScore}/100` : s.scenarioOpen}</div></div>
          <div className="go">{scProg ? s.replay : s.play_}</div>
        </Link>
      ) : (
        <div className="room scenario lock" style={{ marginTop: 14 }}>
          <div className="ic">🔒</div>
          <div className="mid"><div className="t">{sc.title[lang]}</div><div className="s">{s.scenarioLocked} · {passed}/6</div></div>
        </div>
      )}

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

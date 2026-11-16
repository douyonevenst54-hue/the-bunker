import Link from "next/link";
import { cookies } from "next/headers";
import { ROOMS, COMING_SOON } from "@/lib/rooms";
import { asLang, LANG_COOKIE, STRINGS } from "@/lib/i18n";
import { getPlayer } from "@/lib/session";
import { getRoomStatuses } from "@/lib/progress";

export const dynamic = "force-dynamic";

export default async function Bunker() {
  const lang = asLang((await cookies()).get(LANG_COOKIE)?.value);
  const s = STRINGS[lang];
  const player = await getPlayer().catch(() => null);
  const statuses = await getRoomStatuses(player?.id ?? null);
  const total = ROOMS.length + COMING_SOON.length;
  const passed = statuses.filter((r) => r.passed).length;

  return (
    <>
      <div className="card">
        <div className="stage">{s.bunker}</div>
        <h1>{s.welcome}</h1>
        <p>{s.welcomeSub}</p>
        <div className="meter"><div style={{ width: `${(passed / total) * 100}%` }} /></div>
        <div className="count" style={{ marginTop: 6 }}>{passed} / {total} {s.roomsDone}</div>
      </div>

      <div className="rooms">
        {ROOMS.map((room, i) => {
          const st = statuses[i];
          const status = !st.unlocked ? s.locked
            : st.passed ? `${s.statusPassed} · ${s.best} ${st.bestScore}/100`
            : st.played ? `${s.best} ${st.bestScore}/100 · ${s.statusRetry}`
            : s.statusNew;
          const inner = (
            <>
              <div className="ic">{st.unlocked ? room.emoji : "🔒"}</div>
              <div className="mid">
                <div className="t">{room.ui[lang].room}</div>
                <div className="s">{st.passed ? "✅ " : ""}{status}</div>
              </div>
              <div className="go">{!st.unlocked ? "🔒" : st.played ? s.replay : s.play_}</div>
            </>
          );
          return st.unlocked
            ? <Link key={room.id} className={`room ${st.passed ? "done" : ""}`} href={`/room/${room.id}`}>{inner}</Link>
            : <div key={room.id} className="room lock">{inner}</div>;
        })}
        {COMING_SOON.map((r, i) => (
          <div key={i} className="room soon">
            <div className="ic">{r.emoji}</div>
            <div className="mid"><div className="t">{r.name[lang]}</div><div className="s">{s.comingSoon}</div></div>
          </div>
        ))}
      </div>

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

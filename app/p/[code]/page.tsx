import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { asLang, LANG_COOKIE, STRINGS } from "@/lib/i18n";
import { sharedProgress } from "@/lib/share";
import { ROOMS } from "@/lib/rooms";
import { SCENARIOS } from "@/lib/scenarios";
import { BADGES } from "@/lib/badges";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const d = await sharedProgress(code);
  if (!d) return { title: "THE BUNKER", robots: { index: false } };
  const s = STRINGS.en;
  const title = `${s.pTitle.replace("{name}", d.name ?? "A player")} · THE BUNKER`;
  const description = `${d.rooms.filter((r) => r.passed).length}/6 rooms · ${d.levels.filter((l) => l.passed).length} levels · ${d.badges.length} badges. ${s.pJoin}`;
  return { title, description, robots: { index: false }, openGraph: { title, description, type: "website" }, twitter: { card: "summary_large_image", title, description } };
}

/** Public, read-only progress page a player chose to share. First name only, never the email. */
export default async function SharedPage({ params }: Props) {
  const { code } = await params;
  const d = await sharedProgress(code);
  if (!d) notFound();
  const lang = asLang((await cookies()).get(LANG_COOKIE)?.value);
  const s = STRINGS[lang];
  const passed = d.rooms.filter((r) => r.passed).length;
  return (
    <div className="card shared">
      <div className="stage">🛡️ THE BUNKER</div>
      <h1>{d.name ? s.pTitle.replace("{name}", d.name) : s.aPlayer}</h1>

      <h2>{s.pRooms} · {passed}/6</h2>
      <div className="meter"><div style={{ width: `${(passed / 6) * 100}%` }} /></div>
      <div className="shared-rooms">
        {ROOMS.map((r) => {
          const st = d.rooms.find((x) => x.id === r.id);
          return <span key={r.id} className={`sr ${st?.passed ? "on" : ""}`} title={r.ui[lang].title}>{r.emoji} {st?.passed ? "✅" : "·"}</span>;
        })}
      </div>

      <h2>{s.pLevels} · {d.levels.filter((l) => l.passed).length}/{d.levels.length}</h2>
      <ul className="shared-levels">
        {d.levels.map((l) => {
          const sc = SCENARIOS.find((x) => x.id === l.id)!;
          return <li key={l.id} className={l.passed ? "on" : ""}>{l.passed ? "✅" : "🔒"} {s.level} {l.level} · {sc.title[lang].replace(/^[^:]*:\s*/, "")}</li>;
        })}
      </ul>

      <h2>{s.pBadges} · {d.badges.length}</h2>
      {d.badges.length === 0 ? <p className="note">{s.pNone}</p> : (
        <div className="shared-badges">
          {BADGES.filter((b) => d.badges.includes(b.id)).map((b) => (
            <div key={b.id} className="nb"><span>{b.emoji}</span>{b.name[lang]}</div>
          ))}
        </div>
      )}

      <p style={{ marginTop: 16 }}>{s.pJoin}</p>
      <Link className="btn" href="/">{s.pCta}</Link>
    </div>
  );
}

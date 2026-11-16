import type { Lang } from "@/lib/rooms/types";
import { BADGES } from "@/lib/badges";
import { STRINGS } from "@/lib/i18n";

export default function BadgeShelf({ lang, earned }: { lang: Lang; earned: string[] }) {
  const s = STRINGS[lang];
  const have = new Set(earned);
  return (
    <div className="card" style={{ marginTop: 14 }}>
      <div className="stage">{s.badges} · {have.size}/{BADGES.length}</div>
      <div className="badges">
        {BADGES.map((b) => (
          <div key={b.id} className={`badge-tile ${have.has(b.id) ? "got" : ""}`} title={b.desc[lang]}>
            <div className="bi">{have.has(b.id) ? b.emoji : "🔒"}</div>
            <div className="bn">{b.name[lang]}</div>
            <div className="bd">{b.desc[lang]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

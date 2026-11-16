import type { Lang } from "@/lib/rooms/types";
import { ROOMS, COMING_SOON, MAP_LAYOUT } from "@/lib/rooms";
import type { RoomStatus } from "@/lib/progress";
import { STRINGS } from "@/lib/i18n";

type Kind = "passed" | "open" | "locked" | "soon" | "premium";

const W = 360, ROOM_W = 124, ROOM_H = 118, TOP = 70, GAP = 14;
const CORR_X = 145, CORR_W = 70;

/** Splits a room name into at most two short lines for the map. */
function lines(name: string): string[] {
  if (name.length <= 16) return [name];
  const amp = name.indexOf(" & ");
  if (amp > 0) return [name.slice(0, amp) + " &", name.slice(amp + 3)];
  const ak = name.indexOf(" ak ");
  if (ak > 0) return [name.slice(0, ak) + " ak", name.slice(ak + 4)];
  const mid = name.lastIndexOf(" ", 16);
  return mid > 0 ? [name.slice(0, mid), name.slice(mid + 1)] : [name];
}

export default function BunkerMap({ lang, statuses, premium = [] }: { lang: Lang; statuses: RoomStatus[]; premium?: string[] }) {
  const s = STRINGS[lang];
  const H = TOP + 3 * ROOM_H + 2 * GAP + 30;

  const slots = MAP_LAYOUT.map((slot) => {
    const room = ROOMS.find((r) => r.id === slot.id);
    const st = statuses.find((x) => x.id === slot.id);
    const soon = COMING_SOON.find((c) => c.id === slot.id);
    const kind: Kind = !room ? "soon" : !st?.unlocked ? "locked" : premium.includes(slot.id) ? "premium" : st.passed ? "passed" : "open";
    const name = room ? room.ui[lang].room.replace(/^[^·]*·\s*/, "") : soon!.name[lang];
    const emoji = room ? room.emoji : soon!.emoji;
    const status = kind === "passed" ? `✓ ${st!.bestScore}/100`
      : kind === "open" ? (st?.played ? `${s.best} ${st.bestScore} · ${s.replay}` : `▶ ${s.play_}`)
      : kind === "locked" ? `🔒 ${s.locked}` : kind === "premium" ? `💎 ${s.membersOnly}` : s.comingSoon;
    const x = slot.side === "left" ? CORR_X - 12 - ROOM_W : CORR_X + CORR_W + 12;
    const y = TOP + slot.row * (ROOM_H + GAP);
    return { ...slot, room, kind, name, emoji, status, x, y, n: room?.n };
  });

  return (
    <svg className="bunker-map" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={s.mapLabel}>
      <defs>
        <pattern id="grid" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M12 0H0V12" fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="1" />
        </pattern>
      </defs>
      {/* outer shell */}
      <rect x="4" y={TOP - 16} width={W - 8} height={H - TOP + 8} rx="18" fill="url(#grid)" stroke="#2c353a" strokeWidth="2" />
      {/* entrance + corridor */}
      <rect x={CORR_X} y="18" width={CORR_W} height={H - 34} rx="8" fill="#171c1f" stroke="#2c353a" />
      <rect x={CORR_X + 14} y="10" width={CORR_W - 28} height="14" rx="3" fill="#f2a93b" />
      <text x={W / 2} y="44" textAnchor="middle" className="map-small" fill="#f2a93b">{s.entrance}</text>
      <text x={W / 2} y={TOP + 1.5 * ROOM_H + GAP} textAnchor="middle" className="map-small" fill="#5d6a6e"
        transform={`rotate(-90 ${W / 2} ${TOP + 1.5 * ROOM_H + GAP})`}>{s.corridor}</text>

      {slots.map((r) => {
        const doorX = r.side === "left" ? r.x + ROOM_W : r.x - 12;
        const content = (
          <g className={`map-room ${r.kind}`}>
            <rect className="door" x={doorX} y={r.y + ROOM_H / 2 - 12} width="12" height="24" />
            <rect className="box" x={r.x} y={r.y} width={ROOM_W} height={ROOM_H} rx="12" />
            {r.n && <text x={r.x + 12} y={r.y + 20} className="map-num">{r.n}</text>}
            <text x={r.x + ROOM_W / 2} y={r.y + 42} textAnchor="middle" className="map-emoji">{r.kind === "locked" ? "🔒" : r.emoji}</text>
            {lines(r.name).map((ln, i, arr) => (
              <text key={i} x={r.x + ROOM_W / 2} y={r.y + (arr.length > 1 ? 66 : 72) + i * 14} textAnchor="middle" className="map-name">{ln}</text>
            ))}
            <text x={r.x + ROOM_W / 2} y={r.y + ROOM_H - 12} textAnchor="middle" className="map-status">{r.status}</text>
          </g>
        );
        return r.kind === "premium"
          ? <a key={r.id} href="/upgrade" aria-label={`${r.name}: ${r.status}`}>{content}</a>
          : r.kind === "open" || r.kind === "passed"
          ? <a key={r.id} href={`/room/${r.id}`} aria-label={`${r.name}: ${r.status}`}>{content}</a>
          : <g key={r.id} aria-label={`${r.name}: ${r.status}`}>{content}</g>;
      })}
    </svg>
  );
}

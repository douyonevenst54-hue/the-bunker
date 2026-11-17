import { ImageResponse } from "next/og";
import { sharedProgress } from "@/lib/share";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "THE BUNKER progress";

/** Link preview card for WhatsApp / Facebook / Messages. */
export default async function OG({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const d = await sharedProgress(code);
  const rooms = d ? d.rooms.filter((r) => r.passed).length : 0;
  const levels = d ? d.levels.filter((l) => l.passed).length : 0;
  const badges = d ? d.badges.length : 0;
  const name = d?.name ? `${d.name}'s bunker` : "Build your bunker";
  const stat = (n: string, l: string) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#1b222b", borderRadius: 24, padding: "24px 40px", border: "2px solid #2c3540" }}>
      <div style={{ fontSize: 84, fontWeight: 800, color: "#f2a93b" }}>{n}</div>
      <div style={{ fontSize: 30, color: "#c9d1cf" }}>{l}</div>
    </div>
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(135deg,#10151c,#1c2531)", color: "#e9ece8", padding: 60, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 800, letterSpacing: 4 }}>
          <span>THE&nbsp;</span><span style={{ color: "#f2a93b" }}>BUNKER</span>
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 800, marginTop: 30 }}>{name}</div>
        <div style={{ display: "flex", gap: 30, marginTop: 40 }}>
          {stat(`${rooms}/6`, "rooms passed")}
          {stat(String(levels), "levels survived")}
          {stat(String(badges), "badges")}
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#9aa5a3", marginTop: "auto" }}>Learn to protect your family · English & Kreyòl · buildthebunker.com</div>
      </div>
    ),
    size,
  );
}

import { ImageResponse } from "next/og";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "THE BUNKER — Build your bunker. Protect lives.";

/** Link preview for the home page. */
export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", background: "linear-gradient(135deg,#10151c,#1c2531)", color: "#e9ece8", padding: 70, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", fontSize: 96, fontWeight: 800, letterSpacing: 6 }}><span>THE&nbsp;</span><span style={{ color: "#f2a93b" }}>BUNKER</span></div>
        <div style={{ display: "flex", fontSize: 48, fontWeight: 700, marginTop: 20 }}>Build your bunker. Protect lives.</div>
        <div style={{ display: "flex", fontSize: 32, color: "#c9d1cf", marginTop: 30 }}>An emergency-preparedness game for families · English & Kreyòl · Free to start</div>
        <div style={{ display: "flex", fontSize: 28, color: "#9aa5a3", marginTop: "auto" }}>buildthebunker.com</div>
      </div>
    ),
    size,
  );
}

// Browser-side funnel tracking: "start" and "finish" per room or level, with an anonymous visitor id.
export type Mode = "2d" | "3d" | "level";

function visitorId(): string {
  try {
    let v = localStorage.getItem("bunker_vid");
    if (!v) { v = (crypto.randomUUID?.() ?? String(Math.random()).slice(2) + Date.now()).replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 32); localStorage.setItem("bunker_vid", v); }
    return v;
  } catch { return "anon" + Math.random().toString(36).slice(2, 12); }
}

export function track(kind: "start" | "finish", contentId: string, mode: Mode) {
  try {
    const device = window.matchMedia("(pointer: coarse)").matches ? "phone" : "desktop";
    const body = JSON.stringify({ kind, contentId, mode, device, visitor: visitorId() });
    if (navigator.sendBeacon?.("/api/events", new Blob([body], { type: "text/plain" }))) return;
    fetch("/api/events", { method: "POST", body, keepalive: true }).catch(() => {});
  } catch { /* tracking never breaks the game */ }
}

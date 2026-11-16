// End-to-end test against a running server with a real database.
// Usage: BASE=http://localhost:3000 DATABASE_URL=... node tests/e2e.mjs
import { execSync } from "node:child_process";

const BASE = process.env.BASE || "http://localhost:3000";
let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`); if (!cond) failures++; };

class Client {
  cookies = new Map();
  async req(path, { method = "GET", body } = {}) {
    const res = await fetch(BASE + path, {
      method, redirect: "manual",
      headers: { ...(body ? { "Content-Type": "application/json" } : {}), Cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; ") },
      body: body ? JSON.stringify(body) : undefined,
    });
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [kv] = c.split(";"); const i = kv.indexOf("=");
      const k = kv.slice(0, i), v = kv.slice(i + 1);
      if (v === "" || /max-age=0|expires=thu, 01 jan 1970/i.test(c)) this.cookies.delete(k); else this.cookies.set(k, v);
    }
    const text = await res.text();
    let json; try { json = JSON.parse(text); } catch {}
    return { status: res.status, text, json, location: res.headers.get("location") };
  }
}

// Answers built from the real content
const { ROOMS } = await import("../.test-build/rooms.mjs");
const water = ROOMS.find((r) => r.id === "water");
const perfect = (room) => ({ sort: room.items.map((i) => i.b), stages: Object.fromEntries(room.stages.map((S) => [S.key, S.qs.map((q) => q.a)])) });
const withCriticalMiss = (room) => {
  const a = perfect(room); const S = room.stages.find((s) => s.qs.some((q) => q.critical));
  const i = S.qs.findIndex((q) => q.critical); a.stages[S.key][i] = (S.qs[i].a + 1) % S.qs[i].en.o.length; return a;
};
const sql = (q) => execSync(`psql "${process.env.DATABASE_URL}" -tAc "${q}"`).toString().trim();

const g = new Client();
let r = await g.req("/");
ok(r.status === 200 && r.text.includes("Water"), "dashboard loads for a new visitor");
r = await g.req("/room/medical");
ok(r.status === 307 || r.status === 303 || r.status === 302, "Room 2 is locked for a new visitor (redirects)");
r = await g.req("/medical");
ok(r.status === 308 && r.location?.endsWith("/room/medical"), "old /medical URL redirects to /room/medical");
r = await g.req("/room/water/review");
ok(r.status === 200 && r.text.includes("⚠️"), "expert review page shows critical markers");

r = await g.req("/api/rooms/water/complete", { method: "POST", body: { answers: { sort: ["u"], stages: {} } } });
ok(r.status === 400, "malformed answers are rejected");
r = await g.req("/api/rooms/nope/complete", { method: "POST", body: { answers: {} } });
ok(r.status === 404, "unknown room is rejected");

r = await g.req("/api/rooms/water/complete", { method: "POST", body: { answers: withCriticalMiss(water), score: 100 } });
ok(r.status === 200 && r.json?.saved && r.json.result.passed === false && r.json.result.score >= 90, "critical miss: high score but NOT passed (client 'score' ignored)");
ok(g.cookies.has("bunker_session"), "guest session cookie created on first save");
r = await g.req("/room/medical");
ok(r.status !== 200, "Room 2 still locked after a critical miss");

r = await g.req("/api/rooms/water/complete", { method: "POST", body: { answers: perfect(water) } });
ok(r.json?.result?.score === 100 && r.json.result.passed, "perfect run passes");
r = await g.req("/room/medical");
ok(r.status === 200, "Room 2 unlocks after passing Room 1");
const guestId = sql("select id from \\\"Player\\\" where email is null order by \\\"createdAt\\\" limit 1");
ok(sql(`select attempts||','||\\\"bestScore\\\"||','||passed from \\\"RoomProgress\\\" where \\\"playerId\\\"='${guestId}'`) === "2,100,true", "progress row: 2 attempts, best 100, passed");

// Register upgrades the guest in place
r = await g.req("/api/auth/register", { method: "POST", body: { email: "Test@Example.com", password: "short" } });
ok(r.status === 400 && r.json?.error === "errPassword", "short password rejected");
r = await g.req("/api/auth/register", { method: "POST", body: { email: "Test@Example.com", password: "longenough1", name: "Jhon" } });
ok(r.status === 200, "register works");
ok(sql(`select email from \\\"Player\\\" where id='${guestId}'`) === "test@example.com", "guest became the account (progress kept, email normalized)");
r = await g.req("/account");
ok(r.text.includes("test@example.com"), "account page shows signed-in email");

const other = new Client();
r = await other.req("/api/auth/register", { method: "POST", body: { email: "test@example.com", password: "longenough1" } });
ok(r.status === 409, "duplicate email rejected");
r = await other.req("/api/auth/login", { method: "POST", body: { email: "test@example.com", password: "wrongpass1" } });
ok(r.status === 401, "wrong password rejected");

// A new guest plays, then logs in: progress merges into the account
const g2 = new Client();
const medical = ROOMS.find((x) => x.id === "medical");
r = await g2.req("/api/rooms/medical/complete", { method: "POST", body: { answers: perfect(medical) } });
ok(r.json?.saved, "second guest saves a Room 2 result");
r = await g2.req("/api/auth/login", { method: "POST", body: { email: "test@example.com", password: "longenough1" } });
ok(r.status === 200, "login works");
ok(sql(`select count(*) from \\\"RoomProgress\\\" where \\\"playerId\\\"='${guestId}'`) === "2", "guest progress merged into account on login");
ok(sql(`select count(*) from \\\"Player\\\" where email is null`) === "0", "merged guest record removed");

r = await g2.req("/api/auth/logout", { method: "POST" });
ok(!g2.cookies.has("bunker_session"), "logout clears the session");

console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);

// End-to-end test against a running server with a real database.
// Usage: BASE=http://localhost:3000 DATABASE_URL=... node tests/e2e.mjs
import { execSync } from "node:child_process";
import { createHmac } from "node:crypto";

const BASE = process.env.BASE || "http://localhost:3000";
let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`); if (!cond) failures++; };

class Client {
  cookies = new Map();
  constructor(base = BASE) { this.base = base; }
  async req(path, { method = "GET", body } = {}) {
    const res = await fetch(this.base + path, {
      method, redirect: "manual",
      headers: { ...(body ? { "Content-Type": "application/json" } : {}), Cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; ") },
      body: body ? JSON.stringify(body) : undefined,
    });
    this.lastSetCookie = (res.headers.getSetCookie?.() ?? []).join("\n");
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [kv] = c.split(";"); const i = kv.indexOf("=");
      const k = kv.slice(0, i), v = kv.slice(i + 1);
      if (v === "" || /max-age=0|expires=thu, 01 jan 1970/i.test(c)) this.cookies.delete(k); else this.cookies.set(k, v);
    }
    const text = await res.text();
    let json; try { json = JSON.parse(text); } catch {}
    return { status: res.status, text, json, location: res.headers.get("location"), headers: res.headers };
  }
}

// Answers built from the real content
const { ROOMS } = await import("../.test-build/rooms.mjs");
const water = ROOMS.find((r) => r.id === "water");
const { SCENARIOS } = await import("../.test-build/scenarios.mjs");
const outage = SCENARIOS[0];
const bestChoices = outage.events.map((ev) => ev.choices.findIndex((c) => c.outcome === "best"));
const storm = SCENARIOS.find((x) => x.id === "storm");
const stormBest = storm.events.map((ev) => ev.choices.findIndex((c) => c.outcome === "best"));
const best = (S) => S.kind === "place" ? S.items.map((it) => S.zones.findIndex((z) => it.ok.includes(z.id))) : S.qs.map((q) => q.a);
const perfect = (room) => ({ sort: room.items.map((i) => i.b), stages: Object.fromEntries(room.stages.map((S) => [S.key, best(S)])) });
const withUnsafePlacement = (room) => {
  const a = perfect(room); const S = room.stages.find((s) => s.kind === "place");
  const i = S.items.findIndex((it) => it.unsafe?.length); a.stages[S.key][i] = S.zones.findIndex((z) => z.id === S.items[i].unsafe[0]); return a;
};
const withCriticalMiss = (room) => {
  const a = perfect(room); const S = room.stages.find((s) => s.qs?.some((q) => q.critical));
  const i = S.qs.findIndex((q) => q.critical); a.stages[S.key][i] = (S.qs[i].a + 1) % S.qs[i].en.o.length; return a;
};
/** Sends a Stripe-signed webhook event (same scheme Stripe uses: t=..,v1=HMAC-SHA256). */
const stripeEvent = async (type, object, secret = process.env.STRIPE_WEBHOOK_SECRET) => {
  const payload = JSON.stringify({ id: "evt_test_" + Math.random().toString(36).slice(2), object: "event", type, data: { object } });
  const t = Math.floor(Date.now() / 1000);
  const sig = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  const res = await fetch(BASE + "/api/billing/webhook", { method: "POST", headers: { "Content-Type": "application/json", "Stripe-Signature": `t=${t},v1=${sig}` }, body: payload });
  return res.status;
};
const sql = (q) => execSync(`psql "${process.env.DATABASE_URL}" -tAc "${q}"`).toString().trim();

const g = new Client();
let r = await g.req("/");
ok(r.status === 200 && r.text.includes("bunker-map") && r.text.includes("Water"), "dashboard shows the bunker map");
ok(r.text.includes('href="/room/water"') && !r.text.includes('href="/room/medical"'), "map: Room 1 is clickable, Room 2 is not");
r = await g.req("/room/medical");
ok(r.status === 307 || r.status === 303 || r.status === 302, "Room 2 is locked for a new visitor (redirects)");
r = await g.req("/scenario/power-outage");
ok(r.status !== 200, "scenario is locked for a new visitor");
r = await g.req("/scenario/power-outage/review");
ok(r.status !== 200 && r.location?.includes("/upgrade"), "members-only review page sends visitors to /upgrade");
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
ok(JSON.stringify(r.json?.newBadges) === '["first_steps"]', "first finish earns only 'First Steps'");
r = await g.req("/room/medical");
ok(r.status !== 200, "Room 2 still locked after a critical miss");

{
  const u = new Client();
  const res = await u.req("/api/rooms/water/complete", { method: "POST", body: { answers: withUnsafePlacement(water) } });
  ok(res.json?.result?.passed === false && res.json.result.criticalMisses.length === 1 && res.json.result.score >= 90, "unsafe placement (bleach in kids' corner) is a critical error: high score, not passed");
  const bad = perfect(water); bad.stages.place[0] = 99;
  ok((await u.req("/api/rooms/water/complete", { method: "POST", body: { answers: bad } })).status === 400, "placement into a zone that doesn't exist is rejected");
  sql("delete from \\\"Player\\\" where id = (select id from \\\"Player\\\" order by \\\"createdAt\\\" desc limit 1)"); // remove this throwaway guest
}
r = await g.req("/api/rooms/water/complete", { method: "POST", body: { answers: perfect(water) } });
ok(r.json?.result?.score === 100 && r.json.result.passed, "perfect run passes");
ok(["water_guardian", "perfect", "comeback"].every((b) => r.json?.newBadges?.includes(b)) && !r.json.newBadges.includes("first_try"), "pass after a miss: Water Guardian + Perfect + Never Give Up (not first try)");
r = await g.req("/");
ok(r.text.includes('href="/room/medical"') && r.text.includes("100/100"), "map updates: Room 1 shows 100/100, Room 2 clickable");
r = await g.req("/room/medical");
ok(r.status === 200, "Room 2 unlocks after passing Room 1");
const guestId = sql("select id from \\\"Player\\\" where email is null order by \\\"createdAt\\\" limit 1");
ok(sql(`select attempts||','||\\\"bestScore\\\"||','||passed from \\\"RoomProgress\\\" where \\\"playerId\\\"='${guestId}'`) === "2,100,true", "progress row: 2 attempts, best 100, passed");

// Register upgrades the guest in place
r = await g.req("/api/auth/register", { method: "POST", body: { email: "Test@Example.com", password: "short" } });
ok(r.status === 400 && r.json?.error === "errPassword", "short password rejected");
ok((await new Client().req("/api/auth/register", { method: "POST", body: { email: "kid@example.com", password: "longenough1" } })).json?.error === "errAge", "register requires the 13+ / parent confirmation");
r = await g.req("/api/auth/register", { method: "POST", body: { email: "Test@Example.com", password: "longenough1", name: "Jhon", age13: true } });
ok(r.status === 200, "register works");
ok(sql(`select email from \\\"Player\\\" where id='${guestId}'`) === "test@example.com", "guest became the account (progress kept, email normalized)");
r = await g.req("/account");
ok(r.text.includes("test@example.com"), "account page shows signed-in email");

const other = new Client();
r = await other.req("/api/auth/register", { method: "POST", body: { email: "test@example.com", password: "longenough1", age13: true } });
ok(r.status === 409, "duplicate email rejected");
r = await other.req("/api/auth/login", { method: "POST", body: { email: "test@example.com", password: "wrongpass1" } });
ok(r.status === 401, "wrong password rejected");

// A new guest plays, then logs in: progress merges into the account
const g2 = new Client();
const medical = ROOMS.find((x) => x.id === "medical");
r = await g2.req("/api/rooms/medical/complete", { method: "POST", body: { answers: perfect(medical) } });
ok(r.json?.saved && r.json.newBadges.includes("first_try"), "second guest saves a Room 2 result and earns 'Ready on Day One'");
r = await g2.req("/api/auth/login", { method: "POST", body: { email: "test@example.com", password: "longenough1", age13: true } });
ok(r.status === 200, "login works");
ok(sql(`select count(*) from \\\"RoomProgress\\\" where \\\"playerId\\\"='${guestId}'`) === "2", "guest progress merged into account on login");
ok(sql(`select count(*) from \\\"Player\\\" where email is null`) === "0", "merged guest record removed");

// Full bunker: six rooms in order
{
  const p6 = new Client();
  // Paywall: a free account can play rooms 1–2 only
  await p6.req("/api/auth/register", { method: "POST", body: { email: "member@example.com", password: "longenough1", age13: true } });
  for (const room of ROOMS.slice(0, 2)) await p6.req(`/api/rooms/${room.id}/complete`, { method: "POST", body: { answers: perfect(room) } });
  r = await p6.req("/room/security");
  ok(r.status !== 200 && r.location?.includes("/upgrade"), "paywall: Room 3 sends a free account to /upgrade");
  ok((await p6.req("/api/rooms/security/complete", { method: "POST", body: { answers: perfect(ROOMS[2]) } })).status === 402, "paywall: Room 3 results can't be saved without membership");
  r = await p6.req("/");
  ok(r.text.includes('href="/upgrade"') && r.text.includes("Members only"), "dashboard shows members-only rooms and the upgrade button");
  r = await p6.req("/upgrade");
  ok(r.status === 200 && r.text.includes("Unlock the whole bunker"), "upgrade page loads");
  ok((await p6.req("/api/billing/checkout", { method: "POST", body: { interval: "month" } })).status === 503, "checkout waits until Stripe is configured");
  ok((await new Client().req("/api/billing/checkout", { method: "POST", body: {} })).status === 401, "checkout needs an account");
  const p6id = sql("select id from \\\"Player\\\" where email='member@example.com'");
  ok(await stripeEvent("checkout.session.completed", { id: "cs_1", object: "checkout.session", mode: "subscription", status: "complete", client_reference_id: p6id, customer: "cus_member" }, "whsec_wrong") === 400, "webhook: bad signature rejected");
  ok(await stripeEvent("checkout.session.completed", { id: "cs_1", object: "checkout.session", mode: "subscription", status: "complete", client_reference_id: p6id, customer: "cus_member" }) === 200, "webhook: signed checkout event accepted");
  ok(sql(`select \\\"subStatus\\\"||','||\\\"stripeCustomerId\\\" from \\\"Player\\\" where id='${p6id}'`) === "active,cus_member", "checkout makes the account a member");
  ok((await p6.req("/room/security")).status === 200, "member: Room 3 opens");
  let allOk = true, lockedOk = true;
  for (const [i, room] of ROOMS.entries()) {
    if (i >= 2 && i + 1 < ROOMS.length) { const nx = await p6.req("/room/" + ROOMS[i + 1].id); if (nx.status === 200) lockedOk = false; }
    const res = await p6.req(`/api/rooms/${room.id}/complete`, { method: "POST", body: { answers: perfect(room) } });
    if (!(res.json?.result?.score === 100 && res.json.result.passed)) allOk = false;
    if (i === ROOMS.length - 1) ok(res.json.newBadges.includes("bunker_complete") && res.json.newBadges.includes("power_keeper"), "passing Room 6 earns Power Keeper + Bunker Commander");
  }
  ok(ROOMS.length === 6 && allOk, "all six rooms: a perfect run scores 100 and passes");
  ok(lockedOk, "each room stays locked until the one before it is passed");
  const dash = await p6.req("/");
  ok(ROOMS.every((r) => dash.text.includes(`href="/room/${r.id}"`)) && dash.text.includes("6<!-- --> / <!-- -->6"), "map: all six rooms open, 6 / 6 passed");
  for (const r of ROOMS) { const rv = await p6.req(`/room/${r.id}/review`); if (rv.status !== 200) ok(false, "review page " + r.id); }
  ok(true, "review pages load for all six rooms");
  ok((await p6.req("/scenario/power-outage")).status === 200, "scenario unlocks after all six rooms are passed");
  ok((await p6.req("/scenario/storm")).status !== 200, "level 2 (storm) stays locked until level 1 is passed");
  ok((await p6.req("/api/scenarios/storm/complete", { method: "POST", body: { answers: stormBest } })).status === 403, "level 2 can't be submitted while locked");
  ok((await p6.req("/scenario/flood")).status !== 200, "level 3 (flood) stays locked until level 2 is passed");
  ok((await p6.req("/api/scenarios/power-outage/complete", { method: "POST", body: { answers: [0] } })).status === 400, "scenario: malformed answers rejected");
  const unsafeChoices = [...bestChoices]; const ui = outage.events.findIndex((ev) => ev.choices.some((c) => c.outcome === "unsafe"));
  unsafeChoices[ui] = outage.events[ui].choices.findIndex((c) => c.outcome === "unsafe");
  let sres = await p6.req("/api/scenarios/power-outage/complete", { method: "POST", body: { answers: unsafeChoices } });
  ok(sres.json?.result?.passed === false && sres.json.result.criticalMisses.length === 1 && sres.json.result.score === 90, "scenario: one unsafe choice = 90 but not passed");
  sres = await p6.req("/api/scenarios/power-outage/complete", { method: "POST", body: { answers: bestChoices } });
  ok(sres.json?.result?.score === 100 && sres.json.result.passed && sres.json.newBadges.includes("outage_survivor"), "scenario: best choices pass and earn Outage Survivor");
  const dash2 = await p6.req("/");
  ok(dash2.text.includes('href="/scenario/power-outage"') && dash2.text.includes("100/100"), "dashboard shows the passed scenario");
  const anon = await new Client().req("/api/scenarios/power-outage/complete", { method: "POST", body: { answers: bestChoices } });
  ok(anon.status === 403, "scenario can't be submitted by a player who hasn't passed the rooms");
  ok((await p6.req("/scenario/storm")).status === 200, "level 2 (storm) unlocks after level 1 is passed");
  const stormUnsafe = [...stormBest]; const su = storm.events.findIndex((ev) => ev.choices.some((c) => c.outcome === "unsafe"));
  stormUnsafe[su] = storm.events[su].choices.findIndex((c) => c.outcome === "unsafe");
  let st = await p6.req("/api/scenarios/storm/complete", { method: "POST", body: { answers: stormUnsafe } });
  ok(st.json?.result?.passed === false && st.json.result.criticalMisses.length === 1, "storm: an unsafe choice blocks passing");
  st = await p6.req("/api/scenarios/storm/complete", { method: "POST", body: { answers: stormBest } });
  ok(st.json?.result?.score === 100 && st.json.result.passed && st.json.newBadges.includes("storm_survivor") && !st.json.newBadges.includes("bunker_complete"), "storm: best choices pass and earn Storm Survivor");
  const dash3 = await p6.req("/");
  ok(dash3.text.includes('href="/scenario/storm"') && dash3.text.includes("Level"), "dashboard lists the levels");
  ok((await p6.req("/scenario/storm/review")).status === 200, "storm review page loads");
  // Level 3 opens only after level 2
  const flood = SCENARIOS.find((x) => x.id === "flood");
  const floodBest = flood.events.map((ev) => ev.choices.findIndex((c) => c.outcome === "best"));
  ok((await p6.req("/scenario/flood")).status === 200, "level 3 (flood) unlocks after level 2 is passed");
  const fu = [...floodBest]; const fi = flood.events.findIndex((ev) => ev.choices.some((c) => c.outcome === "unsafe"));
  fu[fi] = flood.events[fi].choices.findIndex((c) => c.outcome === "unsafe");
  let fl = await p6.req("/api/scenarios/flood/complete", { method: "POST", body: { answers: fu } });
  ok(fl.json?.result?.passed === false && fl.json.result.criticalMisses.length === 1, "flood: an unsafe choice blocks passing");
  fl = await p6.req("/api/scenarios/flood/complete", { method: "POST", body: { answers: floodBest } });
  ok(fl.json?.result?.score === 100 && fl.json.result.passed && fl.json.newBadges.includes("flood_survivor"), "flood: best choices pass and earn Flood Survivor");
  // Sharing: public progress page with first name only, link preview image, and turning it off
  ok((await p6.req("/")).text.includes("Share my bunker"), "dashboard shows the share button");
  const sh = await p6.req("/api/share", { method: "POST" });
  const shareUrl = sh.json?.url ?? "";
  ok(sh.status === 200 && /\/p\/[A-Za-z0-9_-]{8}$/.test(shareUrl), "share link created");
  ok((await p6.req("/api/share", { method: "POST" })).json?.url === shareUrl, "share link stays the same");
  const sharePath = new URL(shareUrl).pathname;
  const pub = await new Client().req(sharePath);
  ok(pub.status === 200 && pub.text.includes("6/6") && pub.text.includes("Bunker Commander") && !pub.text.includes("member@example.com"),
    "public page shows rooms and badges, never the email");
  ok(pub.text.includes("og:image"), "public page has a link-preview image");
  const og = await fetch(BASE + sharePath + "/opengraph-image");
  ok(og.status === 200 && (og.headers.get("content-type") || "").includes("image/png"), "link-preview image renders");
  ok((await p6.req("/account")).text.includes("Stop sharing my page"), "account page offers 'Stop sharing'");
  await p6.req("/api/share", { method: "DELETE" });
  ok((await new Client().req(sharePath)).status === 404, "after 'Stop sharing' the old link no longer works");
  ok((await new Client().req("/p/notarealcode")).status === 404, "unknown share codes are 404");
  // Launch polish: legal pages, SEO files, security headers, 404, sign-in rate limit
  for (const path of ["/privacy", "/terms", "/robots.txt", "/sitemap.xml", "/manifest.webmanifest", "/opengraph-image"]) {
    ok((await fetch(BASE + path)).status === 200, `${path} is served`);
  }
  const hp = await fetch(BASE + "/");
  ok(hp.headers.get("x-frame-options") === "DENY" && hp.headers.get("x-content-type-options") === "nosniff", "security headers are set");
  ok((await hp.text()).includes('href="/privacy"'), "footer links to the privacy policy");
  const nf = await new Client().req("/no-such-page");
  ok(nf.status === 404 && nf.text.includes("bunker"), "friendly 404 page");
  const guesser = new Client();
  let last = 0;
  for (let i = 0; i < 9; i++) last = (await guesser.req("/api/auth/login", { method: "POST", body: { email: "member@example.com", password: "wrongpass" + i } })).status;
  ok(last === 429, "password guessing is blocked after 8 failures (429)");
  ok((await guesser.req("/api/auth/login", { method: "POST", body: { email: "member@example.com", password: "longenough1" } })).status === 429, "even the right password waits during the lockout");
  // Membership updates and cancellation
  ok(await stripeEvent("customer.subscription.updated", { id: "sub_1", object: "subscription", customer: "cus_member", status: "active", metadata: {}, items: { data: [{ price: { recurring: { interval: "year" } }, current_period_end: 1893456000 }] } }) === 200
    && sql(`select \\\"subInterval\\\" from \\\"Player\\\" where \\\"stripeCustomerId\\\"='cus_member'`) === "year", "webhook: subscription update stores the yearly plan");
  await stripeEvent("customer.subscription.deleted", { id: "sub_1", object: "subscription", customer: "cus_member", status: "canceled", metadata: {}, items: { data: [] } });
  r = await p6.req("/room/security");
  ok(r.status !== 200 && r.location?.includes("/upgrade"), "cancelled membership: Room 3 is members-only again");
  ok((await p6.req("/room/medical")).status === 200, "cancelled membership: free rooms stay open");
}

// Admin & safety review
{
  const adm = new Client();
  const viewer = new Client(); // Room 1 is open to anyone
  await adm.req("/api/auth/register", { method: "POST", body: { email: "admin@example.com", password: "adminpass1", name: "Dr. Test", age13: true } });
  ok((await adm.req("/admin")).status === 200, "admin dashboard loads for an ADMIN_EMAILS account");
  ok((await new Client().req("/admin")).status === 404, "admin dashboard hidden from guests");
  ok((await g.req("/admin")).status === 404, "admin dashboard hidden from regular players");
  const dashA = await adm.req("/admin");
  ok(dashA.text.includes("% passed") && dashA.text.includes("missed"), "dashboard shows pass rates and most-missed questions");
  // Step 16: game-first homepage, readiness profile, start → finish funnel
  const fresh = await new Client().req("/");
  ok(fresh.text.includes("Would you be ready") && fresh.text.includes('href="/room/water/3d"'), "new visitors see the game-first hero that opens the 3D bunker");
  const back = await g.req("/");
  ok(back.text.includes("Preparedness knowledge score") && back.text.includes("does not guarantee safety"), "returning players see their readiness profile with its safety note");
  ok(!back.text.includes("Would you be ready"), "returning players skip the hero");
  const ev = (body) => fetch(BASE + "/api/events", { method: "POST", body: JSON.stringify(body) }).then((x) => x.status);
  const before = Number(sql(`select count(*) from \\"PlayEvent\\"`));
  ok(await ev({ kind: "start", contentId: "water", mode: "3d", device: "phone", visitor: "testvisitor01" }) === 204
    && await ev({ kind: "finish", contentId: "water", mode: "3d", device: "phone", visitor: "testvisitor01" }) === 204
    && await ev({ kind: "start", contentId: "water", mode: "2d", device: "desktop", visitor: "testvisitor02" }) === 204, "funnel events are accepted");
  await ev({ kind: "start", contentId: "../etc", mode: "3d", device: "phone", visitor: "testvisitor03" });
  await ev({ kind: "hack", contentId: "water", mode: "3d", device: "phone", visitor: "testvisitor03" });
  ok(Number(sql(`select count(*) from \\"PlayEvent\\"`)) - before === 3, "malformed events are ignored");
  const dashF = await adm.req("/admin");
  ok(dashF.text.includes("Start → finish") && dashF.text.includes("guest → account"), "admin dashboard shows the start → finish funnel");

  const NEW = "Safe water for every family";
  r = await g.req("/api/admin/revisions", { method: "POST", body: { contentId: "water", path: "ui.en.title", newValue: NEW } });
  ok(r.status === 403, "non-admin can't propose edits");
  r = await adm.req("/api/admin/revisions", { method: "POST", body: { contentId: "water", path: "items.0.b", newValue: "a" } });
  ok(r.status === 400, "answer keys can't be edited from the admin panel");
  r = await adm.req("/api/admin/revisions", { method: "POST", body: { contentId: "water", path: "ui.en.title", newValue: NEW, note: "clearer" } });
  ok(r.status === 200 && r.json?.id, "admin proposes a text edit");
  const revId = r.json.id;
  ok(!(await viewer.req("/room/water")).text.includes(NEW), "pending edit is NOT shown to players");
  ok((await adm.req("/admin/content/water")).text.includes(NEW), "content page lists the pending edit");
  r = await adm.req("/api/admin/signoff", { method: "POST", body: { contentId: "water" } });
  ok(r.status === 409, "can't sign off while edits are pending");
  r = await adm.req(`/api/admin/revisions/${revId}`, { method: "POST", body: { action: "approve" } });
  ok(r.status === 200, "admin approves the edit");
  ok((await viewer.req("/room/water")).text.includes(NEW), "approved edit reaches players");
  ok(sql(`select status||','||\\\"selfApproved\\\" from \\\"ContentRevision\\\" where id='${revId}'`) === "approved,true", "audit log records approval (flagged self-approved)");
  r = await adm.req("/api/admin/signoff", { method: "POST", body: { contentId: "water", name: "Dr. Test, MD" } });
  ok(r.status === 200, "admin signs off the room");
  ok((await viewer.req("/room/water")).text.includes("Content reviewed by") && (await viewer.req("/room/water")).text.includes("Dr. Test, MD"), "players see who reviewed the room");
  r = await adm.req("/api/admin/revisions", { method: "POST", body: { contentId: "power-outage", path: "events.0.text.ht", newValue: "Limyè yo etenn. Kijan ou klere kay la?" } });
  ok(r.status === 200, "scenario text is editable too");
}

// Forgot password
const { readFileSync } = await import("node:fs");
const lastToken = () => [...readFileSync(process.env.NEXT_LOG || "/tmp/next.log", "utf8").matchAll(/reset\?token=([A-Za-z0-9_-]+)/g)].pop()?.[1];
const anon = new Client();
r = await anon.req("/forgot"); ok(r.status === 200, "forgot page loads");
r = await anon.req("/api/auth/forgot", { method: "POST", body: { email: "nobody@example.com" } });
ok(r.status === 200 && r.json?.ok && !lastToken(), "unknown email: same answer, no email sent");
r = await anon.req("/api/auth/forgot", { method: "POST", body: { email: "TEST@example.com", lang: "ht" } });
await new Promise((res) => setTimeout(res, 300));
const tok = lastToken();
ok(r.json?.ok && !!tok, "known email: reset link emailed");
ok(readFileSync("/tmp/next.log", "utf8").includes("Chanje modpas THE BUNKER ou"), "email subject follows the player's language (Kreyòl)");
ok(sql("select count(*) from \\\"PasswordResetToken\\\" where \\\"tokenHash\\\" = '" + tok + "'") === "0", "raw token is not stored (only its hash)");
r = await anon.req("/reset?token=" + tok); ok(r.status === 200, "reset page loads");
r = await anon.req("/api/auth/reset", { method: "POST", body: { token: tok, password: "short" } });
ok(r.status === 400 && r.json?.error === "errPassword", "reset: short password rejected");
r = await anon.req("/api/auth/reset", { method: "POST", body: { token: "bogus", password: "brandnew123" } });
ok(r.status === 400 && r.json?.error === "errResetLink", "reset: bad token rejected");
r = await anon.req("/api/auth/reset", { method: "POST", body: { token: tok, password: "brandnew123" } });
ok(r.status === 200 && anon.cookies.has("bunker_session"), "reset works and signs the player in");
r = await anon.req("/api/auth/reset", { method: "POST", body: { token: tok, password: "another1234" } });
ok(r.status === 400, "reset link can't be used twice");
r = await new Client().req("/api/auth/login", { method: "POST", body: { email: "test@example.com", password: "longenough1", age13: true } });
ok(r.status === 401, "old password no longer works");
r = await new Client().req("/api/auth/login", { method: "POST", body: { email: "test@example.com", password: "brandnew123" } });
ok(r.status === 200, "new password works");
for (let i = 0; i < 4; i++) await anon.req("/api/auth/forgot", { method: "POST", body: { email: "test@example.com" } });
ok(Number(sql("select count(*) from \\\"PasswordResetToken\\\" where \\\"createdAt\\\" > now() - interval '1 hour'")) <= 3, "reset emails limited to 3 per hour");

r = await g2.req("/api/auth/logout", { method: "POST" });
ok(!g2.cookies.has("bunker_session"), "logout clears the session");

// ---------- Step 18: 72-hour survival mode (free, guests included, scored on the server) ----------
{
  const { getSurvival, isLocked } = await import("../.test-build/survival.mjs");
  const m = getSurvival("survival-72");
  const fullKit = ["water3", "food3", "opener", "flashlight", "radio", "firstaid", "meds", "baby", "sanitation"];
  const bestFor = (kit) => m.turns.map((t) => t.choices.findIndex((c) => c.outcome === "best" && !isLocked(c, kit)));
  const sv = new Client();
  let r = await sv.req("/survival");
  ok(r.status === 200 && r.text.includes("72"), "survival page loads for a brand-new visitor");
  ok((await sv.req("/")).text.includes("/survival"), "homepage links to the 72-hour survival mode");
  r = await sv.req("/api/survival/survival-72/complete", { method: "POST", body: { kit: fullKit, answers: bestFor(fullKit) } });
  ok(r.status === 200 && r.json?.result?.score === 100 && r.json?.result?.passed && r.json?.result?.hoursSurvived === 72, "a well-packed kit and safe choices score 100 and pass");
  ok(r.json?.newBadges?.includes("survivor_72"), "passing earns the 72-Hour Survivor badge");
  ok(sql(`select count(*) from \\"RoomAttempt\\" where \\"roomId\\" = 'survival-72'`) === "1", "the run is saved");
  const tooBig = [...fullKit, "cash"];
  ok((await sv.req("/api/survival/survival-72/complete", { method: "POST", body: { kit: tooBig, answers: bestFor(tooBig) } })).status === 400, "a kit over 12 slots is refused");
  const noLight = fullKit.filter((k) => k !== "flashlight");
  const cheat = bestFor(fullKit);
  ok((await sv.req("/api/survival/survival-72/complete", { method: "POST", body: { kit: noLight, answers: cheat } })).status === 400, "a choice that needs an item you didn't pack is refused");
  const unsafe = bestFor(fullKit);
  unsafe[7] = m.turns[7].choices.findIndex((c) => c.outcome === "unsafe");
  r = await sv.req("/api/survival/survival-72/complete", { method: "POST", body: { kit: fullKit, answers: unsafe } });
  ok(r.status === 200 && !r.json?.result?.passed && r.json?.result?.criticalMisses?.length === 1, "running the generator in the garage is a critical error");
  ok((await sv.req("/api/survival/survival-72/complete", { method: "POST", body: { kit: fullKit, answers: bestFor(fullKit).slice(0, 5) } })).status === 400, "a run can't stop early while the family is fine");
  const pt = new Client();
  r = await pt.req("/api/survival/survival-72/complete", { method: "POST", body: { kit: [], answers: bestFor([]).map((i, k) => i >= 0 ? i : m.turns[k].choices.findIndex((c) => c.outcome !== "unsafe" && !isLocked(c, []))).slice(0, 10) } });
  ok(r.status === 200 && !r.json?.result?.survived && r.json?.result?.hoursSurvived < 72, "with an empty kit the family runs out of water and needs help before 72 hours");
}

// ---------- Step 17: Pi edition (pi.buildthebunker.com; 127.0.0.1 stands in for it here) ----------
{
  const PI = BASE.replace("localhost", "127.0.0.1");
  const seed = (p) => fetch("http://localhost:3999/__seed", { method: "POST", body: JSON.stringify(p) });
  const main = await new Client().req("/");
  const piHome = await new Client(PI).req("/");
  ok(main.headers.get("x-frame-options") === "DENY" && !main.text.includes("pi-sdk.js"), "main site can't be framed and doesn't load the Pi SDK");
  ok(!piHome.headers.get("x-frame-options") && /frame-ancestors[^;]*minepi\.com[^;]*pinet\.com/.test(piHome.headers.get("content-security-policy") ?? "") && piHome.text.includes("sdk.minepi.com/pi-sdk.js"),
    "Pi edition loads the Pi SDK and may be framed only by Pi's sites");
  ok((await new Client().req("/api/auth/pi", { method: "POST", body: { accessToken: "pi-good-u1" } })).status === 404, "Pi sign-in is off on the main site");
  r = await new Client(PI).req("/validation-key.txt");
  ok(r.status === 200 && r.text === "test-validation-key", "Pi domain-verification file is served on the Pi edition");
  ok((await new Client().req("/validation-key.txt")).status === 404, "no Pi verification file on the main site");

  const pc = new Client(PI);
  await pc.req("/api/rooms/water/complete", { method: "POST", body: { answers: perfect(water) } });
  const medicalRoom = ROOMS.find((x) => x.id === "medical");
  await pc.req("/api/rooms/medical/complete", { method: "POST", body: { answers: perfect(medicalRoom) } });
  const guestId = sql(`select \\"id\\" from \\"Player\\" order by \\"createdAt\\" desc limit 1`).trim();
  ok((await pc.req("/api/auth/pi", { method: "POST", body: { accessToken: "forged" } })).status === 401, "Pi sign-in rejects a token Pi doesn't confirm");
  r = await pc.req("/api/auth/pi", { method: "POST", body: { accessToken: "pi-good-u1" } });
  ok(r.status === 200 && r.json?.username === "pioneer_u1", "Pi sign-in works with a token Pi confirms");
  ok(/SameSite=None/i.test(pc.lastSetCookie) && /Partitioned/i.test(pc.lastSetCookie) && /Secure/i.test(pc.lastSetCookie), "Pi session cookie works inside Pi's frame (SameSite=None; Secure; Partitioned)");
  ok(sql(`select \\"id\\" from \\"Player\\" where \\"piUid\\" = 'u1'`).trim() === guestId, "signing in with Pi keeps this device's guest progress");
  await new Client(PI).req("/api/auth/pi", { method: "POST", body: { accessToken: "pi-good-u1" } });
  ok(sql(`select count(*) from \\"Player\\" where \\"piUid\\" = 'u1'`).trim() === "1", "signing in again doesn't create a second player");
  r = await pc.req("/room/security");
  ok(r.status === 307 && r.location?.endsWith("/upgrade"), "Pi edition: room 3 needs the Bunker Pass");
  {
    const g = new Client(PI);
    ok((await g.req("/api/auth/register", { method: "POST", body: { email: "pi-x@example.com", password: "longpassword1" } })).status === 404, "Pi edition: email sign-up is off (Pi sign-in only)");
    ok((await g.req("/api/auth/login", { method: "POST", body: { email: "pi-x@example.com", password: "longpassword1" } })).status === 404, "Pi edition: email login is off");
    ok((await g.req("/account")).status === 307, "Pi edition: the email account page redirects home");
  }
  ok((await pc.req("/api/billing/checkout", { method: "POST", body: {} })).status === 404, "no Stripe checkout in the Pi edition");
  r = await pc.req("/upgrade");
  ok(r.text.includes("Get the Bunker Pass · 4 π / 30 days") && r.text.includes("Support THE BUNKER with 1 π"), "Pi upgrade page sells the 4 π Bunker Pass and optional support");

  await seed({ identifier: "pay_pass_001", user_uid: "u1", amount: 4, metadata: { kind: "pass30" } });
  await seed({ identifier: "pay_pass_cheap", user_uid: "u1", amount: 1, metadata: { kind: "pass30" } });
  ok((await pc.req("/api/pi/payments", { method: "POST", body: { action: "approve", paymentId: "pay_pass_cheap" } })).status === 400, "a Bunker Pass for less than 4 π is refused");
  ok((await pc.req("/api/pi/payments", { method: "POST", body: { action: "approve", paymentId: "pay_pass_001" } })).status === 200, "Bunker Pass payment approved");
  ok((await pc.req("/api/pi/payments", { method: "POST", body: { action: "complete", paymentId: "pay_pass_001", txid: "tx_pass" } })).status === 200, "Bunker Pass payment completed");
  const days = () => Number(sql(`select round(extract(epoch from (\\"piPassUntil\\" - now())) / 86400) from \\"Player\\" where \\"piUid\\" = 'u1'`));
  ok(days() === 30, "Bunker Pass runs for 30 days");
  await pc.req("/api/pi/payments", { method: "POST", body: { action: "complete", paymentId: "pay_pass_001", txid: "tx_pass" } });
  ok(days() === 30, "completing the same payment twice doesn't add days");
  ok((await pc.req("/room/security")).status === 200, "with the Bunker Pass, room 3 opens");
  r = await pc.req("/upgrade");
  ok(r.text.includes("Your Bunker Pass is active until") && r.text.includes("Add 30 more days · 4 π"), "upgrade page shows the pass end date and renewal");

  await seed({ identifier: "pay_test_001", user_uid: "u1", amount: 1, metadata: { kind: "supporter" } });
  await seed({ identifier: "pay_test_002", user_uid: "u2", amount: 1, metadata: { kind: "supporter" } });
  await seed({ identifier: "pay_test_003", user_uid: "u1", amount: 5, metadata: { kind: "supporter" } });
  ok((await pc.req("/api/pi/payments", { method: "POST", body: { action: "approve", paymentId: "pay_test_002" } })).status === 403, "can't approve another Pioneer's payment");
  ok((await pc.req("/api/pi/payments", { method: "POST", body: { action: "approve", paymentId: "pay_test_003" } })).status === 400, "payment for the wrong amount is refused");
  ok((await new Client(PI).req("/api/pi/payments", { method: "POST", body: { action: "approve", paymentId: "pay_test_001" } })).status === 401, "approving needs Pi sign-in");
  r = await pc.req("/api/pi/payments", { method: "POST", body: { action: "approve", paymentId: "pay_test_001" } });
  ok(r.status === 200, "own supporter payment is approved");
  r = await pc.req("/api/pi/payments", { method: "POST", body: { action: "complete", paymentId: "pay_test_001", txid: "tx_abc" } });
  ok(r.status === 200 && sql(`select \\"status\\" from \\"PiPayment\\" where \\"paymentId\\" = 'pay_test_001'`).trim() === "completed"
    && sql(`select count(*) from \\"Player\\" where \\"piUid\\" = 'u1' and \\"piSupporterAt\\" is not null`).trim() === "1", "completed payment is recorded and gives the supporter badge");
  ok((await pc.req("/upgrade")).text.includes("Thank you for supporting"), "supporters are thanked");
  await seed({ identifier: "pay_test_004", user_uid: "u1", amount: 1, metadata: { kind: "supporter" }, transaction: { txid: "tx_4" } });
  await seed({ identifier: "pay_test_005", user_uid: "u1", amount: 1, metadata: { kind: "supporter" } });
  r = await new Client(PI).req("/api/pi/payments", { method: "POST", body: { action: "recover", paymentId: "pay_test_004" } });
  ok(r.json?.state === "completed", "an interrupted payment that was paid is completed at the next sign-in");
  r = await new Client(PI).req("/api/pi/payments", { method: "POST", body: { action: "recover", paymentId: "pay_test_005" } });
  ok(r.json?.state === "cancelled", "an interrupted unpaid payment is cancelled so it can't block the Pioneer");
}

console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);

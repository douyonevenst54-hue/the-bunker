// Real-browser smoke test of the scenario screen (needs a player who passed all rooms; uses the API to get there).
import { chromium } from "playwright";
const BASE = process.env.BASE || "http://localhost:3000";
let failures = 0;
const ok = (c, m) => { console.log(`${c ? "PASS" : "FAIL"}  [ui] ${m}`); if (!c) failures++; };
const { ROOMS } = await import("../.test-build/rooms.mjs");
const best = (S) => S.kind === "place" ? S.items.map((it) => S.zones.findIndex((z) => it.ok.includes(z.id))) : S.qs.map((q) => q.a);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
await page.goto(BASE + "/");
for (const room of ROOMS) {
  await page.evaluate(async ([id, answers]) => { await fetch(`/api/rooms/${id}/complete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers }) }); },
    [room.id, { sort: room.items.map((i) => i.b), stages: Object.fromEntries(room.stages.map((S) => [S.key, best(S)])) }]);
}
await page.goto(BASE + "/");
await page.locator('a[href="/scenario/power-outage"]').click();
await page.getByRole("button", { name: "Start mission" }).click();
for (let i = 0; i < 10; i++) {
  await page.locator(".opt").first().click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
}
ok(await page.locator(".timeline .tl").count() === 10, "scenario plays through 10 events to the debrief");
await page.waitForSelector("text=Progress saved", { timeout: 10000 }).catch(() => {});
ok((await page.content()).includes("Progress saved"), "scenario result saved");
await browser.close();
console.log(failures ? `\n${failures} UI FAILED` : "\nUI SCENARIO PASSED");
process.exit(failures ? 1 : 0);

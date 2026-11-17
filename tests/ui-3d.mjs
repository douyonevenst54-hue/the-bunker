// Real-browser test of the 3D rooms: plays Water, then follows "Next room" into the 3D Medical room,
// using the on-screen controls; checks the canvas renders and results save like the 2D game.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const BASE = process.env.BASE || "http://localhost:3000";
let failures = 0;
const ok = (c, m) => { console.log(`${c ? "PASS" : "FAIL"}  [3d] ${m}`); if (!c) failures++; };
const { ROOMS } = await import("../.test-build/rooms.mjs");

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

async function play(room) {
  await page.getByRole("button", { name: "Enter the bunker" }).waitFor({ timeout: 30000 });
  ok(await page.locator(".b3-canvas canvas").count() === 1, `${room.id}: 3D canvas mounted`);
  await page.waitForTimeout(1200);
  const shot = await page.screenshot();
  writeFileSync(`/tmp/3d-${room.id}-outside.png`, shot);
  ok(shot.length > 20000, `${room.id}: outside view renders (${shot.length} bytes)`);
  await page.getByRole("button", { name: "Enter the bunker" }).click();
  ok(await page.locator(".b3-hint").count() === 1, `${room.id}: first-person hint bar shown`);
  await page.getByRole("button", { name: /Open the door/ }).click();
  await page.getByRole("button", { name: /Enter the room/ }).click({ timeout: 30000 });
  await page.getByRole("button", { name: /Inspect the next supply/ }).waitFor({ timeout: 30000 });
  await page.waitForTimeout(1200);
  writeFileSync(`/tmp/3d-${room.id}-room.png`, await page.screenshot());
  for (let n = 0; n < room.items.length; n++) {
    await page.getByRole("button", { name: /Inspect the next supply/ }).click();
    const name = (await page.locator(".b3-panel h2").innerText({ timeout: 30000 })).trim();
    if (n === 0) {
      const viewer = await page.locator(".b3-inspect canvas").count();
      ok(room.id !== "security" || viewer === 1, `${room.id}: inspect panel ${viewer ? "shows the 3D object viewer" : "(crate room)"}`);
      // the inspect sheet can be hidden and shown again
      await page.getByRole("button", { name: /Hide/ }).click();
      await page.locator(".b3-tab").click();
    }
    const item = room.items.find((it) => name.endsWith(it.en[0]));
    await page.locator(".b3-panel .bin").nth({ u: 0, s: 1, a: 2 }[item.b]).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();
  }
  ok(true, `${room.id}: sorted all ${room.items.length} supplies`);
  if (room.id === "security") {
    await page.getByRole("button", { name: "Pause" }).click();
    ok(await page.getByRole("button", { name: "Resume" }).count() === 1, "security: pause menu opens");
    await page.getByRole("button", { name: "Resume" }).click();
  }
  for (const S of room.stages) {
    if (S.kind === "place") {
      await page.waitForTimeout(800);
      writeFileSync(`/tmp/3d-${room.id}-place.png`, await page.screenshot());
      for (const it of S.items) {
        await page.locator(".tray-item", { hasText: it.name.en }).click();
        const zone = S.zones.find((z) => it.ok.includes(z.id));
        await page.locator(".b3-zone", { hasText: zone.label.en }).click();
      }
      await page.getByRole("button", { name: "Next", exact: true }).click();
    } else {
      const open = page.getByRole("button", { name: /Open the terminal/ });
      if (await open.count()) await open.click();
      for (const q of S.qs) {
        await page.locator(".b3-panel .opt", { hasText: q.en.o[q.a] }).first().click({ timeout: 30000 });
        await page.getByRole("button", { name: "Next", exact: true }).click();
      }
    }
  }
  await page.waitForSelector("text=Progress saved", { timeout: 15000 }).catch(() => {});
  const html = await page.content();
  ok(html.includes("Progress saved"), `${room.id}: 3D result saved to the account`);
  ok(html.includes("100<small>/100</small>"), `${room.id}: perfect 3D run scores 100`);
}

await page.goto(BASE + "/room/water");
const cta = page.getByRole("link", { name: /Play in 3D/ });
ok(await cta.count() === 1, "2D Water room offers 'Play in 3D'");
await cta.click();
await page.waitForURL("**/room/water/3d");
await play(ROOMS.find((r) => r.id === "water"));

ok(errors.length === 0, "water: no page errors during the 3D run" + (errors.length ? ": " + errors.join(" | ") : ""));
// "Next room" from the 3D Water room leads to the 3D Medical room
await page.getByRole("link", { name: /Next room/ }).click();
await page.waitForURL("**/room/medical/3d");
ok(true, "Next room → 3D Medical room");
await play(ROOMS.find((r) => r.id === "medical"));
// Rooms 3–6 are for members: the admin account (a member, all rooms passed in e2e.mjs) plays them in 3D
await page.goto(BASE + "/");
await page.evaluate(async () => { await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "admin@example.com", password: "adminpass1" }) }); });
for (const id of ["security", "food", "air", "energy"]) {
  await page.goto(BASE + `/room/${id}/3d`);
  await play(ROOMS.find((r) => r.id === id));
}
// drawn icons load
const icon = await page.request.get(BASE + "/icons/water-bottle.svg");
ok(icon.status() === 200 && (await icon.text()).includes("<svg"), "custom icons are served");
ok(errors.length === 0, "no page errors" + (errors.length ? ": " + errors.join(" | ") : ""));
await browser.close();
console.log(failures ? `\n${failures} 3D FAILED` : "\n3D PASSED");
process.exit(failures ? 1 : 0);

// Real-browser test of the drag-and-drop placement board (Playwright, phone-sized screen).
// Usage: BASE=http://localhost:3000 node tests/ui-place.mjs
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:3000";
let failures = 0;
const ok = (c, m) => { console.log(`${c ? "PASS" : "FAIL"}  [ui] ${m}`); if (!c) failures++; };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
await page.goto(BASE + "/room/water");
await page.getByRole("button", { name: "Start mission" }).click();

// Stage 1: sort 12 items (answers don't matter here)
for (let i = 0; i < 12; i++) {
  await page.locator(".bin").first().click();
  await page.getByRole("button", { name: "Next" }).click();
}
ok(await page.locator(".place-plan").isVisible(), "placement board appears after Stage 1");
ok((await page.locator(".tray-item").count()) === 4, "tray shows 4 items to place");

// 1) Tap an item, then tap a spot
await page.locator(".tray-item", { hasText: "Water jugs" }).tap();
ok(await page.locator(".place-plan.armed").isVisible(), "tapping an item highlights the spots");
await page.locator('[data-zone="0"]').tap();
ok((await page.locator(".fb strong").innerText()).includes("Correct"), "tap-to-place: jugs on the cool dark shelf is Correct");
ok((await page.locator(".tray-item").count()) === 3, "placed item leaves the tray");

// 2) Real drag with the mouse: bleach into the kids' corner (unsafe)
const src = await page.locator(".tray-item", { hasText: "Bleach" }).boundingBox();
const dst = await page.locator('[data-zone="5"] rect').first().boundingBox();
await page.mouse.move(src.x + src.width / 2, src.y + src.height / 2);
await page.mouse.down();
await page.mouse.move(src.x + 40, src.y - 40, { steps: 5 });
ok(await page.locator(".drag-ghost").isVisible(), "dragging shows the item under the pointer");
await page.mouse.move(dst.x + dst.width / 2, dst.y + dst.height / 2, { steps: 10 });
await page.mouse.up();
const fb = await page.locator(".fb strong").innerText();
ok(fb.includes("Unsafe") && fb.includes("Bleach"), "drag-and-drop: bleach in kids' corner is flagged Unsafe");
ok((await page.locator(".fb .best").innerText()).includes("High locked cabinet"), "unsafe feedback shows the best spot");

// 3) Keyboard: Enter on an item, then Enter on a spot
await page.locator(".tray-item", { hasText: "Pot" }).focus();
await page.keyboard.press("Enter");
await page.locator('[data-zone="3"]').focus();
await page.keyboard.press("Enter");
ok((await page.locator(".fb strong").innerText()).includes("Not quite"), "keyboard placement works (pot on window ledge: Not quite)");

await page.locator(".tray-item").first().tap();
await page.locator('[data-zone="2"]').tap();
ok(await page.getByRole("button", { name: "Next" }).isVisible(), "Next appears when every item is placed");
await page.getByRole("button", { name: "Next" }).click();
ok((await page.locator(".stage").first().innerText()).toUpperCase().includes("STAGE 3"), "moves on to Stage 3");

// Kreyòl
await page.goto(BASE + "/room/medical/review");
await page.getByRole("button", { name: "KREYÒL" }).click();
await page.waitForTimeout(800);
ok((await page.content()).includes("Kabinè wo, lwen men timoun"), "review page shows placement zones in Kreyòl");

await browser.close();
console.log(failures ? `\n${failures} UI FAILED` : "\nUI ALL PASSED");
process.exit(failures ? 1 : 0);

import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const B = "http://localhost:3000";
await p.goto(B + "/survival"); await p.screenshot({ path: "/tmp/s1.jpg", type: "jpeg", quality: 55, fullPage: true });
await p.getByRole("button", { name: /Pack my kit/ }).click();
for (const n of ["15 gallons", "3 days of canned", "Manual can", "Flashlights", "Battery or hand", "Grandma", "Baby formula"]) await p.getByRole("button", { name: new RegExp(n) }).click();
await p.screenshot({ path: "/tmp/s2.jpg", type: "jpeg", quality: 55, fullPage: true });
await p.getByRole("button", { name: /Start the 72/ }).click();
for (let i = 0; i < 3; i++) { await p.locator(".opt:not([disabled])").first().click(); await p.getByRole("button", { name: /6 hours pass/ }).click(); }
await p.screenshot({ path: "/tmp/s3.jpg", type: "jpeg", quality: 55, fullPage: true });
for (let i = 3; i < 12; i++) { await p.locator(".opt:not([disabled])").first().click(); await p.getByRole("button", { name: /6 hours pass|See how/ }).click(); if (await p.locator(".score").count()) break; }
await p.waitForTimeout(1500);
await p.screenshot({ path: "/tmp/s4.jpg", type: "jpeg", quality: 50, fullPage: true });
await b.close();

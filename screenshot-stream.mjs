import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3099", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

// Capture hero area at two different moments to see movement
await page.screenshot({ path: "stream-t0.png", clip: { x: 0, y: 0, width: 1440, height: 900 } });
await page.waitForTimeout(3000);
await page.screenshot({ path: "stream-t3.png", clip: { x: 0, y: 0, width: 1440, height: 900 } });

await browser.close();
console.log("Stream screenshots saved.");

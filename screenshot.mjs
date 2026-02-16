import { chromium } from "playwright";

const browser = await chromium.launch();

async function capture(name, width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto("http://localhost:3099", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Scroll through the page to trigger IntersectionObservers
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < scrollHeight; y += height / 2) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(200);
  }

  // Scroll back to top and wait for all animations
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  await page.screenshot({ path: name, fullPage: true });
  await page.close();
}

await capture("screenshot-desktop.png", 1440, 900);
await capture("screenshot-mobile.png", 390, 844);

await browser.close();
console.log("Screenshots saved.");

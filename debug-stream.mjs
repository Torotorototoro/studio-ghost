import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3099", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

// 1. Check if stream keyframes now exist
const keyframes = await page.evaluate(() => {
  const found = [];
  function scan(rules, depth = 0) {
    for (const rule of rules) {
      if (rule.type === CSSRule.KEYFRAMES_RULE) {
        found.push({ name: rule.name, depth });
      }
      if (rule.cssRules) scan(rule.cssRules, depth + 1);
    }
  }
  for (const sheet of document.styleSheets) {
    try { scan(sheet.cssRules); } catch (e) {}
  }
  return found;
});
console.log("All keyframes:", JSON.stringify(keyframes.map(k => k.name)));

// 2. Check animation state on a lane
const laneState = await page.evaluate(() => {
  const hero = document.getElementById('hero');
  const allEls = hero?.querySelectorAll('*') || [];
  for (const el of allEls) {
    const s = el.getAttribute('style') || '';
    if (s.includes('stream')) {
      const anims = el.getAnimations();
      return {
        inlineStyle: s.substring(0, 150),
        animCount: anims.length,
        anims: anims.map(a => ({ name: a.animationName, state: a.playState, time: a.currentTime })),
        transform: getComputedStyle(el).transform,
        rect: { x: Math.round(el.getBoundingClientRect().x) },
      };
    }
  }
  return null;
});
console.log("Lane state:", JSON.stringify(laneState, null, 2));

// 3. Position change test
const p0 = await page.evaluate(() => {
  const hero = document.getElementById('hero');
  for (const el of hero?.querySelectorAll('*') || []) {
    if (el.getAttribute('style')?.includes('stream')) {
      return { x: el.getBoundingClientRect().x, transform: getComputedStyle(el).transform };
    }
  }
  return null;
});
console.log("\nt=0:", JSON.stringify(p0));

await page.waitForTimeout(3000);

const p3 = await page.evaluate(() => {
  const hero = document.getElementById('hero');
  for (const el of hero?.querySelectorAll('*') || []) {
    if (el.getAttribute('style')?.includes('stream')) {
      return { x: el.getBoundingClientRect().x, transform: getComputedStyle(el).transform };
    }
  }
  return null;
});
console.log("t=3:", JSON.stringify(p3));

const moved = p0 && p3 && p0.x !== p3.x;
console.log(`\nText moving: ${moved ? "YES ✓" : "NO ✗"}`);

await browser.close();

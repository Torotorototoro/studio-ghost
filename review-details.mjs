import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3099", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

// Check backdrop-filter on glass cards and liquid lenses
const bdCheck = await page.evaluate(() => {
  const card = document.querySelector('.glass-card');
  const lens = document.querySelector('.liquid-lens');
  const check = (el, name) => {
    if (!el) return { name, found: false };
    const s = getComputedStyle(el);
    return {
      name,
      backdropFilter: s.backdropFilter,
      webkitBackdropFilter: s.webkitBackdropFilter,
      filter: s.filter,
      // Check the raw CSS class for backdrop-filter presence
      matchedRules: [],
    };
  };
  return [check(card, 'glass-card'), check(lens, 'liquid-lens')];
});
console.log("Backdrop-filter check:");
console.log(JSON.stringify(bdCheck, null, 2));

// Check Perlin noise canvas in more detail — sample more broadly
const canvasCheck = await page.evaluate(() => {
  const canvases = document.querySelectorAll('canvas');
  const results = [];
  for (const canvas of canvases) {
    const rect = canvas.getBoundingClientRect();
    // Check if this canvas is in the hero section
    const inHero = canvas.closest('#hero') !== null;
    const ctx = canvas.getContext('2d');
    if (!ctx) { results.push({ inHero, noCtx: true }); continue; }

    // Sample from the center of the canvas
    const cx = Math.floor(canvas.width / 2);
    const cy = Math.floor(Math.min(canvas.height, 900) / 2);
    const sampleSize = 200;
    try {
      const imageData = ctx.getImageData(
        Math.max(0, cx - sampleSize/2),
        Math.max(0, cy - sampleSize/2),
        sampleSize, sampleSize
      );
      let nonBlack = 0;
      let totalAlpha = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > 5 || imageData.data[i+1] > 5 || imageData.data[i+2] > 5) {
          nonBlack++;
        }
        totalAlpha += imageData.data[i+3];
      }
      results.push({
        inHero,
        canvasW: canvas.width,
        canvasH: canvas.height,
        sampleCenter: `${cx},${cy}`,
        nonBlackPixels: nonBlack,
        totalSampled: sampleSize * sampleSize,
        avgAlpha: Math.round(totalAlpha / (sampleSize * sampleSize)),
      });
    } catch (e) {
      results.push({ inHero, error: e.message });
    }
  }
  return results;
});
console.log("\nPerlin noise canvas detail:");
console.log(JSON.stringify(canvasCheck, null, 2));

// Check that glitch-chromatic on "STUDIO" actually has visible effect
const glitchDetail = await page.evaluate(() => {
  // Find all glitch elements and check their text content
  const chromatic = document.querySelectorAll('.glitch-chromatic');
  const text = document.querySelectorAll('.glitch-text');
  return {
    chromaticElements: Array.from(chromatic).map(el => ({
      text: el.textContent?.substring(0, 30),
      animName: getComputedStyle(el).animationName,
      animRunning: el.getAnimations().some(a => a.playState === 'running'),
    })),
    glitchTextElements: Array.from(text).map(el => ({
      text: el.textContent?.substring(0, 30),
      animName: getComputedStyle(el).animationName,
      animRunning: el.getAnimations().some(a => a.playState === 'running'),
    })),
  };
});
console.log("\nGlitch detail:");
console.log(JSON.stringify(glitchDetail, null, 2));

await browser.close();

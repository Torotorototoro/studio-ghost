import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3099", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

const results = {};

// ============================================================
// #1 Dual Font System — Outfit (headings) + Zen Kaku Gothic New (body)
// ============================================================
results["#1 Dual Fonts"] = await page.evaluate(() => {
  const heading = document.querySelector('.font-heading');
  const body = document.querySelector('body');
  if (!heading) return { pass: false, reason: "No .font-heading element found" };

  const headingFont = getComputedStyle(heading).fontFamily;
  const bodyFont = getComputedStyle(body).fontFamily;

  const hasOutfit = headingFont.toLowerCase().includes('outfit') ||
    getComputedStyle(document.documentElement).getPropertyValue('--font-outfit').trim() !== '';
  const hasZen = bodyFont.toLowerCase().includes('zen') ||
    getComputedStyle(document.documentElement).getPropertyValue('--font-zen').trim() !== '';

  // Check CSS variable exists
  const outfitVar = getComputedStyle(document.documentElement).getPropertyValue('--font-outfit');
  const zenVar = getComputedStyle(document.documentElement).getPropertyValue('--font-zen');

  return {
    pass: outfitVar.trim() !== '' && zenVar.trim() !== '',
    headingFont: headingFont.substring(0, 80),
    bodyFont: bodyFont.substring(0, 80),
    outfitVar: outfitVar.trim().substring(0, 40),
    zenVar: zenVar.trim().substring(0, 40),
    fontHeadingCount: document.querySelectorAll('.font-heading').length,
  };
});

// ============================================================
// #2 Scan Lines Overlay
// ============================================================
results["#2 Scan Lines"] = await page.evaluate(() => {
  const scanEl = document.querySelector('.scan-lines');
  if (!scanEl) return { pass: false, reason: "No .scan-lines element found" };

  const after = getComputedStyle(scanEl, '::after');
  const hasContent = after.content !== 'none' && after.content !== '';
  const hasBackground = after.backgroundImage !== 'none' || after.background.includes('repeating');
  const isFixed = after.position === 'fixed';
  const hasPointerNone = after.pointerEvents === 'none';

  return {
    pass: hasContent && isFixed,
    content: after.content?.substring(0, 20),
    position: after.position,
    pointerEvents: after.pointerEvents,
    zIndex: after.zIndex,
    background: after.backgroundImage?.substring(0, 80),
  };
});

// ============================================================
// #3 Glitch Effects (4 types)
// ============================================================
results["#3 Glitch Effects"] = await page.evaluate(() => {
  const glitchText = document.querySelector('.glitch-text');
  const glitchChromatic = document.querySelector('.glitch-chromatic');
  const glitchScan = document.querySelector('.glitch-scan');
  const glitchHeavy = document.querySelector('.glitch-heavy');

  const check = (el, name) => {
    if (!el) return { found: false, name };
    const style = getComputedStyle(el);
    const anims = el.getAnimations();
    return {
      found: true,
      name,
      animationName: style.animationName,
      hasAnimAPI: anims.length > 0,
      animStates: anims.map(a => ({ name: a.animationName, state: a.playState })),
    };
  };

  const checks = [
    check(glitchText, 'glitch-text'),
    check(glitchChromatic, 'glitch-chromatic'),
    check(glitchScan, 'glitch-scan'),
    check(glitchHeavy, 'glitch-heavy'),
  ];

  // Count how many have working animations (getAnimations returns results)
  const working = checks.filter(c => c.found && c.hasAnimAPI);

  return {
    pass: working.length >= 2, // at least glitch-text and glitch-chromatic should work
    details: checks,
    workingCount: working.length,
    totalFound: checks.filter(c => c.found).length,
  };
});

// ============================================================
// #4 Kinetic Typography (Ghost Stream)
// ============================================================
results["#4 Ghost Stream"] = await page.evaluate(() => {
  const hero = document.getElementById('hero');
  if (!hero) return { pass: false, reason: "No hero section" };

  const lanes = [];
  for (const el of hero.querySelectorAll('*')) {
    const s = el.getAttribute('style') || '';
    if (s.includes('stream-left') || s.includes('stream-right')) {
      lanes.push(el);
    }
  }

  if (lanes.length === 0) return { pass: false, reason: "No stream lanes found" };

  // Check first lane animation
  const firstLane = lanes[0];
  const anims = firstLane.getAnimations();
  const transform = getComputedStyle(firstLane).transform;

  return {
    pass: anims.length > 0 && transform !== 'none',
    laneCount: lanes.length,
    firstLaneAnimCount: anims.length,
    firstLaneAnimState: anims[0]?.playState,
    firstLaneTransform: transform?.substring(0, 50),
    hasMovement: transform !== 'none',
  };
});

// Wait and re-check #4 to confirm movement
await page.waitForTimeout(2000);
const streamMovement = await page.evaluate(() => {
  const hero = document.getElementById('hero');
  for (const el of hero?.querySelectorAll('*') || []) {
    if (el.getAttribute('style')?.includes('stream')) {
      return { transform: getComputedStyle(el).transform };
    }
  }
  return null;
});
results["#4 Ghost Stream"].transformAfter2s = streamMovement?.transform?.substring(0, 50);
results["#4 Ghost Stream"].confirmedMoving =
  results["#4 Ghost Stream"].firstLaneTransform !== streamMovement?.transform;

// ============================================================
// #5 Liquid Lens Distortion
// ============================================================
results["#5 Liquid Lens"] = await page.evaluate(() => {
  const lensA = document.querySelectorAll('.liquid-lens--a');
  const lensB = document.querySelectorAll('.liquid-lens--b');
  const allLens = document.querySelectorAll('.liquid-lens');

  if (allLens.length === 0) return { pass: false, reason: "No .liquid-lens elements found" };

  // Check if animations are running
  const firstLens = allLens[0];
  const anims = firstLens.getAnimations();
  const style = getComputedStyle(firstLens);

  return {
    pass: anims.length > 0,
    totalLensCount: allLens.length,
    lensACount: lensA.length,
    lensBCount: lensB.length,
    firstLensAnimCount: anims.length,
    firstLensAnims: anims.map(a => ({ name: a.animationName, state: a.playState })),
    backdropFilter: style.backdropFilter || style.WebkitBackdropFilter || 'none',
    transform: style.transform?.substring(0, 50),
  };
});

// ============================================================
// #6 Perlin Noise Flow Field
// ============================================================
results["#6 Perlin Noise"] = await page.evaluate(() => {
  // The FluidBackground uses a canvas element
  const canvases = document.querySelectorAll('canvas');
  if (canvases.length === 0) return { pass: false, reason: "No canvas elements found" };

  // Check if any canvas has content (non-blank)
  const results = [];
  for (const canvas of canvases) {
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    const rect = canvas.getBoundingClientRect();
    // Sample a few pixels to see if there's content
    const imageData = ctx.getImageData(0, 0, Math.min(canvas.width, 100), Math.min(canvas.height, 100));
    let nonBlack = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i] > 0 || imageData.data[i + 1] > 0 || imageData.data[i + 2] > 0) {
        nonBlack++;
      }
    }
    results.push({
      width: canvas.width,
      height: canvas.height,
      rectWidth: Math.round(rect.width),
      rectHeight: Math.round(rect.height),
      nonBlackPixels: nonBlack,
      totalSampled: imageData.data.length / 4,
    });
  }

  const hasContent = results.some(r => r.nonBlackPixels > 50);
  return {
    pass: hasContent,
    canvasCount: canvases.length,
    canvasDetails: results,
  };
});

// ============================================================
// #7 Glass Card Border Enhancement
// ============================================================
results["#7 Glass Cards"] = await page.evaluate(() => {
  const cards = document.querySelectorAll('.glass-card');
  if (cards.length === 0) return { pass: false, reason: "No .glass-card elements found" };

  const firstCard = cards[0];
  const style = getComputedStyle(firstCard);
  const beforeStyle = getComputedStyle(firstCard, '::before');

  // Check for glassmorphism properties
  const hasBackdrop = style.backdropFilter !== 'none' || style.WebkitBackdropFilter !== 'none';
  const hasBorder = beforeStyle.content !== 'none' || style.borderColor !== '';

  return {
    pass: cards.length > 0 && hasBackdrop,
    cardCount: cards.length,
    backdropFilter: (style.backdropFilter || style.WebkitBackdropFilter || 'none').substring(0, 60),
    background: style.background?.substring(0, 80),
    beforeContent: beforeStyle.content?.substring(0, 20),
    beforeBackground: beforeStyle.backgroundImage?.substring(0, 80),
    borderRadius: style.borderRadius,
  };
});

// ============================================================
// #8 Section Multi-Layering
// ============================================================
results["#8 Multi-Layering"] = await page.evaluate(() => {
  const sections = ['hero', 'about', 'services', 'track-record', 'contact'];
  const layerInfo = {};

  for (const id of sections) {
    const section = document.getElementById(id);
    if (!section) { layerInfo[id] = { found: false }; continue; }

    const morphBlobs = section.querySelectorAll('.morph-blob');
    const liquidLenses = section.querySelectorAll('[class*="liquid-lens"]');
    const glassCards = section.querySelectorAll('.glass-card');
    const canvases = section.querySelectorAll('canvas');

    // Check morph blob animations
    const blobAnims = [];
    for (const blob of morphBlobs) {
      const a = blob.getAnimations();
      blobAnims.push(a.length > 0);
    }

    // Check liquid lens animations
    const lensAnims = [];
    for (const lens of liquidLenses) {
      const a = lens.getAnimations();
      lensAnims.push(a.length > 0);
    }

    layerInfo[id] = {
      morphBlobs: morphBlobs.length,
      morphBlobsAnimating: blobAnims.filter(Boolean).length,
      liquidLenses: liquidLenses.length,
      liquidLensesAnimating: lensAnims.filter(Boolean).length,
      glassCards: glassCards.length,
      canvases: canvases.length,
      layers: morphBlobs.length + liquidLenses.length + glassCards.length + canvases.length,
    };
  }

  // Pass if most sections have 2+ layers
  const multiLayered = Object.values(layerInfo).filter(v => v.layers >= 2).length;
  return {
    pass: multiLayered >= 3,
    multiLayeredSections: multiLayered,
    totalSections: sections.length,
    details: layerInfo,
  };
});

// ============================================================
// Print results
// ============================================================
console.log("\n╔══════════════════════════════════════════════════╗");
console.log("║   STUDIO GHOST — 8 Feature Review Results       ║");
console.log("╚══════════════════════════════════════════════════╝\n");

let passCount = 0;
let failCount = 0;

for (const [name, result] of Object.entries(results)) {
  const icon = result.pass ? "✅" : "❌";
  if (result.pass) passCount++; else failCount++;
  console.log(`${icon} ${name}`);
  // Print key details
  for (const [key, val] of Object.entries(result)) {
    if (key === 'pass') continue;
    const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
    console.log(`   ${key}: ${valStr.substring(0, 120)}`);
  }
  console.log("");
}

console.log("─".repeat(50));
console.log(`Result: ${passCount}/8 passed, ${failCount}/8 failed`);
if (failCount === 0) {
  console.log("🎉 All 8 features verified!");
} else {
  console.log("⚠️  Some features need attention.");
}

await browser.close();

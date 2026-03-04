import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3099", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

// Check if .glass-card and .liquid-lens CSS rules contain backdrop-filter
const cssRuleCheck = await page.evaluate(() => {
  const targets = ['glass-card', 'liquid-lens', 'morph-blob', 'glitch-text', 'glitch-chromatic'];
  const results = {};

  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        // Check @layer rules too
        const checkRule = (r) => {
          if (r.selectorText) {
            for (const t of targets) {
              if (r.selectorText.includes(t)) {
                if (!results[t]) results[t] = [];
                results[t].push({
                  selector: r.selectorText,
                  cssText: r.cssText.substring(0, 300),
                  hasBackdropFilter: r.cssText.includes('backdrop-filter'),
                });
              }
            }
          }
          if (r.cssRules) {
            for (const inner of r.cssRules) checkRule(inner);
          }
        };
        checkRule(rule);
      }
    } catch (e) {}
  }
  return results;
});

for (const [name, rules] of Object.entries(cssRuleCheck)) {
  console.log(`\n=== .${name} ===`);
  for (const r of rules) {
    console.log(`  selector: ${r.selector}`);
    console.log(`  backdrop-filter: ${r.hasBackdropFilter ? "YES" : "NO"}`);
    console.log(`  css: ${r.cssText.substring(0, 200)}`);
  }
}

await browser.close();

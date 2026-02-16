import { test, expect } from "playwright/test";

test.describe("FluidCanvas", () => {
  test("page loads and hero section renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#hero")).toBeVisible();
    await expect(page.locator("h1").first()).toContainText("STUDIO");
  });

  test("canvas element is present in the hero", async ({ page }) => {
    await page.goto("/");

    // Either WebGPU canvas or fallback canvas should be present
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test("hero screenshot", async ({ page }) => {
    await page.goto("/");
    // Wait for animations to start
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "test-results/hero-screenshot.png", fullPage: false });
  });

  test("mouse interaction does not crash", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Move mouse around the hero area
    await page.mouse.move(400, 300);
    await page.mouse.move(600, 400);
    await page.mouse.move(200, 500);
    await page.waitForTimeout(1000);

    // Page should still be functional
    await expect(page.locator("#hero")).toBeVisible();
  });
});

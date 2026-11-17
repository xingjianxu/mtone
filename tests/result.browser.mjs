import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const server = await createServer({
  root: process.cwd(),
  optimizeDeps: { entries: ["tests/fixtures/result.html"] },
  server: { host: "127.0.0.1", port: 5204, strictPort: true },
  logLevel: "error",
});
await server.listen();
await mkdir("artifacts/result-browser", { recursive: true });
let failed = false;
try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
    ["webkit", webkit],
  ]) {
    let browser, page;
    try {
      browser = await engine.launch({ headless: true });
      page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("http://127.0.0.1:5204/tests/fixtures/result.html");
      await expect(page.getByText("Submission failed")).toBeVisible();
      await page.getByRole("button", { name: "Retry", exact: true }).focus();
      await page.keyboard.press("Enter");
      await expect(page.getByText("Completed")).toBeVisible();
      await page.getByRole("button", { name: "Reset", exact: true }).click();
      await expect(page.getByTestId("interactive")).toHaveAttribute(
        "data-status",
        "error",
      );
      await page.getByRole("link", { name: "Details" }).click();
      assert(page.url().endsWith("#details"));
      for (const width of [375, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
          `${name} page overflow at ${width}`,
        );
        const overflow = await page
          .locator(".mt-result")
          .evaluateAll((elements) =>
            elements.some((el) => el.scrollWidth > el.clientWidth + 1),
          );
        assert(!overflow, `${name} result content overflow at ${width}`);
      }
      await page.screenshot({
        path: `artifacts/result-browser/${name}.png`,
        fullPage: true,
      });
      assert.deepEqual(errors, []);
      console.log(`${name}: Result passed`);
    } catch (e) {
      failed = true;
      console.error(`${name}:`, e);
      if (page)
        await page
          .screenshot({
            path: `artifacts/result-browser/${name}-failure.png`,
            fullPage: true,
          })
          .catch(() => {});
    } finally {
      await browser?.close();
    }
  }
} finally {
  await server.close();
}
if (failed) process.exitCode = 1;

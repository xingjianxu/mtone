import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 5204, strictPort: true },
  logLevel: "error",
});
await server.listen();
await mkdir("artifacts/affix-browser", { recursive: true });
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
      await page.goto("http://127.0.0.1:5204/tests/fixtures/affix.html");
      const target = page.getByTestId("target"),
        root = page.getByTestId("container"),
        inner = root.locator(".mt-affix-content");
      await expect(inner).not.toHaveAttribute("data-affixed");
      const bottom = page.getByTestId("bottom").locator(".mt-affix-content");
      await expect(bottom).toHaveAttribute("data-affixed", "");
      await target.evaluate((el) => (el.scrollTop = 180));
      await expect(inner).toHaveAttribute("data-affixed", "");
      const check = async () => {
        await expect
          .poll(async () => {
            const b = await target.boundingBox(),
              c = await inner.boundingBox();
            return (
              Math.abs(c.y - (b.y + 3 + 8)) < 2 &&
              Math.abs(c.width - (await root.boundingBox()).width) < 2
            );
          })
          .toBe(true);
      };
      await check();
      const before = await root.boundingBox();
      await page.getByRole("button", { name: "Resize", exact: true }).click();
      await expect
        .poll(async () => (await root.boundingBox()).height)
        .toBeGreaterThan(before.height + 30);
      await page.evaluate(() => window.scrollTo(0, 200));
      await check();
      await expect(
        page.getByTestId("window").locator(".mt-affix-content"),
      ).toHaveCSS("top", "10px");
      await page.setViewportSize({ width: 375, height: 800 });
      await check();
      await target.evaluate((el) => (el.scrollTop = 0));
      await expect(inner).not.toHaveAttribute("data-affixed");
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(
        page.getByTestId("window").locator(".mt-affix-content"),
      ).not.toHaveAttribute("data-affixed");
      await target.evaluate((el) => (el.scrollTop = 1000));
      await expect(bottom).not.toHaveAttribute("data-affixed");
      assert.deepEqual(errors, []);
      await page.screenshot({
        path: `artifacts/affix-browser/${name}.png`,
        fullPage: true,
      });
      console.log(`${name}: Affix passed`);
    } catch (error) {
      failed = true;
      console.error(name, error);
      await page
        ?.screenshot({
          path: `artifacts/affix-browser/${name}-failure.png`,
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

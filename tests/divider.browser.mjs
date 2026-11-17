import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const server = await createServer({ root: process.cwd(), server: { host: "127.0.0.1", port: 5212, strictPort: true }, logLevel: "error" });
await server.listen();
await mkdir("artifacts/divider-browser", { recursive: true });
let failed = false;
try {
  for (const [name, engine] of [["chromium", chromium], ["firefox", firefox], ["webkit", webkit]]) {
    let browser;
    try {
      browser = await engine.launch({ headless: true });
      const page = await browser.newPage({ viewport: { width: 800, height: 650 } });
      await page.goto("http://127.0.0.1:5212/tests/fixtures/divider.html");
      for (const variant of ["solid", "dashed", "dotted"]) {
        await expect(page.getByTestId(variant)).toHaveCSS("border-top-style", variant);
      }
      await expect(page.getByTestId("small")).toHaveCSS("margin-top", "8px");
      await expect(page.getByTestId("large")).toHaveCSS("margin-top", "20px");
      await expect(page.getByTestId("vertical")).toHaveCSS("border-left-style", "dashed");
      const titleLine = await page.getByTestId("start").evaluate(el => ({
        before: getComputedStyle(el, "::before").borderTopStyle,
        after: getComputedStyle(el, "::after").borderTopStyle,
        alignment: getComputedStyle(el).alignItems
      }));
      assert.deepEqual(titleLine, {before: "dashed", after: "dashed", alignment: "center"});
      const bounds = await page.evaluate(() => ["start", "rtl"].map(id => {
        const root = document.querySelector('[data-testid="'+id+'"]').getBoundingClientRect();
        const title = document.querySelector('[data-testid="'+id+'"] span').getBoundingClientRect();
        return { left: title.left-root.left, right: root.right-title.right };
      }));
      assert(bounds[0].left < bounds[0].right);
      assert(bounds[1].right < bounds[1].left);
      for (const width of [375, 320]) {
        await page.setViewportSize({ width, height: 650 });
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      await page.screenshot({ path: 'artifacts/divider-browser/'+name+'.png', fullPage: true });
      console.log(name + " passed");
    } catch (error) { failed = true; console.error(name, error); }
    finally { await browser?.close(); }
  }
} finally { await server.close(); }
if (failed) process.exitCode = 1;

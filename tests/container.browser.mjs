import assert from "node:assert/strict";
import { chromium, expect, firefox, webkit } from "@playwright/test";
import { createServer } from "vite";

const server = await createServer({
  server: { host: "127.0.0.1", port: 5302, strictPort: true },
  logLevel: "error",
});
await server.listen();

let browser;
try {
  const engine = { chromium, firefox, webkit }[process.env.BROWSER || "chromium"];
  browser = await engine.launch({ executablePath: process.env.BROWSER_PATH });
  const page = await browser.newPage();
  for (const width of [1600, 375]) {
    await page.setViewportSize({ width, height: 720 });
    await page.goto("http://127.0.0.1:5302/tests/fixtures/container.html");
    for (const [id, cap, padding] of [
      ["default", 960, 16], ["small", 720, 16], ["large", 1200, 16],
      ["wide", 1440, 16], ["custom", 840, 24], ["fluid", Infinity, 0],
    ]) {
      const root = page.getByTestId(id);
      await expect(root).toBeVisible();
      const available = width - 40;
      const expected = Math.min(available, cap);
      const box = await root.boundingBox();
      assert.equal(box.width, expected, id);
      assert.equal(box.x, 20 + (available - expected) / 2, id);
      const actual = await root.evaluate((el) => {
        const style = getComputedStyle(el);
        return [style.paddingInlineStart, style.paddingInlineEnd];
      });
      assert.deepEqual(actual, [`${padding}px`, `${padding}px`], id);
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
  }
  console.log("Container presets, centering, padding and responsive shrink passed.");
} finally {
  await browser?.close();
  await server.close();
}

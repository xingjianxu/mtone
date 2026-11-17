import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 5214, strictPort: true },
  logLevel: "error",
});
await server.listen();
await mkdir("artifacts/timeline-browser", { recursive: true });
let failed = false;
try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
    ["webkit", webkit],
  ]) {
    let browser, page;
    try {
      browser = await engine.launch();
      page = await browser.newPage({ viewport: { width: 900, height: 900 } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("http://127.0.0.1:5214/tests/fixtures/timeline.html");
      await expect(
        page.getByTestId("vertical").getByRole("listitem"),
      ).toHaveCount(3);
      await page.getByRole("button", { name: "Reverse" }).click();
      await expect(
        page.getByTestId("vertical").getByRole("listitem").first(),
      ).toContainText("Last");
      for (const width of [900, 375, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await page.waitForTimeout(80);
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth + 1,
          ),
          "page must not overflow",
        );
        const aligned = await page
          .getByTestId("horizontal")
          .locator(".mt-timeline-item")
          .evaluateAll((es) =>
            es.every((e) => {
              const a = e
                  .querySelector(".mt-timeline-title")
                  .getBoundingClientRect(),
                b = e
                  .querySelector(".mt-timeline-content")
                  .getBoundingClientRect();
              return (
                Math.abs(a.left - b.left) < 2 && Math.abs(a.width - b.width) < 2
              );
            }),
          );
        assert(aligned, "horizontal title and content must share track");
        const lineCentered = await page
          .getByTestId("horizontal")
          .locator(".mt-timeline-item")
          .evaluateAll((es) =>
            es.slice(0, -1).every((e) => {
              const a = e
                  .querySelector(".mt-timeline-icon")
                  .getBoundingClientRect(),
                b = e
                  .querySelector(".mt-timeline-tail")
                  .getBoundingClientRect();
              return Math.abs(a.y + a.height / 2 - b.y - b.height / 2) < 1;
            }),
          );
        assert(
          lineCentered,
          "horizontal lines must pass through marker centers",
        );
        const dots = await page
          .getByTestId("horizontal")
          .locator(".mt-timeline-icon")
          .evaluateAll((es) => es.map((e) => e.getBoundingClientRect().top));
        assert(
          Math.max(...dots) - Math.min(...dots) < 2,
          "horizontal markers must share one baseline",
        );
        for (const id of ["vertical", "alternate", "explicit", "rtl"]) {
          const positions = await page
            .getByTestId(id)
            .locator(".mt-timeline-icon")
            .evaluateAll((es) => es.map((e) => e.getBoundingClientRect().left));
          assert(
            Math.max(...positions) - Math.min(...positions) < 2,
            `${id} markers must align`,
          );
        }
        await page.screenshot({
          path: `artifacts/timeline-browser/${name}-${width}.png`,
          fullPage: true,
        });
      }
      assert.deepEqual(errors, []);
      console.log(`${name}: passed`);
    } catch (e) {
      failed = true;
      console.error(name, e);
      if (page)
        await page
          .screenshot({
            path: `artifacts/timeline-browser/${name}-failure.png`,
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

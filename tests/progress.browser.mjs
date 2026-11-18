import { createServer } from "vite";
import { chromium, firefox, webkit } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 5198, strictPort: true },
  logLevel: "error",
});
await server.listen();
await mkdir("artifacts/progress", { recursive: true });
try {
  for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage({
        viewport: { width: 375, height: 700 },
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("http://127.0.0.1:5198/tests/fixtures/progress.html");
      const legacy = page.getByRole("progressbar", {
        name: "legacy",
        exact: true,
      });
      assert.equal(
        await legacy
          .locator(".mt-progress-track")
          .evaluate((el) => el.getBoundingClientRect().height),
        5,
      );
      assert.equal(await legacy.locator(".mt-progress-info").count(), 0);
      const circle = page.getByRole("progressbar", {
        name: "circle",
        exact: true,
      });
      assert.equal(
        await circle.evaluate((el) => el.getBoundingClientRect().width),
        100,
      );
      const segments = page.getByRole("progressbar", {
        name: "segments",
        exact: true,
      });
      assert.equal(await segments.locator('[data-filled="true"]').count(), 3);
      for (let i = 0; i < 4; i++)
        await page
          .getByRole("button", { name: "Increase", exact: true })
          .click();
      assert.equal(await circle.getAttribute("aria-valuenow"), "100");
      assert.equal(await segments.locator('[data-filled="true"]').count(), 8);
      await page.getByRole("button", { name: "Reset", exact: true }).click();
      assert.equal(await circle.locator(".mt-progress-arc-fill").count(), 0);
      assert.equal(await segments.locator('[data-filled="true"]').count(), 0);
      await page.getByRole("button", { name: "Increase", exact: true }).click();
      const fill = page
        .getByRole("progressbar", { name: "active", exact: true })
        .locator(".mt-progress-fill");
      assert.equal(
        await fill.evaluate(
          (el) => getComputedStyle(el, "::after").animationName,
        ),
        "mt-progress-active",
      );
      assert.equal(
        await fill.evaluate((el) => getComputedStyle(el).overflow),
        "hidden",
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      assert.equal(
        await fill.evaluate(
          (el) => getComputedStyle(el, "::after").animationName,
        ),
        "none",
      );
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await page.screenshot({
        path: `artifacts/progress/${name}-light.png`,
        fullPage: true,
      });
      await page
        .locator(".mt-scope")
        .evaluateAll((els) =>
          els.forEach(
            (el) =>
              (el.style.cssText =
                "--mt-fg:#ecebe8;--mt-hover:#373633;--mt-progress-track:#373633;--mt-bg:#252422;background:#252422"),
          ),
        );
      await page.screenshot({
        path: `artifacts/progress/${name}-dark.png`,
        fullPage: true,
      });
      assert.deepEqual(errors, []);
      console.log(
        name +
          " Progress dimensions, dynamic bounds, steps, SVG, reduced motion and narrow layout passed",
      );
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}

import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 5210, strictPort: true },
  logLevel: "error",
});
await server.listen();
await mkdir("artifacts/table-of-contents-browser", { recursive: true });
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
      page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(
        "http://127.0.0.1:5210/tests/fixtures/table-of-contents.html",
      );
      const nav = page.getByRole("navigation", { name: "Article contents" });
      await expect(nav.getByRole("link")).toHaveCount(3);
      await nav.getByRole("link", { name: "Details", exact: true }).click();
      await expect(
        nav.getByRole("link", { name: "Details", exact: true }),
      ).toHaveAttribute("aria-current", "location");
      await expect(page.locator("#detail")).toBeFocused();
      await expect
        .poll(() =>
          page.evaluate(() =>
            Math.abs(
              document.getElementById("detail").getBoundingClientRect().top -
                document
                  .querySelector('[data-testid="scroller"]')
                  .getBoundingClientRect().top -
                3 -
                16,
            ),
          ),
        )
        .toBeLessThan(2);
      assert.equal(new URL(page.url()).hash, "");
      await page.getByTestId("scroller").evaluate((el) => {
        el.scrollTop +=
          document.getElementById("last").getBoundingClientRect().top -
          el.getBoundingClientRect().top -
          el.clientTop;
      });
      await expect(
        nav.getByRole("link", { name: "Last", exact: true }),
      ).toHaveAttribute("aria-current", "location");
      await page.getByRole("button", { name: "Toggle heading" }).click();
      await expect(nav.getByRole("link")).toHaveCount(4);
      await nav
        .getByRole("link", { name: "Dynamic heading", exact: false })
        .click();
      await expect(
        nav.getByRole("link", { name: "Dynamic heading", exact: false }),
      ).toHaveAttribute("aria-current", "location");
      await page.getByRole("button", { name: "Toggle heading" }).click();
      await expect(nav.getByRole("link")).toHaveCount(3);
      const winNav = page.getByRole("navigation", { name: "Window contents" });
      await winNav.getByRole("link", { name: "Window last" }).focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#window-last")).toBeFocused();
      await expect
        .poll(() =>
          page
            .locator("#window-last")
            .evaluate((el) => Math.abs(el.getBoundingClientRect().top - 20)),
        )
        .toBeLessThan(2);
      await expect(
        winNav.getByRole("link", { name: "Window last" }),
      ).toHaveAttribute("aria-current", "location");
      await page.evaluate(() => window.scrollTo(0, 0));
      await nav.getByRole("link", { name: "First", exact: true }).click();
      for (const width of [375, 320]) {
        await page.setViewportSize({ width, height: 800 });
        await nav.getByRole("link", { name: "First", exact: true }).focus();
        await page.keyboard.press("Tab");
        await expect(
          nav.getByRole("link", { name: "Details", exact: true }),
        ).toBeFocused();
        await expect
          .poll(() =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= window.innerWidth,
            ),
          )
          .toBe(true);
        assert.notEqual(
          await nav
            .getByRole("link", { name: "Details", exact: true })
            .evaluate((el) => getComputedStyle(el).outlineStyle),
          "none",
        );
        await page.screenshot({
          path: `artifacts/table-of-contents-browser/${name}-${width}.png`,
          fullPage: true,
        });
      }
      assert.deepEqual(errors, []);
      console.log(`${name}: TableOfContents passed`);
    } catch (error) {
      failed = true;
      console.error(name, error);
      if (page)
        await page
          .screenshot({
            path: `artifacts/table-of-contents-browser/${name}-failure.png`,
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

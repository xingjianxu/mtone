import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 5201, strictPort: true },
  logLevel: "error",
});
await server.listen();
await mkdir("artifacts/rate-browser", { recursive: true });
let failed = false;
try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
    ["webkit", webkit],
  ]) {
    if (
      process.env.RATE_BROWSERS &&
      !process.env.RATE_BROWSERS.split(",").includes(name)
    )
      continue;
    let browser, page;
    try {
      browser = await engine.launch({
        headless: true,
        ...(name === "chromium" && process.env.CHROMIUM_EXECUTABLE_PATH
          ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH }
          : {}),
      });
      page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("http://127.0.0.1:5201/tests/fixtures/rate.html");
      const basic = page.getByTestId("basic");
      const character = (root, index) =>
        root.locator(".mt-rate-character").nth(index);
      await expect(basic).toHaveAttribute("aria-valuenow", "2.5");
      await character(basic, 3).hover({ position: { x: 3, y: 10 } });
      await expect(basic).toHaveAttribute("data-preview", "3.5");
      await expect(page.getByRole("tooltip")).toHaveText("Great");
      const topHint = await page.getByRole("tooltip").boundingBox();
      assert(topHint && topHint.y >= 0, "top tooltip must flip into viewport");
      assert(
        await page
          .getByRole("tooltip")
          .evaluate((el) => !el.closest("section")),
        "tooltip must escape clipping section",
      );
      await basic.focus();
      await basic.press("Escape");
      await expect(page.getByRole("tooltip")).toHaveCount(0);
      await character(basic, 3).hover({ position: { x: 4, y: 10 } });
      await character(basic, 3).click({ position: { x: 3, y: 10 } });
      await expect(page.getByTestId("value")).toHaveText("3.5");
      await expect(basic).toBeFocused();
      await character(basic, 3).click({ position: { x: 3, y: 10 } });
      await expect(page.getByTestId("value")).toHaveText("0");
      await basic.press("ArrowRight");
      await expect(page.getByTestId("value")).toHaveText("0.5");
      await basic.press("End");
      await expect(page.getByTestId("value")).toHaveText("5");
      await basic.press("Home");
      await expect(page.getByTestId("value")).toHaveText("0");
      await character(basic, 2).hover({ position: { x: 17, y: 10 } });
      await expect(basic).toHaveAttribute("data-preview", "3");
      await page.mouse.move(2, 2);
      await expect(basic).not.toHaveAttribute("data-preview");
      await expect(basic).toHaveAttribute("aria-valuenow", "0");
      const rtl = page.getByTestId("rtl");
      await character(rtl, 2).click({ position: { x: 17, y: 10 } });
      await expect(rtl).toHaveAttribute("aria-valuenow", "2.5");
      await rtl.press("ArrowLeft");
      await expect(rtl).toHaveAttribute("aria-valuenow", "3");
      await rtl.press("ArrowRight");
      await expect(rtl).toHaveAttribute("aria-valuenow", "2.5");
      const fixed = page.getByTestId("fixed");
      await character(fixed, 4).click();
      await expect(fixed).toHaveAttribute("aria-valuenow", "2");
      await expect(character(fixed, 4)).toHaveAttribute("data-fill", "0");
      const noClear = page.getByTestId("no-clear");
      await character(noClear, 1).click();
      await noClear.press("Delete");
      await expect(noClear).toHaveAttribute("aria-valuenow", "2");
      await noClear.press("Home");
      await expect(noClear).toHaveAttribute("aria-valuenow", "1");
      const disabled = page.getByTestId("disabled");
      await character(disabled, 4).click();
      await expect(disabled).toHaveAttribute("aria-valuenow", "2.5");
      await expect(disabled).toHaveAttribute("tabindex", "-1");
      const noKeys = page.getByTestId("no-keys");
      await noKeys.focus();
      await noKeys.press("ArrowRight");
      await expect(noKeys).toHaveAttribute("aria-valuenow", "0");
      await character(noKeys, 2).click();
      await expect(noKeys).toHaveAttribute("aria-valuenow", "3");
      await noKeys.press("Tab");
      await expect(page.getByTestId("long-hint")).toBeFocused();
      await page.screenshot({
        path: `artifacts/rate-browser/${name}-desktop.png`,
        fullPage: true,
      });
      for (const width of [375, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await character(page.getByTestId("long-hint"), 0).hover();
        await expect(page.getByRole("tooltip")).toBeVisible();
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `overflow at ${width}`,
        );
        const hint = await page.getByRole("tooltip").boundingBox();
        assert(
          hint && hint.x >= 0 && hint.x + hint.width <= width,
          "tooltip overflows",
        );
        await page.screenshot({
          path: `artifacts/rate-browser/${name}-${width}.png`,
          fullPage: true,
        });
      }
      const narrow = page.getByTestId("narrow");
      const boxes = await narrow
        .locator(".mt-rate-character")
        .evaluateAll((nodes) =>
          nodes.map((node) => {
            const r = node.getBoundingClientRect();
            return {
              left: r.left,
              right: r.right,
              top: r.top,
              bottom: r.bottom,
              width: r.width,
            };
          }),
        );
      assert(
        boxes.every((box) => box.width === 20),
        "character hit boxes must not shrink",
      );
      for (let i = 1; i < boxes.length; i++)
        assert(
          boxes[i].top > boxes[i - 1].top ||
            boxes[i].left >= boxes[i - 1].right,
          "characters overlap",
        );
      const narrowBounds = await narrow.boundingBox();
      assert(
        narrowBounds &&
          boxes.every(
            (box) => box.right <= narrowBounds.x + narrowBounds.width,
          ),
        "narrow rating overflows",
      );
      await character(narrow, 4).click({ position: { x: 3, y: 10 } });
      await expect(narrow).toHaveAttribute("aria-valuenow", "4.5");
      assert.deepEqual(errors, []);
      // Touch generates selection but must not leave desktop hover preview behind.
      const context = await browser.newContext({
        hasTouch: true,
        viewport: { width: 375, height: 900 },
      });
      const touch = await context.newPage();
      await touch.goto("http://127.0.0.1:5201/tests/fixtures/rate.html");
      const target = touch
        .getByTestId("basic")
        .locator(".mt-rate-character")
        .nth(3);
      const box = await target.boundingBox();
      assert(box);
      await touch.touchscreen.tap(box.x + 3, box.y + box.height / 2);
      await expect(touch.getByTestId("value")).toHaveText("3.5");
      await expect(touch.getByTestId("basic")).not.toHaveAttribute(
        "data-preview",
      );
      await context.close();
      console.log(`${name}: Rate passed`);
    } catch (error) {
      failed = true;
      console.error(`${name}:`, error);
      if (page)
        await page
          .screenshot({
            path: `artifacts/rate-browser/${name}-failure.png`,
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

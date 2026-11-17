import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 5199, strictPort: true },
  logLevel: "error",
});
await server.listen();
await mkdir("artifacts/calendar-browser", { recursive: true });
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
      page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
      page.setDefaultTimeout(10000);
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("http://127.0.0.1:5199/tests/fixtures/calendar.html");
      const basic = page.getByTestId("basic");
      const day = (container, date) =>
        container.getByRole("button", { name: date, exact: true });
      await expect(basic.getByRole("gridcell")).toHaveCount(42);
      await expect(
        basic.getByRole("columnheader", { name: "Week", exact: true }),
      ).toBeVisible();
      await expect(day(basic, "2024-02-15")).toContainText("Team meeting");
      await expect(basic.locator("select")).toHaveCount(0);
      await expect(basic.locator(".mt-select")).toHaveCount(2);
      await day(basic, "2024-02-28").click();
      await day(basic, "2024-02-28").press("ArrowRight");
      await expect(day(basic, "2024-02-29")).toBeFocused();
      await expect(page.getByTestId("value")).toHaveText("2024-02-28");
      await day(basic, "2024-02-29").press("Enter");
      await expect(page.getByTestId("value")).toHaveText("2024-02-29");
      await day(basic, "2024-02-29").press("PageDown");
      await expect(day(basic, "2024-03-29")).toBeFocused();
      await day(basic, "2024-03-29").press("Space");
      await expect(page.getByTestId("value")).toHaveText("2024-03-29");
      // The header is mtone Select, not the browser's native dropdown.
      const monthSelect = basic.locator(".mt-select").nth(1);
      await monthSelect.click();
      await expect(page.getByRole("listbox")).toBeVisible();
      await page.getByRole("option", { name: "Feb", exact: true }).click();
      await expect(day(basic, "2024-02-29")).toBeVisible();
      await basic.getByRole("button", { name: "Year", exact: true }).click();
      await expect(basic.getByRole("gridcell")).toHaveCount(12);
      await basic
        .getByRole("button", { name: "Next year", exact: true })
        .click();
      await expect(page.getByTestId("value")).toHaveText("2025-02-28");
      await basic.getByRole("button", { name: "Month", exact: true }).click();
      await expect(basic.getByRole("gridcell")).toHaveCount(42);
      const card = page.getByTestId("card");
      await expect(day(card, "2024-02-09")).toBeDisabled();
      await expect(day(card, "2024-02-16")).toBeDisabled();
      await day(card, "2024-02-15").click();
      await day(card, "2024-02-15").press("ArrowRight");
      await expect(day(card, "2024-02-17")).toBeFocused();
      await day(card, "2024-02-17").press("Enter");
      await expect(
        card.getByRole("gridcell", { selected: true }),
      ).toContainText("17");
      const controlled = page.getByTestId("controlled");
      await day(controlled, "2024-02-18").click();
      await expect(
        controlled.getByRole("gridcell", { selected: true }),
      ).toContainText("15");
      const custom = page.getByTestId("custom");
      await custom
        .getByRole("button", { name: "Custom March", exact: true })
        .click();
      await expect(day(custom, "2024-03-12")).toContainText("2024-03-12");
      await expect(
        page
          .getByTestId("chinese")
          .getByRole("button", { name: "下一月", exact: true }),
      ).toBeVisible();
      await basic.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `artifacts/calendar-browser/${name}-desktop.png`,
      });
      await page.setViewportSize({ width: 375, height: 800 });
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
        "calendar page fits 375px viewport",
      );
      assert(
        await custom.locator(".mt-calendar-day").evaluateAll((buttons) =>
          buttons.every((button) => {
            const box = button.getBoundingClientRect();
            return (
              button.scrollWidth <= button.clientWidth + 1 &&
              [...button.children].every((child) => {
                const content = child.getBoundingClientRect();
                return (
                  content.left >= box.left - 1 && content.right <= box.right + 1
                );
              })
            );
          }),
        ),
        "full-cell custom content wraps within each date cell",
      );
      await page.setViewportSize({ width: 320, height: 800 });
      await card.scrollIntoViewIfNeeded();
      const box = await card.locator(".mt-calendar").boundingBox();
      assert(
        box.x >= 0 && box.x + box.width <= 321,
        "card calendar fits mobile viewport",
      );
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
        "calendar page does not overflow horizontally",
      );
      await page.screenshot({
        path: `artifacts/calendar-browser/${name}-mobile.png`,
      });
      await page.emulateMedia({ forcedColors: "active" });
      await expect(day(card, "2024-02-17")).toBeVisible();
      await page.screenshot({
        path: `artifacts/calendar-browser/${name}-forced-colors.png`,
      });
      assert.deepEqual(errors, [], `${name}: no page errors`);
      console.log(
        `${name}: Calendar panels, keyboard, Select, ranges, controlled/custom rendering and mobile layout passed`,
      );
    } catch (error) {
      failed = true;
      console.error(`${name}: ${error.stack ?? error}`);
      if (page)
        await page
          .screenshot({
            path: `artifacts/calendar-browser/${name}-failure.png`,
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

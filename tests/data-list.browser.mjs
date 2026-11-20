import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 5239, strictPort: true },
  logLevel: "error",
});
await server.listen();
await mkdir("artifacts/data-list-browser", { recursive: true });
let failed = false;
try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
    ["webkit", webkit],
  ].filter(
    ([name]) =>
      !process.env.MTONE_BROWSER || process.env.MTONE_BROWSER === name,
  )) {
    let browser, page;
    try {
      browser = await engine.launch({
        headless: true,
        ...(name === "chromium" && process.env.CHROMIUM_PATH
          ? { executablePath: process.env.CHROMIUM_PATH }
          : {}),
      });
      page = await browser.newPage({ viewport: { width: 900, height: 900 } });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("http://127.0.0.1:5239/tests/fixtures/data-list.html");
      const local = page.getByTestId("local");
      const search = local.getByRole("textbox", { name: "Find records" });
      // Traverse via real Tab presses rather than only programmatically focusing controls.
      await page.getByTestId("before").focus();
      await page.keyboard.press("Tab");
      await expect(search).toBeFocused();
      async function tabTo(target) {
        for (let i = 0; i < 30; i++) {
          if (await target.evaluate((el) => el === document.activeElement))
            return;
          await page.keyboard.press("Tab");
        }
        await expect(target).toBeFocused();
      }
      const alpha = local.getByRole("checkbox", {
        name: "Select Alpha",
        exact: true,
      });
      await tabTo(alpha);
      await page.keyboard.press("Space");
      await expect(alpha).toBeChecked();
      await expect(page.getByTestId("selection")).toHaveText("a");
      await expect(page.getByTestId("batch-count")).toHaveText("Batch 1");
      const expand = local.getByRole("button", {
        name: "Expand Alpha",
        exact: true,
      });
      await tabTo(expand);
      await page.keyboard.press("Enter");
      await expect(local.getByText("Details for Alpha")).toBeVisible();
      await local.screenshot({
        path: `artifacts/data-list-browser/${name}-expanded.png`,
      });
      const collapse = local.getByRole("button", {
        name: "Collapse Alpha",
        exact: true,
      });
      await expect(collapse).toHaveAttribute("aria-expanded", "true");
      await page.keyboard.press("Enter");
      await expect(local.getByText("Details for Alpha")).toHaveCount(0);
      const open = local.getByRole("button", {
        name: "Open Alpha",
        exact: true,
      });
      await tabTo(open);
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("action")).toHaveText("a");
      await local
        .getByRole("button", { name: "Next page", exact: true })
        .click();
      const gamma = local.getByRole("checkbox", {
        name: "Select Gamma",
        exact: true,
      });
      await gamma.click();
      await expect(page.getByTestId("selection")).toHaveText("a,c");
      await expect(
        local.getByRole("checkbox", { name: "Select Locked", exact: true }),
      ).toBeDisabled();
      const visibleSelection = local.getByRole("checkbox", {
        name: "Select visible items",
        exact: true,
      });
      await visibleSelection.click();
      await expect(page.getByTestId("selection")).toHaveText("a");
      await visibleSelection.click();
      await expect(page.getByTestId("selection")).toHaveText("a,c");
      await local
        .getByRole("button", { name: "Previous page", exact: true })
        .click();
      await expect(alpha).toBeChecked();
      await local
        .getByRole("button", { name: "Next page", exact: true })
        .click();
      await local
        .getByRole("button", { name: "Next page", exact: true })
        .click();
      await expect(local.getByText("Epsilon", { exact: true })).toBeVisible();
      await search.fill("Beta");
      await expect(local.getByText("Beta", { exact: true })).toBeVisible();
      await expect(
        local.getByRole("button", { name: "Previous page", exact: true }),
      ).toBeDisabled();
      await expect(page.getByTestId("selection")).toHaveText("a,c");
      await local
        .getByRole("button", { name: "Reset batch", exact: true })
        .click();
      await expect(page.getByTestId("selection")).toHaveText("none");
      await search.fill("missing");
      await expect(local.getByText("No items", { exact: true })).toBeVisible();
      await search.fill("");
      await expect(alpha).toBeVisible();
      const remote = page.getByTestId("remote");
      await remote
        .getByRole("button", { name: "Next page", exact: true })
        .click();
      await expect(page.getByTestId("remote-page")).toHaveText("2");
      await remote
        .getByRole("textbox", { name: "Remote query" })
        .fill("unmatched");
      await expect(page.getByTestId("remote-page")).toHaveText("1");
      // Remote data belongs to the caller, even with a local match that would reject every item.
      await expect(
        remote.getByText("Remote page 1", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByTestId("loading").getByText("Loading…", { exact: true }),
      ).toBeVisible();
      await expect(
        page
          .getByTestId("empty")
          .getByText("No records available", { exact: true }),
      ).toBeVisible();
      for (const width of [375, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await alpha.check();
        await expect(page.getByTestId("batch-count")).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        for (const button of await local.getByRole("button").all()) {
          if (!(await button.isVisible())) continue;
          const rect = await button.boundingBox();
          expect(rect.x).toBeGreaterThanOrEqual(0);
          expect(rect.x + rect.width).toBeLessThanOrEqual(width);
        }
        await local.screenshot({
          path: `artifacts/data-list-browser/${name}-${width}.png`,
        });
      }
      expect(errors).toEqual([]);
    } catch (error) {
      failed = true;
      console.error(name, error);
      if (page)
        await page
          .screenshot({
            path: `artifacts/data-list-browser/${name}-failure.png`,
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
if (failed) process.exit(1);

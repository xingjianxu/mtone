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
      const frame = local.locator(".mt-data-list");
      const header = frame.locator(":scope > .mt-data-list-toolbar");
      const selectAll = header.getByRole("checkbox", {
        name: "Select visible items",
        exact: true,
      });
      const toolbar = header.locator(":scope > .mt-toolbar");
      await expect(toolbar).toHaveCount(1);
      await expect(toolbar).toHaveAttribute("data-background", "gray");
      const leading = header.locator(".mt-toolbar-start");
      const searchSlot = leading.locator(":scope > .mt-search");
      const trailing = header.locator(".mt-toolbar-end");
      const measureFrame = () =>
        frame.evaluate((root) => {
          const header = root.querySelector(":scope > .mt-data-list-toolbar");
          const rows = [
            ...root.querySelectorAll(":scope > .mt-list > .mt-list-row"),
          ];
          const footer = root.querySelector(
            ":scope > .mt-data-list-pagination",
          );
          const scope = getComputedStyle(root);
          return {
            frameBorders: [
              scope.borderTopWidth,
              scope.borderRightWidth,
              scope.borderBottomWidth,
              scope.borderLeftWidth,
            ],
            radius: Number.parseFloat(scope.borderTopLeftRadius),
            clip: [
              scope.overflowX,
              scope.overflowY,
              getComputedStyle(header).overflowY,
            ],
            dividerWidths: [
              getComputedStyle(header).borderBottomWidth,
              ...rows.map((row) => getComputedStyle(row).borderBottomWidth),
              getComputedStyle(footer).borderTopWidth,
            ],
            frameColor: scope.borderTopColor,
            rowColor: getComputedStyle(rows[0]).borderBottomColor,
            headerTint: getComputedStyle(header.querySelector(":scope > .mt-toolbar")).backgroundColor,
            bodyTint: scope.backgroundColor,
          };
        });
      let lightTint;
      for (const colorScheme of ["light", "dark"]) {
        await page.emulateMedia({ colorScheme });
        const style = await measureFrame();
        expect(style.frameBorders).toEqual(["1px", "1px", "1px", "1px"]);
        expect(style.radius).toBeGreaterThan(0);
        expect(style.clip).toEqual(["visible", "visible", "visible"]);
        expect(style.dividerWidths).toEqual(["1px", "1px", "0px", "1px"]);
        expect(style.frameColor).toBe(style.rowColor);
        expect(style.headerTint).not.toBe(style.bodyTint);
        if (colorScheme === "light") lightTint = style.headerTint;
        else expect(style.headerTint).not.toBe(lightTint);
      }
      await page.emulateMedia({ colorScheme: "light", forcedColors: "active" });
      if (
        await page.evaluate(() => matchMedia("(forced-colors: active)").matches)
      ) {
        const style = await measureFrame();
        expect(style.dividerWidths).toEqual(["1px", "1px", "0px", "1px"]);
        expect(style.frameColor).toBe(style.rowColor);
        expect(style.frameColor).not.toBe(style.bodyTint);
      }
      await page.emulateMedia({ colorScheme: "light", forcedColors: "none" });
      const selectionGroup = header.locator(".mt-data-list-selection");
      async function expectHeaderOrder({ stackedOnly = false } = {}) {
        const selection = await selectionGroup.boundingBox();
        const searchBox = await searchSlot.boundingBox();
        const startBox = await leading.boundingBox();
        const actions = await trailing.boundingBox();
        const layout = await header.locator(".mt-toolbar-layout").boundingBox();
        // Intrinsic widths differ by engine and font. Keep both permitted desktop
        // arrangements, but insist on a full-width search row at narrow sizes.
        const stacked = selection.y + selection.height <= searchBox.y + 0.05;
        const beside = selection.x + selection.width <= searchBox.x + 0.05;
        expect(
          stacked || (!stackedOnly && beside),
          `expected selection before search without overlap: ${JSON.stringify({ selection, searchBox, stackedOnly })}`,
        ).toBe(true);
        expect(Math.abs(actions.x + actions.width - layout.x - layout.width)).toBeLessThan(1);
        if (stackedOnly) {
          expect(Math.abs(searchBox.width - startBox.width)).toBeLessThan(1);
          expect(actions.y + 0.05).toBeGreaterThanOrEqual(searchBox.y + searchBox.height);
        }
      }
      await expectHeaderOrder();
      const filterTrigger = header.getByRole("button", {
        name: "Filter records",
        exact: true,
      });
      await filterTrigger.click();
      await expect(
        page.getByRole("dialog", { name: "Filter options" }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(filterTrigger).toBeFocused();
      // Traverse via real Tab presses rather than only programmatically focusing controls.
      await page.getByTestId("before").focus();
      await page.keyboard.press("Tab");
      await expect(selectAll).toBeFocused();
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
        await expectHeaderOrder({ stackedOnly: true });
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
      await expect(
        page.getByTestId("empty").locator(".mt-data-list-toolbar"),
      ).toHaveCount(0);
      await expect(
        page.getByTestId("loading").locator(".mt-data-list-toolbar"),
      ).toHaveCount(0);
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

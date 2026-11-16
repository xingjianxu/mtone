import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 5197, strictPort: true },
  logLevel: "error",
});
await server.listen();
await mkdir("artifacts/table-browser", { recursive: true });
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
      page = await browser.newPage({ viewport: { width: 1100, height: 1000 } });
      page.setDefaultTimeout(10000);
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("http://127.0.0.1:5197/tests/fixtures/table.html");
      const fixed = page.getByTestId("fixed");
      await expect(fixed.getByText("Person 0", { exact: true })).toBeVisible();
      const body = fixed.locator(".mt-table-body");
      const geometry = () =>
        fixed.evaluate((el) => {
          const row = el.querySelector(".mt-table-body .mt-table-row");
          const headers = [...el.querySelectorAll(".mt-table-header th")];
          const cells = [...row.querySelectorAll("td")];
          return {
            start: cells[0].getBoundingClientRect().left,
            end: cells.at(-1).getBoundingClientRect().right,
            widths: cells.map((cell, i) =>
              Math.abs(
                cell.getBoundingClientRect().width -
                  headers[i].getBoundingClientRect().width,
              ),
            ),
            positions: [
              getComputedStyle(cells[0]).position,
              getComputedStyle(cells.at(-1)).position,
            ],
          };
        });
      const initial = await geometry();
      const overflow = await body.evaluate((el) => ({ width: el.clientWidth, content: el.scrollWidth }));
      assert(overflow.content > overflow.width + 100, `${name}: fixture must provide horizontal overflow: ${JSON.stringify(overflow)}`);
      assert(
        initial.widths.every((n) => n < 2),
        `${name}: header/body widths must match`,
      );
      assert.deepEqual(initial.positions, ["sticky", "sticky"]);
      await body.evaluate((el) => {
        el.scrollLeft = 220;
        el.dispatchEvent(new Event("scroll"));
      });
      await expect
        .poll(
          async () =>
            await fixed
              .locator(".mt-table-header")
              .evaluate((el) => el.scrollLeft),
        )
        .toBeGreaterThan(100);
      const scrolled = await geometry();
      assert(
        Math.abs(scrolled.start - initial.start) < 2,
        `${name}: start column moved`,
      );
      assert(
        Math.abs(scrolled.end - initial.end) < 2,
        `${name}: end column moved`,
      );
      assert(scrolled.widths.every((n) => n < 2));
      await expect(fixed.getByText("24 records")).toBeVisible();
      await fixed.screenshot({
        path: `artifacts/table-browser/${name}-fixed.png`,
      });
      const controls = page.getByTestId("controls");
      const selectionCenters = async (scope) => scope.locator(".mt-table-selection-column input:visible").evaluateAll(inputs =>
        inputs.map(input => { const r = input.getBoundingClientRect(); return r.x + r.width / 2; }));
      for (const scope of [controls, ...await page.locator('[data-testid^="selection-"]').all()]) {
        const centers = await selectionCenters(scope);
        const contained = await scope.locator(".mt-table-selection-actions:visible").evaluate(button => {
          const a = button.getBoundingClientRect(), b = button.closest("th").getBoundingClientRect();
          return a.left >= b.left && a.right <= b.right;
        });
        assert(contained, name + ": selection action must remain inside its column");
        assert(centers.length >= 3, "selection fixture has header and body controls");
        assert(centers.every(x => Math.abs(x - centers[0]) <= 1),
          name + ": selection checkbox centers must align: " + JSON.stringify(centers));
      }
      const actions = controls.getByRole("button", { name: "Selection actions" });
      await expect(actions).toHaveAttribute("aria-haspopup", "menu");
      await actions.click();
      await expect(page.getByRole("menu")).toBeVisible();
      await page.screenshot({ path: `artifacts/table-browser/${name}-selection-menu.png` });
      await page.getByRole("menuitem", { name: "Select all", exact: true }).click();
      await actions.click();
      await page.getByRole("menuitem", { name: "Select none", exact: true }).click();
      await expect(controls.getByLabel("Selected keys", { exact: true })).toHaveText("");
      await actions.focus();
      await page.keyboard.press("ArrowDown");
      await expect(page.getByRole("menu")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(actions).toBeFocused();

      await controls
        .getByRole("checkbox", { name: "Select all rows", exact: true })
        .check();
      await expect(
        controls.getByLabel("Selected keys", { exact: true }),
      ).toHaveText("0,1,3");
      await expect(
        controls.getByRole("checkbox", { name: "Select row 2", exact: true }),
      ).toBeDisabled();
      await controls.getByRole("button", { name: "Next page" }).click();
      await controls
        .getByRole("checkbox", { name: "Select row 4", exact: true })
        .check();
      await expect(
        controls.getByLabel("Selected keys", { exact: true }),
      ).toHaveText("0,1,3,4");
      await controls.getByRole("button", { name: "Previous page" }).click();
      await expect(
        controls.getByRole("checkbox", { name: "Select row 0", exact: true }),
      ).toBeChecked();
      const filter = controls.getByRole("button", { name: "Filter City" });
      await filter.click();
      await page
        .getByRole("searchbox", { name: "Search filters" })
        .fill("Paris");
      await page.getByRole("checkbox", { name: "Paris", exact: true }).check();
      await page.getByRole("button", { name: "OK", exact: true }).click();
      await expect(controls.getByText("Person 0", { exact: true })).toHaveCount(
        0,
      );
      await expect(
        controls.getByText("Person 1", { exact: true }),
      ).toBeVisible();
      await filter.click();
      await page.getByRole("button", { name: "Reset", exact: true }).click();
      await page.keyboard.press("Escape");
      await expect(filter).toBeFocused();
      await expect(
        controls.getByText("Person 0", { exact: true }),
      ).toBeVisible();
      await filter.click();
      await page.getByRole("checkbox", { name: "London", exact: true }).check();
      await page.keyboard.press("Escape");
      await expect(controls.getByText("Person 1", { exact: true })).toHaveCount(
        0,
      );
      await filter.click();
      await page
        .getByRole("checkbox", { name: "London", exact: true })
        .uncheck();
      await controls.getByRole("button", { name: "Outside filter" }).click();
      await expect(
        controls.getByText("Person 1", { exact: true }),
      ).toBeVisible();
      await controls.getByRole("button", { name: "Toggle radio" }).click();
      await controls
        .getByRole("radio", { name: "Select row 0", exact: true })
        .check();
      await controls
        .getByRole("radio", { name: "Select row 1", exact: true })
        .check();
      await expect(
        controls.getByLabel("Selected keys", { exact: true }),
      ).toHaveText("1");
      await controls
        .getByRole("combobox", { name: "Page size" })
        .selectOption("8");
      await expect(
        controls.getByText("Person 7", { exact: true }),
      ).toBeVisible();
      await controls.getByRole("textbox", { name: "Go to page" }).fill("2");
      await controls.getByRole("button", { name: "Go", exact: true }).click();
      await expect(
        controls.getByText("Person 8", { exact: true }),
      ).toBeVisible();
      const tree = page.getByTestId("tree");
      await expect(tree.getByText("Child one", { exact: true })).toHaveCount(0);
      await tree
        .getByRole("button", { name: "Expand row", exact: true })
        .click();
      await expect(tree.getByText("Child one", { exact: true })).toBeVisible();
      await tree
        .getByRole("checkbox", { name: "Select row 0", exact: true })
        .check();
      await expect(
        tree.getByRole("checkbox", { name: "Select row 1", exact: true }),
      ).toBeChecked();
      await expect(
        tree.getByRole("checkbox", { name: "Select row 2", exact: true }),
      ).toBeChecked();
      await tree
        .getByRole("checkbox", { name: "Select row 1", exact: true })
        .uncheck();
      assert(
        await tree
          .getByRole("checkbox", { name: "Select row 0", exact: true })
          .evaluate((el) => el.indeterminate),
      );
      const expanded = page.getByTestId("expanded");
      await expanded.getByRole("button", { name: "Expand all rows" }).click();
      await expect(expanded.getByText("Details for Person 0")).toBeVisible();
      await expect(expanded.getByText("Details for Person 1")).toBeVisible();
      await expect(expanded.getByText("Details for Person 2")).toHaveCount(0);
      await expanded.getByRole("button", { name: "Collapse all rows" }).click();
      await expect(
        expanded.getByText("Details for Person 0"),
      ).not.toBeVisible();
      const merged = page.getByTestId("merged");
      await expect(
        merged.getByRole("columnheader", { name: "Details", exact: true }),
      ).toHaveAttribute("colspan", "2");
      await expect(
        merged.getByRole("cell", { name: "Person 0", exact: true }),
      ).toHaveAttribute("rowspan", "2");
      await expect(
        merged.getByRole("cell", { name: "Person 1", exact: true }),
      ).toHaveCount(0);
      await expect(
        merged.getByRole("cell", { name: "Combined total" }),
      ).toHaveAttribute("colspan", "2");
      const virtual = page.getByTestId("virtual");
      assert(
        (await virtual.locator(".mt-table-row").count()) < 60,
        "virtual must mount only a window",
      );
      assert.equal(
        await virtual
          .locator(".mt-table-row")
          .first()
          .evaluate((el) => getComputedStyle(el).display),
        "flex",
      );
      await virtual.getByRole("button", { name: "Scroll to 500" }).click();
      await expect(
        virtual.getByText("Virtual 500", { exact: true }),
      ).toBeVisible();
      await expect(virtual.getByText("Virtual 0", { exact: true })).toHaveCount(
        0,
      );
      assert((await virtual.locator(".mt-table-row").count()) < 60);
      await virtual.getByRole("button", { name: "Virtual top" }).click();
      await expect(
        virtual.getByText("Virtual 0", { exact: true }),
      ).toBeVisible();
      await virtual.screenshot({
        path: `artifacts/table-browser/${name}-virtual.png`,
      });
      const responsive = page.getByTestId("responsive");
      await expect(
        responsive.getByRole("columnheader", { name: "City", exact: true }),
      ).toBeVisible();
      const dark = page.getByTestId("dark");
      assert.equal(
        await dark
          .locator("tbody .mt-table-cell")
          .first()
          .evaluate((el) => getComputedStyle(el).backgroundColor),
        "rgb(32, 32, 32)",
      );
      await dark
        .getByRole("checkbox", { name: "Select row 0", exact: true })
        .check();
      assert.notEqual(
        await dark
          .locator("tr[data-selected] td")
          .first()
          .evaluate((el) => getComputedStyle(el).backgroundColor),
        "rgb(255, 255, 255)",
      );
      const composition = page.getByTestId("composition");
      await composition
        .getByRole("button", { name: "编辑与拖拽", exact: true })
        .click();
      const editableRows = composition.locator(
        ".mt-table-tbody > tr.mt-table-row",
      );
      await editableRows
        .first()
        .getByRole("button", { name: "编辑", exact: true })
        .click();
      await composition
        .getByRole("textbox", { name: "编辑标题 1" })
        .fill("Edited title");
      await editableRows
        .first()
        .getByRole("button", { name: "保存", exact: true })
        .click();
      await expect(editableRows.first()).toContainText("Edited title");
      await editableRows
        .first()
        .getByRole("button", { name: "编辑", exact: true })
        .click();
      await composition
        .getByRole("textbox", { name: "编辑标题 1" })
        .fill("Discard me");
      await editableRows
        .first()
        .getByRole("button", { name: "取消", exact: true })
        .click();
      await expect(editableRows.first()).toContainText("Edited title");
      await expect(
        composition.getByText("Discard me", { exact: true }),
      ).toHaveCount(0);
      await editableRows.first().dragTo(editableRows.nth(2));
      await expect(editableRows.nth(2)).toHaveAttribute("data-row-key", "1");
      await composition
        .getByRole("button", { name: "重置", exact: true })
        .click();
      await expect(editableRows.first()).toHaveAttribute("data-row-key", "1");
      const headers = composition.locator("th[draggable=true]");
      await headers.first().dragTo(headers.nth(2));
      await expect(headers.first()).toHaveText("分类");
      await composition
        .getByRole("button", { name: "轮换列顺序", exact: true })
        .click();
      await expect(headers.first()).not.toHaveText("分类");
      await composition
        .getByRole("button", { name: "重置", exact: true })
        .click();
      await editableRows
        .first()
        .getByRole("button", { name: "下移 组件规范 1", exact: true })
        .click();
      await expect(editableRows.nth(1)).toHaveAttribute("data-row-key", "1");
      for (const width of [720, 360]) {
        await page.setViewportSize({ width, height: 1000 });
        await expect(
          responsive.getByRole("columnheader", { name: "City", exact: true }),
        ).toHaveCount(0);
        // ResizeObserver updates fixed/virtual widths after React's breakpoint render.
        await expect.poll(
          () => page.locator("main").evaluate((el) => el.scrollWidth - el.clientWidth),
          { message: `${name}: responsive page overflow at ${width}` },
        ).toBeLessThanOrEqual(1);
      }
      await page.setViewportSize({ width: 1100, height: 1000 });
      await page.emulateMedia({ forcedColors: "active" });
      if (
        await page.evaluate(() => matchMedia("(forced-colors: active)").matches)
      ) {
        const outline = await dark
          .locator("tr[data-selected] td")
          .first()
          .evaluate((el) => getComputedStyle(el).outlineStyle);
        assert.equal(outline, "solid");
        console.log(`${name}: forced colors selected row passed`);
      } else
        console.log(
          `${name}: forced-colors emulation unavailable; skipped color assertion`,
        );
      await page.emulateMedia({ forcedColors: "none" });
      assert.deepEqual(errors, [], `${name}: uncaught page errors`);
      console.log(
        `${name}: Table fixed/virtual, filters, selection, tree, expansion, spans, summary, responsive/dark, editing and drag passed`,
      );
    } catch (error) {
      failed = true;
      console.error(`${name}: ${error.stack ?? error}`);
      if (page)
        await page
          .screenshot({
            path: `artifacts/table-browser/${name}-failure.png`,
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

import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 5217, strictPort: true },
  logLevel: "error",
});
const engines = [
  ["chromium", chromium],
  ["firefox", firefox],
  ["webkit", webkit],
];
const selectedBrowser = process.env.MTONE_TREE_BROWSER;
if (selectedBrowser && !engines.some(([name]) => name === selectedBrowser)) {
  throw new Error(`Unknown Tree browser: ${selectedBrowser}`);
}
await server.listen();
await mkdir("artifacts/tree-browser", { recursive: true });
let failed = false;
try {
  for (const [name, engine] of engines) {
    if (selectedBrowser && name !== selectedBrowser) continue;
    let browser, page;
    try {
      browser = await engine.launch({
        executablePath: name === "chromium" ? process.env.CHROMIUM_PATH : undefined,
      });
      page = await browser.newPage({ viewport: { width: 900, height: 1000 } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("http://127.0.0.1:5217/tests/fixtures/tree.html");
      const checked = page.getByRole("tree", { name: "Checked", exact: true });
      const selected = checked.getByRole("treeitem", { selected: true });
      await expect(selected).toHaveCount(2);
      const visual = await selected.evaluateAll(([first, second]) => {
        const a = first.getBoundingClientRect(), b = second.getBoundingClientRect();
        const guideA = first.querySelector(".mt-tree-guide-direct");
        const guideB = second.querySelector(".mt-tree-guide-direct");
        const lineA = guideA.getBoundingClientRect(), lineB = guideB.getBoundingClientRect();
        const jointA = Number.parseFloat(getComputedStyle(guideA, "::after").top) + lineA.top;
        const jointB = Number.parseFloat(getComputedStyle(guideB, "::after").top) + lineB.top;
        const gapTarget = document.elementFromPoint(a.left + a.width / 2, (a.bottom + b.top) / 2);
        return {
          gap: b.top - a.bottom,
          firstFill: getComputedStyle(first).backgroundColor,
          secondFill: getComputedStyle(second).backgroundColor,
          hitsRowInGap: !!gapTarget?.closest("[role=treeitem]"),
          continuousLine: lineB.top - lineA.bottom,
          firstJointOffset: jointA - (a.top + a.height / 2),
          secondJointOffset: jointB - (b.top + b.height / 2),
        };
      });
      assert(Math.abs(visual.gap - 2) < 0.1,
        `selected Tree rows have the 2px default gap (actual ${visual.gap})`);
      assert.equal(visual.firstFill, visual.secondFill);
      assert.notEqual(visual.firstFill, "rgba(0, 0, 0, 0)", "the selected fills are visible");
      assert.equal(visual.hitsRowInGap, false, "space between highlights is not a row hit target");
      assert(Math.abs(visual.continuousLine) < 0.1, "the guide line crosses the row gap");
      assert(Math.abs(visual.firstJointOffset) < 0.6 && Math.abs(visual.secondJointOffset) < 0.6,
        "branch joints stay at the row centers");
      const tight = page.getByRole("tree", { name: "Tight gap", exact: true });
      const zeroGap = await tight.getByRole("treeitem").evaluateAll(([a, b]) =>
        b.getBoundingClientRect().top - a.getBoundingClientRect().bottom);
      assert(Math.abs(zeroGap) < 0.1, "an explicit zero removes the row gap");
      await checked
        .getByRole("checkbox", { name: "Alpha", exact: true })
        .click();
      await expect(
        checked.getByRole("treeitem", { name: "Parent", exact: true }),
      ).toHaveAttribute("aria-checked", "mixed");
      await expect(
        checked.getByRole("treeitem", { name: "Alpha", exact: true }),
      ).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await expect(
        checked.getByRole("treeitem", { name: "Beta", exact: true }),
      ).toBeFocused();
      await checked
        .getByRole("checkbox", { name: "Beta", exact: true })
        .click();
      await expect(
        checked.getByRole("treeitem", { name: "Parent", exact: true }),
      ).toHaveAttribute("aria-checked", "true");
      const d = page.getByRole("tree", { name: "Directory", exact: true });
      await d.getByRole("treeitem", { name: "Parent", exact: true }).click();
      await expect(
        d.getByRole("treeitem", { name: "Alpha", exact: true }),
      ).toBeVisible();
      await d.getByRole("treeitem", { name: "Alpha", exact: true }).focus();
      await page.keyboard.press("End");
      await expect(
        d.getByRole("treeitem", { name: "Last", exact: true }),
      ).toBeFocused();
      const async = page.getByRole("tree", { name: "Async tree", exact: true });
      await async.getByRole("treeitem").focus();
      await page.keyboard.press("ArrowRight");
      await expect(
        async.getByRole("treeitem", { name: "Loaded", exact: true }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Scroll to 900" }).click();
      const v = page.getByRole("tree", { name: "Virtual", exact: true });
      await expect(
        v.getByRole("treeitem", { name: "Node 900", exact: true }),
      ).toBeVisible();
      assert((await v.getByRole("treeitem").count()) < 20);
      const virtualMetrics = await v.evaluate((viewport) => {
        const rows = viewport.querySelectorAll('[role=treeitem][aria-selected="true"]');
        const bounds = viewport.getBoundingClientRect();
        const a = rows[0].getBoundingClientRect(), b = rows[1].getBoundingClientRect();
        return { top: a.top - bounds.top, gap: b.top - a.bottom, rowHeight: a.height, scrollHeight: viewport.scrollHeight };
      });
      assert(Math.abs(virtualMetrics.top) < 0.1, "scrollTo aligns the requested row, excluding its preceding gap");
      assert(Math.abs(virtualMetrics.gap - 5.5) < 0.1, "virtual rows retain the configured fractional gap");
      assert(Math.abs(virtualMetrics.rowHeight - 34) < 0.1, "itemHeight still sets the actual row height");
      assert.equal(virtualMetrics.scrollHeight, 1001 * 34 + 1000 * 5.5,
        "virtual scroll extent includes each inter-row gap exactly once");
      const last = v.getByRole("treeitem", { name: "Node 1000", exact: true });
      await v.getByRole("treeitem", { name: "Node 900", exact: true }).focus();
      await page.keyboard.press("End");
      await expect(last).toBeFocused();
      assert(Math.abs(await last.evaluate((row) =>
        row.getBoundingClientRect().bottom - row.parentElement.getBoundingClientRect().bottom)) < 0.1,
      "the last virtual item scrolls flush to the bottom without a trailing gap");
      const drag = page.getByRole("tree", { name: "Drag tree", exact: true });
      await drag
        .getByRole("treeitem", { name: "Alpha", exact: true })
        .dragTo(drag.getByRole("treeitem", { name: "Last", exact: true }));
      await expect(page.locator("output")).toHaveText("a:z");
      const sidebar = page.getByRole("complementary", { name: "文档导航侧栏" });
      const docs = sidebar.getByRole("tree", { name: "文档目录" });
      const guide = docs.getByRole("treeitem", { name: "使用指南", exact: true });
      const startDoc = docs.getByRole("treeitem", { name: "快速开始", exact: true });
      const longDoc = docs.getByRole("treeitem", { name: "如何在狭窄侧边栏中整理、维护和查阅标题很长的组件文档", exact: true });
      const archive = docs.getByRole("treeitem", { name: "归档文档", exact: true });
      await expect(startDoc).toHaveAttribute("aria-selected", "true");
      const layout = await docs.evaluate((tree) => {
        const [first, second, long] = tree.querySelectorAll("[role=treeitem]");
        const numbers = [second, long].map((row) => row.querySelector(".mt-tree-end").getBoundingClientRect().right);
        const title = long.querySelector(".mt-tree-title");
        const indentation = (row) => row.querySelector(".mt-tree-toggle").getBoundingClientRect().left;
        return {
          sameCounterEnd: Math.abs(numbers[0] - numbers[1]) < 0.1,
          ellipsized: title.scrollWidth > title.clientWidth && getComputedStyle(title).textOverflow === "ellipsis",
          indent: indentation(second) - indentation(first),
          elbow: Number.parseFloat(getComputedStyle(second.querySelector(".mt-tree-guide-direct"), "::after").inlineSize),
        };
      });
      assert(layout.ellipsized && layout.sameCounterEnd, "long titles truncate without moving the right counters");
      assert(Math.abs(layout.indent - 26) < 0.1 && Math.abs(layout.elbow - 20) < 0.1,
        "custom indentation adjusts both row and guide geometry");
      await expect(longDoc.locator(".mt-tree-icon")).toHaveText("📝");
      await longDoc.locator(".mt-tree-title").click();
      await expect(longDoc).toHaveAttribute("aria-selected", "true");
      await expect(guide).toHaveAttribute("aria-expanded", "true");
      await archive.locator(".mt-tree-title").click();
      await expect(archive).toHaveAttribute("aria-selected", "true");
      await expect(archive).toHaveAttribute("aria-expanded", "false");
      await archive.locator(".mt-tree-toggle").click();
      await expect(page.getByText("归档加载失败，按右方向键或点击箭头重试。")).toBeVisible();
      await expect(archive).toHaveAttribute("aria-expanded", "false");
      await expect(archive).toHaveAttribute("aria-selected", "true");
      await archive.focus();
      await page.keyboard.press("ArrowRight");
      const history = docs.getByRole("treeitem", { name: "历史版本", exact: true });
      await expect(history).toBeVisible();
      await expect(page.getByText("归档子节点已由应用写入数据。")).toBeVisible();
      await page.keyboard.press("ArrowRight");
      await expect(history).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(history).toHaveAttribute("aria-selected", "true");
      for (const width of [900, 375, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.waitForTimeout(50);
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          "no page overflow",
        );
        const aligned = await checked
          .locator(".mt-tree-item")
          .evaluateAll((rows) =>
            rows.every((r) => {
              const t = r
                  .querySelector(".mt-tree-toggle")
                  .getBoundingClientRect(),
                c = r.querySelector(".mt-tree-check").getBoundingClientRect(),
                n = r.querySelector(".mt-tree-title").getBoundingClientRect();
              return (
                Math.abs(t.y + t.height / 2 - c.y - c.height / 2) < 2 &&
                Math.abs(t.y + t.height / 2 - n.y - n.height / 2) < 2
              );
            }),
          );
        assert(aligned, "switcher, checkbox, title centers align");
        await page.screenshot({
          path: `artifacts/tree-browser/${name}-${width}.png`,
          fullPage: true,
        });
      }
      assert.deepEqual(errors, []);
      console.log(`${name}: Tree passed`);
    } catch (e) {
      failed = true;
      console.error(name, e);
      if (page)
        await page
          .screenshot({
            path: `artifacts/tree-browser/${name}-failed.png`,
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

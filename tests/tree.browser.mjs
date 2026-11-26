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
      const measureRows = (name) => page.getByRole("tree", { name, exact: true })
        .getByRole("treeitem").evaluateAll((rows) => rows.map((row) => row.getBoundingClientRect().height));
      assert.deepEqual(await measureRows("Checked"), [32, 32, 32, 32], "Default Tree nodes are 32px tall");
      assert.deepEqual(await measureRows("Height only"), [38, 38, 38, 38], "itemHeight works without a scroll viewport");
      assert.deepEqual(await measureRows("Height with nonvirtual scrolling"), [36.5, 36.5, 36.5, 36.5], "itemHeight works with virtual=false and preserves fractional heights");
      assert.deepEqual(await measureRows("Minimum height"), [24, 24], "Positive small heights are clamped to 24px");
      assert.deepEqual(await measureRows("Invalid height"), [32, 32], "Invalid heights use 32px");
      assert.deepEqual(await measureRows("Default virtual height"), [32, 32, 32, 32], "The virtual default matches ordinary rows");
      const scrolling = page.getByRole("tree", { name: "Height with nonvirtual scrolling", exact: true });
      const geometry = await scrolling.evaluate((tree) => {
        const rows = [...tree.querySelectorAll('[role="treeitem"]')].map(row => ({
          row: row.getBoundingClientRect(),
          action: row.querySelector('button[aria-label="Height demo action"]').getBoundingClientRect(),
        }));
        return {
          gap: rows[1].row.top - rows[0].row.bottom,
          height: tree.scrollHeight,
          actionsContained: rows.every(({row, action}) => action.top >= row.top && action.bottom <= row.bottom),
        };
      });
      assert(Math.abs(geometry.height - 156.5) <= 0.5, "Nonvirtual extent includes all row heights and only inter-row gaps");
      assert.equal(geometry.gap, 3.5);
      assert.equal(geometry.actionsContained, true);
      assert(await page.getByRole("tree", { name: "Minimum height", exact: true })
        .getByRole("treeitem").first().evaluate((row) => {
          const bounds = row.getBoundingClientRect(), action = row.querySelector("button[aria-label='Compact action']").getBoundingClientRect();
          return action.height >= 24 && action.top >= bounds.top && action.bottom <= bounds.bottom;
        }), "Compact actions fit the 24px minimum row height");
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
      for (const label of ["Guide LTR", "Guide RTL", "Guide zero"]) {
        const tree = page.getByRole("tree", { name: label, exact: true });
        for (const name of ["Guide first", "Guide last", "Guide sibling", "Guide folder"]) {
          const row = tree.getByRole("treeitem", { name, exact: true });
          const line = await row.evaluate((element) => {
            const guide = element.querySelector(".mt-tree-guide-direct");
            const toggle = element.querySelector(".mt-tree-toggle");
            const rtl = getComputedStyle(element).direction === "rtl";
            const r = element.getBoundingClientRect(), g = guide.getBoundingClientRect(), t = toggle.getBoundingClientRect();
            const elbow = getComputedStyle(guide, "::after");
            const inset = parseFloat(elbow.insetInlineStart) + parseFloat(getComputedStyle(guide).borderInlineStartWidth);
            const width = parseFloat(elbow.inlineSize);
            const direction = rtl ? -1 : 1;
            const origin = rtl ? g.right : g.left;
            const position = (point) => direction * (point - origin);
            const stub = getComputedStyle(toggle, "::before");
            return {
              inset,
              width,
              leafTarget: position((t.left + t.right) / 2) + 3.5,
              controlClearance: position(rtl ? t.right : t.left),
              y: g.top + parseFloat(elbow.top) - (r.top + r.height / 2),
              oldStub: stub.content !== "none",
              isLast: guide.classList.contains("mt-tree-guide-last"),
              trunkEndY: g.bottom - (r.top + r.height / 2),
            };
          });
          const branch = name === "Guide folder";
          assert(Math.abs(line.inset) < 0.6 && !line.oldStub,
            `A single segment starts on the trunk, not a disconnected leaf stub: ${label} ${name} ${JSON.stringify(line)}`);
          const end = line.inset + line.width;
          assert(Math.abs(end - (branch ? Math.max(0, line.controlClearance) : line.leafTarget)) < 0.6,
            `The elbow reaches the leaf end or stops at the button edge: ${label} ${name} ${JSON.stringify(line)}`);
          assert(Math.abs(line.y) < 0.6, "The horizontal connector is on the row center");
          if (line.isLast) assert(Math.abs(line.trunkEndY) < 0.6, "The last child's trunk also ends on center");
        }
        for (const name of ["Guide root", "Guide root leaf"]) {
          const row = tree.getByRole("treeitem", { name, exact: true });
          await expect(row).toHaveAttribute("aria-level", "1");
          await expect(row.locator(".mt-tree-guide")).toHaveCount(0);
          const toggle = row.locator(".mt-tree-toggle");
          assert.equal(await toggle.evaluate((el) => getComputedStyle(el, "::before").content), "none",
            `A top-level item does not paint an orphan dash: ${label} ${name}`);
          if (name === "Guide root") await expect(toggle.locator("svg")).toBeVisible();
        }
      }
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
      const dropRow = drag.getByRole("treeitem", { name: "Last", exact: true });
      await drag.getByRole("treeitem", { name: "Alpha", exact: true }).hover();
      await drag.getByRole("button", { name: "Drag row action" }).dragTo(dropRow);
      await expect(page.locator("output")).toHaveText("");
      await drag
        .getByRole("treeitem", { name: "Alpha", exact: true })
        .dragTo(drag.getByRole("treeitem", { name: "Last", exact: true }));
      await expect(page.locator("output")).toHaveText("a:z");
      await expect(page.locator(".mt-tree-drag-preview")).toHaveCount(0);
      const sort = page.getByRole("tree", { name: "Animated drag", exact: true });
      const sortRow = (name) => sort.getByRole("treeitem", { name, exact: true });
      await sort.scrollIntoViewIfNeeded();
      const moving = await sortRow("Moving").boundingBox();
      const first = await sortRow("First").boundingBox();
      let folder = await sortRow("Folder").boundingBox();
      const move = (box, y) => page.mouse.move(box.x + 65, box.y + y, { steps: 4 });
      const preview = page.locator(".mt-tree-drag-preview");
      await move(moving, 16);
      await page.mouse.down();
      await move(first, 3);
      await move(first, 3);
      await expect(preview).toBeVisible();
      await expect(preview).toContainText("Moving");
      assert.equal(await preview.evaluate((element) => getComputedStyle(element).opacity), "1");
      await expect(sortRow("First")).toHaveClass(/mt-tree-drop--1/);
      for (const y of [2, 13, 3, 29, 4]) {
        await move(first, y);
        assert.equal((await sortRow("Folder").boundingBox()).y, folder.y, "unrelated row stays still on hover");
        assert.equal((await sortRow("First").boundingBox()).y, first.y, "indicator never shifts the target row");
      }
      await move(folder, 16);
      await move(folder, 16);
      await expect(sortRow("Folder")).toHaveAttribute("aria-expanded", "true");
      const child = await sortRow("Child").boundingBox();
      await move(child, -1);
      await move(child, -1);
      await expect(sortRow("Child")).toHaveClass(/mt-tree-drop--1/);
      await page.mouse.up();
      await expect(sortRow("Moving")).toHaveAttribute("aria-level", "2");
      await expect(sortRow("Moving")).toHaveAttribute("aria-posinset", "1");
      await expect(preview).toHaveCount(0);
      await page.emulateMedia({ reducedMotion: "reduce" });
      const nested = await sortRow("Moving").boundingBox();
      await move(nested, 16);
      await page.mouse.down();
      await move(first, 3);
      await move(first, 3);
      await expect(preview).toBeVisible();
      assert.equal(await preview.evaluate((element) => element.getAnimations().length), 0,
        "reduced motion skips pickup animation but still shows drag feedback");
      await move(nested, 16);
      await move(nested, 16);
      await expect(preview.locator(".mt-tree-drag-invalid")).toBeVisible();
      await page.mouse.up();
      await expect(preview).toHaveCount(0);
      await expect(sortRow("Moving")).toHaveAttribute("aria-level", "2");
      await page.emulateMedia({ reducedMotion: "no-preference" });
      const sidebar = page.getByRole("complementary", { name: "文档导航侧栏" });
      const docs = sidebar.getByRole("tree", { name: "文档目录" });
      const guide = docs.getByRole("treeitem", { name: "使用指南", exact: true });
      const startDoc = docs.getByRole("treeitem", { name: "快速开始", exact: true });
      const longDoc = docs.getByRole("treeitem", { name: "如何在狭窄侧边栏中整理、维护和查阅标题很长的组件文档", exact: true });
      const archive = docs.getByRole("treeitem", { name: "归档文档", exact: true });
      await expect(startDoc).toHaveAttribute("aria-selected", "true");
      await expect(longDoc.locator(".mt-tree-title")).toHaveAttribute("data-overflow", "");
      const layout = await docs.evaluate((tree) => {
        const [first, second, long] = tree.querySelectorAll("[role=treeitem]");
        const numbers = [second, long].map((row) => row.querySelector(".mt-tree-end").getBoundingClientRect().right);
        const title = long.querySelector(".mt-tree-title");
        const indentation = (row) => row.querySelector(".mt-tree-toggle").getBoundingClientRect().left;
        return {
          sameCounterEnd: Math.abs(numbers[0] - numbers[1]) < 0.1,
          ellipsized: title.querySelector(".mt-hover-marquee-original").scrollWidth > title.clientWidth &&
            getComputedStyle(title.querySelector(".mt-hover-marquee-original")).textOverflow === "ellipsis",
          indent: indentation(second) - indentation(first),
          elbow: Number.parseFloat(getComputedStyle(second.querySelector(".mt-tree-guide-direct"), "::after").inlineSize),
        };
      });
      assert(layout.ellipsized && layout.sameCounterEnd, "long titles truncate without moving the right counters");
      assert(Math.abs(layout.indent - 26) < 0.1 && Math.abs(layout.elbow - 29.5) < 0.1,
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
      const actions = page.getByRole("tree", { name: "文档节点操作" });
      const manual = actions.getByRole("treeitem", { name: "项目手册", exact: true });
      const references = actions.getByRole("treeitem", { name: "参考资料", exact: true });
      const more = manual.getByRole("button", { name: "更多操作：项目手册" });
      const add = manual.getByRole("button", { name: "添加子文档：项目手册" });
      const hoverMore = references.locator('[aria-label="更多操作：参考资料"]');
      const inactiveAdd = references.locator('[aria-label="添加子文档：参考资料"]');
      await expect(more).toBeVisible();
      await expect(add).toBeVisible();
      await expect(hoverMore.locator("..")).toHaveCSS("opacity", "0");
      await expect(hoverMore).toHaveCSS("pointer-events", "none");
      await expect(inactiveAdd).toBeHidden();

      const measures = (row) => {
        const title = row.querySelector(".mt-tree-title").getBoundingClientRect();
        const controls = row.querySelector(".mt-tree-actions").getBoundingClientRect();
        const bounds = row.getBoundingClientRect();
        return { height: bounds.height, titleWidth: title.width, actionsWidth: controls.width, offsetFromEnd: bounds.right - controls.right };
      };
      const before = await references.evaluate(measures);
      const standardHeight = await tight.getByRole("treeitem").first().evaluate((row) => row.getBoundingClientRect().height);
      assert(Math.abs(before.height - standardHeight) < 0.1, "action content doesn't grow the node row");
      assert(Math.abs(before.offsetFromEnd - (await manual.evaluate(measures)).offsetFromEnd) < 0.1,
        "both action groups align at the logical row edge");
      await references.hover();
      await expect(hoverMore.locator("..")).toHaveCSS("opacity", "1");
      await expect(inactiveAdd).toBeHidden();
      const during = await references.evaluate(measures);
      assert(before.actionsWidth === 0 && during.actionsWidth > 0, "hidden hover controls take no space");
      assert(during.titleWidth < before.titleWidth && during.height === before.height,
        "reveal only takes width from the title");
      await page.mouse.move(0, 0);
      const long = actions.getByRole("treeitem", { name: "从电脑桌面端开始：完整的项目文档、协作流程和发布检查", exact: true });
      const marquee = long.locator(".mt-tree-title.mt-hover-marquee");
      await expect(marquee).toHaveAttribute("data-overflow", "");
      const marqueeTrack = marquee.locator(".mt-hover-marquee-text");
      await expect(marqueeTrack).toHaveCSS("animation-name", "none");
      // Enter on the stable leading side: row hover shrinks the label as
      // trailing controls appear, so its pre-hover midpoint is not the target.
      await marquee.hover({ position: { x: 8, y: 8 } });
      await expect(marqueeTrack).toHaveCSS("animation-name", "mt-hover-marquee-pan");
      await long.getByRole("button", { name: /更多操作/ }).hover();
      await expect(marqueeTrack).toHaveCSS("animation-name", "none");
      await page.mouse.move(0, 0);

      await manual.focus();
      await page.keyboard.press("Tab");
      await expect(more).toBeFocused();
      await page.keyboard.press("Enter");
      const pin = page.getByRole("menuitem", { name: "标记为常用" });
      await expect(pin).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(more).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(pin).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.getByText("「项目手册」已标记为常用。")).toBeVisible();
      await expect(manual).toHaveAttribute("aria-expanded", "false");
      await expect(manual).toHaveAttribute("aria-selected", "true");
      await expect(manual.locator(".mt-tree-end")).toHaveText("已标记");
      await expect(more).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(add).toBeFocused();
      await page.keyboard.press("Space");
      await expect(page.getByText("已在「项目手册」下添加新文档 1。")).toBeVisible();
      await expect(manual).toHaveAttribute("aria-expanded", "false");
      await expect(manual).toHaveAttribute("aria-selected", "true");
      await page.keyboard.press("Shift+Tab");
      await expect(more).toBeFocused();
      await manual.focus();
      await page.keyboard.press("ArrowRight");
      await expect(actions.getByRole("treeitem", { name: "新文档 1" })).toBeVisible();

      await references.focus();
      await expect(hoverMore.locator("..")).toHaveCSS("opacity", "1");
      await page.keyboard.press("Tab");
      await expect(hoverMore).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(pin).toBeFocused();
      await expect(hoverMore.locator("..")).toHaveCSS("opacity", "1");
      await page.keyboard.press("Escape");
      await expect(hoverMore).toBeFocused();
      await expect(references).toHaveAttribute("aria-selected", "false");
      await expect(references).toHaveAttribute("aria-expanded", "true");
      await page.evaluate(() => document.activeElement?.blur());
      await expect(hoverMore.locator("..")).toHaveCSS("opacity", "0");
      await expect(hoverMore).toHaveCSS("pointer-events", "none");
      await actions.evaluate((tree) => tree.setAttribute("dir", "rtl"));
      const rtl = await manual.evaluate((row) => {
        const controls = row.querySelector(".mt-tree-actions").getBoundingClientRect();
        const counter = row.querySelector(".mt-tree-end").getBoundingClientRect();
        const trailingAction = row.querySelector(".mt-tree-action").getBoundingClientRect();
        return { offset: controls.left - row.getBoundingClientRect().left, counterGap: counter.left - trailingAction.right };
      });
      assert(Math.abs(rtl.offset - before.offsetFromEnd) < 0.1 && rtl.counterGap > 0,
        "RTL puts the controls at the logical end, beyond passive endContent");
      await actions.evaluate((tree) => tree.removeAttribute("dir"));
      for (const width of [900, 375, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        await expect.poll(
          () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          { message: `no page overflow at ${width}px after layout settles` },
        ).toBe(true);
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
      const richTree = page.getByRole("tree", { name: "Rich titles", exact: true });
      const richRow = richTree.getByRole("treeitem", { name: "Rich document", exact: true });
      const richViewport = richRow.locator(".mt-tree-title");
      const richTrack = richViewport.locator(".mt-hover-marquee-text");
      const richGuide = richRow.getByRole("link", { name: "Guide", exact: true });
      const action = richRow.getByRole("button", { name: "More", exact: true });
      await expect(richViewport).toHaveAttribute("data-overflow", "");
      await expect(richViewport).toHaveAttribute("data-motion", "single");
      await expect(richViewport.locator(".mt-hover-marquee-copy")).toHaveCount(0);
      await expect(page.locator("#rich-title-inner")).toHaveCount(1);
      await expect(richGuide).toHaveCount(1);
      await expect(richTree.getByRole("treeitem", { name: "Short document" }).locator(".mt-tree-title"))
        .not.toHaveAttribute("data-overflow", "");
      await richViewport.hover({ position: { x: 8, y: 8 } });
      await expect(richTrack).toHaveCSS("animation-name", "mt-hover-marquee-pan");
      const actionBox = await action.boundingBox();
      const translation = await richTrack.evaluate((node) => {
        const animation = node.getAnimations()[0];
        const span = Number(animation.effect.getTiming().duration);
        const style = getComputedStyle(node);
        const arrive = parseFloat(style.getPropertyValue("--mt-marquee-tail-start")) / 100;
        const leave = parseFloat(style.getPropertyValue("--mt-marquee-tail-end")) / 100;
        const distance = parseFloat(style.getPropertyValue("--mt-marquee-distance"));
        animation.pause();
        const at = (fraction) => {
          animation.currentTime = span * fraction;
          return new DOMMatrix(getComputedStyle(node).transform).m41;
        };
        return { distance, end: at((arrive + leave) / 2), returning: at((leave + 1) / 2) };
      });
      assert(Math.abs(translation.end + translation.distance) < 0.6);
      assert(Math.abs(translation.returning * 2 - translation.end) < 1);
      assert.deepEqual(await action.boundingBox(), actionBox, "trailing actions do not move with rich labels");
      await expect(richViewport.locator(".mt-hover-marquee-copy")).toHaveCount(0);
      await action.hover();
      await expect(richTrack).toHaveCSS("animation-name", "none");

      await richRow.focus();
      await page.keyboard.press("Tab");
      await expect(richGuide).toBeFocused();
      await expect(richTrack).toHaveCSS("animation-name", "none");
      assert(await richGuide.evaluate((element) => {
        const b = element.getBoundingClientRect();
        const frame = element.closest(".mt-hover-marquee").getBoundingClientRect();
        return b.left >= frame.left - 1 && b.right <= frame.right + 1;
      }), "the clipped link is scrolled into view for keyboard focus");
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("rich-title-destination")).toHaveText("Opened");
      await expect(richRow).toHaveAttribute("aria-selected", "false");
      await page.keyboard.press("Tab");
      await expect(action).toBeFocused();

      await page.emulateMedia({ reducedMotion: "reduce" });
      await richViewport.hover({ position: { x: 8, y: 8 } });
      await expect(richTrack).toHaveCSS("animation-name", "none");
      await expect(richViewport).toHaveCSS("overflow-x", "auto");
      await page.emulateMedia({ reducedMotion: "no-preference" });

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

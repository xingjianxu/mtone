import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { createServer } from "vite";

const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 0 },
  logLevel: "error",
});
await server.listen();
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH,
  });
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const url = new URL("tests/fixtures/toolbar.html", server.resolvedUrls.local[0]);
  await page.goto(url.href);
  const equalPx = (actual, expected, description) => {
    assert(Math.abs(actual - expected) < 1, `${description}: ${actual} vs ${expected}`);
  };

  for (const [name, width, rtl, gray] of [
    ["Wide light", 680, false, false],
    ["Narrow light", 320, false, true],
    ["Wide dark RTL", 680, true, true],
    ["Narrow dark RTL", 320, true, false],
    ["Auto-width flex row", 608, false, false],
  ]) {
    const toolbar = page.getByRole("group", { name, exact: true });
    await expect(toolbar).toBeVisible();
    const metrics = await toolbar.evaluate((node, isGray) => {
      const box = (target) => (typeof target === "string" ? node.querySelector(target) : target).getBoundingClientRect().toJSON();
      const colorProbe = document.createElement("span");
      colorProbe.style.backgroundColor = isGray ? "var(--mt-subtle)" : "var(--mt-bg)";
      node.append(colorProbe);
      const color = getComputedStyle(node).backgroundColor;
      const expectedColor = getComputedStyle(colorProbe).backgroundColor;
      colorProbe.remove();
      return {
        toolbar: box(node), parent: box(node.parentElement), layout: box(".mt-toolbar-layout"),
        search: box(".mt-toolbar-search"), input: box(".mt-toolbar-search .mt-input-wrap"),
        start: box(".mt-toolbar-start"), end: box(".mt-toolbar-end"),
        buttons: Array.from(node.querySelectorAll(".mt-toolbar-end button"), box),
        color, expectedColor, scrollWidth: node.scrollWidth, clientWidth: node.clientWidth,
      };
    }, gray);
    const { toolbar: outer, parent, layout, search, input, start, end, buttons, color, expectedColor, scrollWidth, clientWidth } = metrics;
    const leading = (box) => rtl ? box.right : box.left;
    const trailing = (box) => rtl ? box.left : box.right;
    equalPx(outer.width, width, `${name}: uses available parent width`);
    if (name === "Auto-width flex row") {
      equalPx(outer.left - parent.left, 72, "Toolbar leaves room for the sibling");
      equalPx(outer.right, parent.right, "Toolbar fills the rest of the flex row");
    }
    equalPx(Math.abs(leading(layout) - leading(outer)), 12, `${name}: logical start padding`);
    equalPx(layout.top - outer.top, 8, `${name}: block start padding`);
    equalPx(trailing(end), trailing(layout), `${name}: actions align with logical end`);
    equalPx(input.width, search.width, `${name}: actual search control fills its slot`);
    equalPx(Math.abs(leading(buttons[1]) - trailing(buttons[0])), 8, `${name}: gap between actions`);
    assert.equal(color, expectedColor, `${name}: background is theme-aware`);
    assert(scrollWidth <= clientWidth + 1, `${name}: no horizontal overflow`);
    if (width === 320) {
      equalPx(search.width, layout.width, `${name}: full first row`);
      equalPx(start.top - search.bottom, 8, `${name}: gap before filters on second row`);
      equalPx(start.top, end.top, `${name}: filters and actions share the second row`);
    } else {
      equalPx(search.top, start.top, `${name}: search and filters share first row`);
      equalPx(start.top, end.top, `${name}: actions share first row`);
      equalPx(Math.abs(leading(start) - trailing(search)), 8, `${name}: horizontal gap`);
    }
    await toolbar.getByRole("textbox", { name: "Search" }).fill("query");
    await toolbar.getByRole("button", { name: "Create" }).click();
    await expect(page.getByLabel(`${name} result`)).toHaveText("Create");
  }
  url.searchParams.set("framed", "");
  await page.goto(url.href);
  for (const [size, name] of [["wide", "项目表格操作"], ["narrow", "窄容器项目操作"]]) {
    const demo = page.getByTestId(`${size}-frame-demo`);
    const toolbar = demo.getByRole("group", { name, exact: true });
    await expect(toolbar).toBeVisible();
    const metrics = await toolbar.evaluate((node) => {
      const frame = node.parentElement;
      const table = frame.querySelector(":scope > .mt-table-wrap");
      const edges = (element) => {
        const rules = getComputedStyle(element);
        return ["Top", "Right", "Bottom", "Left"].map((side) => rules[`border${side}Width`]);
      };
      const { borderTopLeftRadius: outerRadius, overflow } = getComputedStyle(frame);
      const { borderTopLeftRadius: tableRadius } = getComputedStyle(table);
      const toolbarBox = node.getBoundingClientRect();
      const tableBox = table.getBoundingClientRect();
      return { frame: edges(frame), toolbar: edges(node), table: edges(table), overflow,
        outerRadius, tableRadius, seam: toolbarBox.bottom - tableBox.top,
        left: toolbarBox.left - tableBox.left, right: toolbarBox.right - tableBox.right };
    });
    assert.deepEqual(metrics.frame, ["1px", "1px", "1px", "1px"], `${size}: one outer frame`);
    assert.deepEqual(metrics.toolbar, ["0px", "0px", "1px", "0px"], `${size}: one seam`);
    assert.deepEqual(metrics.table, ["0px", "0px", "0px", "0px"], `${size}: no nested Table frame`);
    assert.equal(metrics.outerRadius, "8px");
    assert.equal(metrics.tableRadius, "0px");
    assert.equal(metrics.overflow, "clip");
    equalPx(metrics.seam, 0, `${size}: joined surfaces`);
    equalPx(metrics.left, 0, `${size}: left edges join the outer frame`);
    equalPx(metrics.right, 0, `${size}: right edges join the outer frame`);
  }
  console.log("Toolbar: standalone container wrapping, logical alignment, theme surfaces, actions and composed Table frames verified");
} finally {
  await browser?.close();
  await server.close();
}

import assert from "node:assert/strict";
import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";

const server = await createServer({
  server: { host: "127.0.0.1", port: 5284, strictPort: true },
  logLevel: "error",
});
await server.listen();
let browser;
try {
  const engine = { chromium, firefox, webkit }[process.env.BROWSER || "chromium"];
  browser = await engine.launch({ headless: true, executablePath: process.env.BROWSER_PATH });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [320, 375, 1280]) {
    await page.setViewportSize({ width, height: 700 });
    await page.goto("http://127.0.0.1:5284/tests/fixtures/page-layout.html");
    const root = page.locator(".mt-page-layout");
    await expect(root.getByRole("heading", { level: 1 })).toBeVisible();
    const geometry = await root.evaluate((el) => {
      const boxes = [...el.querySelectorAll(".mt-page-layout-title, .mt-page-layout-actions, .mt-page-layout-tabs, .mt-page-layout-body, .mt-page-layout-description, .mt-page-layout-extra, .mt-page-layout-actions button")].map((item) => ({ box: item.getBoundingClientRect(), text: item.textContent?.trim(), className: item.className }));
      const rootBox = el.getBoundingClientRect();
      const probe = document.createElement("span");
      probe.style.color = "var(--mt-fg)";
      el.closest("[data-mt-theme]").append(probe);
      const themeColor = getComputedStyle(probe).color;
      probe.remove();
      return {
        offenders: boxes.filter(({ box }) => box.right > rootBox.right + 1).map(({ box, text, className }) => ({ text, className, right: box.right, width: box.width })),
        remaining: rootBox.width, scroll: el.scrollWidth,
        fitsViewport: document.documentElement.scrollWidth <= innerWidth,
        fitsParent: el.scrollWidth <= Math.ceil(rootBox.width) && boxes.every(({ box }) => box.right <= rootBox.right + 1),
        titleHeight: el.querySelector(".mt-page-layout-title").getBoundingClientRect().height,
        themed: themeColor !== "rgb(55, 53, 47)" && getComputedStyle(el).color === themeColor,
      };
    });
    assert(geometry.fitsViewport && geometry.fitsParent && geometry.themed, JSON.stringify({ width, geometry }));
    if (width === 320) assert(geometry.titleHeight > 30, "Unbroken heading wraps even in nested narrow content");
    const save = root.getByRole("button", { name: "Save draft" });
    if (width === 1280) {
      assert.equal((await save.boundingBox()).height, (await page.getByTestId("outside-button").boundingBox()).height);
    }
    const longButton = root.getByRole("button", { name: "Review 项目交付历史" });
    const content = await longButton.evaluate((button) => {
      const bounds = button.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(button);
      const lines = [...range.getClientRects()];
      return {
        fits: lines.every((line) => line.left >= bounds.left - 1 && line.right <= bounds.right + 1 && line.top >= bounds.top - 1 && line.bottom <= bounds.bottom + 1),
        rows: new Set(lines.map((line) => Math.round(line.top))).size,
      };
    });
    assert(content.fits && (width !== 320 || content.rows > 1), JSON.stringify({ width, content }));
    await save.click();
    await expect(root.getByText("Saved", { exact: true })).toBeVisible();
    await root.getByRole("tab", { name: "Week" }).click();
    await expect(root.getByRole("tabpanel", { name: "Week" })).toHaveText("Weekly activity");
    await expect(root.getByText("Project tasks")).toBeVisible();
  }
  for (const viewport of [1600, 320]) {
    await page.setViewportSize({ width: viewport, height: 700 });
    await page.goto("http://127.0.0.1:5284/tests/fixtures/page-layout.html?max-width");
    for (const [preset, cap] of [["default", Infinity], ["sm", 720], ["md", 960], ["lg", 1200], ["custom", 840]]) {
      const root = page.getByTestId(preset);
      await expect(root.getByRole("heading")).toBeVisible();
      const dimensions = await root.evaluate((node) => {
        const parent = node.parentElement;
        const parentBox = parent.getBoundingClientRect();
        const parentStyle = getComputedStyle(parent);
        const parentLeft = parentBox.left + parseFloat(parentStyle.paddingLeft);
        const parentRight = parentBox.right - parseFloat(parentStyle.paddingRight);
        const rootBox = node.getBoundingClientRect();
        const slots = [...node.querySelectorAll(
          ".mt-page-layout-header, .mt-page-layout-actions, .mt-page-layout-tabs, .mt-page-layout-body",
        )].map((element) => element.getBoundingClientRect());
        return {
          available: parentRight - parentLeft,
          width: rootBox.width,
          center: (rootBox.left + rootBox.right) / 2,
          parentCenter: (parentLeft + parentRight) / 2,
          viewportCenter: innerWidth / 2,
          fits: node.scrollWidth <= Math.ceil(rootBox.width) &&
            slots.length === 4 &&
            slots.every((slot) => slot.left >= rootBox.left - 1 && slot.right <= rootBox.right + 1),
          documentFits: document.documentElement.scrollWidth <= innerWidth,
        };
      });
      const context = JSON.stringify({ viewport, preset, dimensions });
      assert(Math.abs(dimensions.width - Math.min(cap, dimensions.available)) < 1, context);
      assert(Math.abs(dimensions.center - dimensions.parentCenter) < 1, context);
      assert(Math.abs(dimensions.center - dimensions.viewportCenter) > 4, context);
      assert(dimensions.fits && dimensions.documentFits, context);
    }
  }
  await page.setViewportSize({ width: 1280, height: 700 });
  for (const options of ["", "&narrow", "&rtl"]) {
    const narrow = options === "&narrow";
    await page.goto(`http://127.0.0.1:5284/tests/fixtures/page-layout.html?sidebar${options}`);
    for (const id of ["left-full", "right-main"]) {
      const root = page.getByTestId(id);
      await expect(root.getByRole("complementary", { name: "Filters" })).toBeVisible({ timeout: 1500 });
      const geometry = await root.evaluate((el) => {
        function box(selector) {
          const { x, y, right, bottom, width } = el.querySelector(selector).getBoundingClientRect();
          return { x, y, right, bottom, width };
        }
        return {
          root: el.getBoundingClientRect().width,
          fits: el.scrollWidth <= el.clientWidth,
          sidebar: box(".mt-sidebar"),
          header: box(".mt-page-layout-header"),
          tabs: box(".mt-page-layout-tabs"),
          body: box(".mt-page-layout-body"),
        };
      });
      const { sidebar, header, tabs, body } = geometry;
      const context = JSON.stringify({ options, id, geometry });
      const left = id === "left-full";
      assert(geometry.fits, context);
      assert.equal(geometry.root, narrow ? 360 : 840, context);
      assert.equal(header.width, tabs.width, context);
      assert.equal(header.width, left ? geometry.root : body.width, context);
      assert.equal(header.x, left ? Math.min(sidebar.x, body.x) : body.x, context);
      if (narrow) {
        assert.equal(sidebar.width, body.width, context);
        assert(left ? tabs.bottom < sidebar.y && sidebar.bottom < body.y : body.bottom < sidebar.y, context);
      } else {
        assert.equal(sidebar.width, left ? 240 : 200, context);
        assert(left ? sidebar.right < body.x : body.right < sidebar.x, context);
        assert.equal(sidebar.y, left ? body.y : header.y, context);
        if (left) assert(tabs.bottom < sidebar.y, context);
      }
    }
  }
  assert.deepEqual(errors, []);
  console.log("PageLayout responsive geometry, dark theme, and live actions/tabs passed");
} finally {
  await browser?.close();
  await server.close();
}

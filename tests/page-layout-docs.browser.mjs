import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, expect } from "@playwright/test";
import { createServer } from "vite";

const cacheDir = await mkdtemp(join(tmpdir(), "mtone-page-layout-docs-"));
let browser, server;
try {
  server = await createServer({
    root: "apps/docs",
    cacheDir,
    server: { host: "127.0.0.1", port: 0 },
    logLevel: "error",
  });
  await server.listen();
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_PATH || process.env.CHROMIUM_PATH,
  });
  const page = await browser.newPage();
  const url = new URL("#/components/PageLayout", server.resolvedUrls.local[0]);
  for (const viewport of [1440, 390]) {
    await page.setViewportSize({ width: viewport, height: 800 });
    url.searchParams.set("viewport", String(viewport));
    await page.goto(url.href);
    const heading = page.getByRole("heading", {
      name: "跨部门协同与项目交付记录",
      exact: true,
      level: 3,
    });
    const stage = page.locator(".component-demo-stage").filter({ has: heading });
    await expect(heading).toBeVisible();
    const geometry = await stage.locator(".mt-page-layout").evaluate((layout) => {
      const stage = layout.closest(".component-demo-stage");
      const styles = getComputedStyle(stage);
      const left = stage.getBoundingClientRect().left + stage.clientLeft;
      const start = left + parseFloat(styles.paddingLeft);
      const end = left + stage.clientWidth - parseFloat(styles.paddingRight);
      const { left: layoutLeft, right: layoutRight, width } = layout.getBoundingClientRect();
      return {
        available: end - start,
        centerOffset: (layoutLeft + layoutRight - start - end) / 2,
        fits: layout.scrollWidth <= Math.ceil(width) &&
          stage.scrollWidth <= stage.clientWidth &&
          document.documentElement.scrollWidth <= innerWidth,
        width,
      };
    });
    const message = JSON.stringify({ viewport, ...geometry });
    assert(viewport === 1440 ? geometry.available > 520 : geometry.available < 520, message);
    assert(Math.abs(geometry.width - Math.min(520, geometry.available)) < 1, message);
    assert(Math.abs(geometry.centerOffset) < 1 && geometry.fits, message);

    const sidebar = page.getByRole("complementary", { name: "资料分类" });
    const sidebarStage = page.locator(".component-demo-stage").filter({ has: sidebar });
    const sidebarLayout = sidebarStage.locator(".mt-page-layout");
    await expect(sidebar).toBeVisible();
    const layoutBoxes = () => sidebarLayout.evaluate((layout) => {
      const box = (selector) => {
        const { x, y, width, bottom, right } = layout.querySelector(selector).getBoundingClientRect();
        return { x, y, width, bottom, right };
      };
      return {
        side: box(".mt-sidebar"),
        header: box(".mt-page-layout-header"),
        tabs: box(".mt-page-layout-tabs"),
        body: box(".mt-page-layout-body"),
        width: layout.getBoundingClientRect().width,
        fits: layout.scrollWidth <= layout.clientWidth &&
          document.documentElement.scrollWidth <= innerWidth,
      };
    });
    const before = await layoutBoxes();
    assert(before.fits && before.header.width === before.width && before.tabs.width === before.width, JSON.stringify(before));
    assert(viewport === 1440 ? before.side.right < before.body.x : before.side.bottom < before.body.y,
      JSON.stringify(before));
    await sidebarStage.getByRole("button", { name: "侧栏：左侧" }).click();
    await sidebarStage.getByRole("button", { name: "仅主栏", exact: true }).click();
    const after = await layoutBoxes();
    assert(after.fits && after.header.width === after.body.width && after.tabs.width === after.body.width, JSON.stringify(after));
    assert(viewport === 1440 ? after.body.right < after.side.x : after.body.bottom < after.side.y,
      JSON.stringify(after));
    await sidebarStage.getByRole("button", { name: "页头跨整页，标签留在主栏" }).click();
    const split = await layoutBoxes();
    assert(split.fits && split.header.width === split.width && split.tabs.width === split.body.width,
      JSON.stringify(split));
    assert(split.tabs.x === split.body.x && split.header.bottom < split.side.y, JSON.stringify(split));
    assert(viewport === 1440 ? split.tabs.right < split.side.x && split.tabs.y === split.side.y :
      split.body.bottom < split.side.y, JSON.stringify(split));
    await sidebarStage.getByRole("tab", { name: "交付记录" }).click();
    await expect(sidebarStage.getByRole("tabpanel", { name: "交付记录" })).toContainText("最近交付");
  }
  console.log("PageLayout docs: centered and sidebar demos fit desktop/mobile; sidebar controls and tabs work");
} finally {
  await browser?.close();
  await server?.close();
  await rm(cacheDir, { recursive: true, force: true });
}

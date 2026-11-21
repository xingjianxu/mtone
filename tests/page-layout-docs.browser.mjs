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
  }
  console.log("PageLayout docs: composed demo is 520px centered on desktop, shrinks without overflow on mobile");
} finally {
  await browser?.close();
  await server?.close();
  await rm(cacheDir, { recursive: true, force: true });
}

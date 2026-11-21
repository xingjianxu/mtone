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
      const boxes = [...el.querySelectorAll(".mt-page-layout-title, .mt-page-layout-actions, .mt-page-layout-tabs, .mt-page-layout-body, .mt-page-layout-description, .mt-page-layout-extra, .mt-page-layout-actions button")].map((item) => item.getBoundingClientRect());
      const rootBox = el.getBoundingClientRect();
      const probe = document.createElement("span");
      probe.style.color = "var(--mt-fg)";
      el.closest("[data-mt-theme]").append(probe);
      const themeColor = getComputedStyle(probe).color;
      probe.remove();
      return {
        offenders: boxes.filter((box) => box.right > rootBox.right + 1).map((box) => ({ right: box.right, width: box.width })),
        remaining: rootBox.width, scroll: el.scrollWidth,
        fitsViewport: document.documentElement.scrollWidth <= innerWidth,
        fitsParent: el.scrollWidth <= Math.ceil(rootBox.width) && boxes.every((box) => box.right <= rootBox.right + 1),
        titleHeight: el.querySelector(".mt-page-layout-title").getBoundingClientRect().height,
        themed: themeColor !== "rgb(55, 53, 47)" && getComputedStyle(el).color === themeColor,
      };
    });
    assert(geometry.fitsViewport && geometry.fitsParent && geometry.themed, JSON.stringify({ width, geometry }));
    if (width === 320) assert(geometry.titleHeight > 30, "Unbroken heading wraps even in nested narrow content");
    await root.getByRole("button", { name: "Save draft" }).click();
    await expect(root.getByText("Saved", { exact: true })).toBeVisible();
    await root.getByRole("tab", { name: "Week" }).click();
    await expect(root.getByRole("tabpanel", { name: "Week" })).toHaveText("Weekly activity");
    await expect(root.getByText("Project tasks")).toBeVisible();
  }
  assert.deepEqual(errors, []);
  console.log("PageLayout responsive geometry, dark theme, and live actions/tabs passed");
} finally {
  await browser?.close();
  await server.close();
}

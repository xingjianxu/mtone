import { createServer } from "vite";
import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
const server = await createServer({
  root: "apps/docs",
  server: { host: "127.0.0.1", port: 5218, strictPort: true },
  logLevel: "error",
});
await server.listen();
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH,
  });
  const page = await browser.newPage();
  for (const width of [1280, 360]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("http://127.0.0.1:5218/#/components/CardGroup");
    await expect(
      page.getByRole("heading", { name: "CardGroup", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "移动端两列与跨列", exact: true }),
    ).toBeVisible();
    const group = page
      .getByRole("region", { name: "移动端两列与跨列" })
      .locator(".mt-card-group");
    const columns = await group.evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
    );
    assert.equal(columns, width < 768 ? 2 : 3);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.goto("http://127.0.0.1:5218/#/components/Card");
    await expect(
      page.getByRole("heading", { name: "Card", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "收起卡片", exact: true }).first(),
    ).toBeVisible();
  }
  console.log(
    "chromium: Card and CardGroup documentation routes and responsive previews passed",
  );
} finally {
  await browser?.close();
  await server.close();
}

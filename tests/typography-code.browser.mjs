import { chromium, expect } from "@playwright/test";
import { createServer } from "vite";

const server = await createServer({
  root: "apps/docs",
  server: { host: "127.0.0.1", port: 0 },
  logLevel: "error",
});
await server.listen();
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH });
  const page = await browser.newPage({ viewport: { width: 320, height: 680 }, colorScheme: "light" });
  await page.goto(server.resolvedUrls.local[0] + "#/components/Typography?section=Code");
  const title = page.getByRole("heading", { name: "Code", exact: true });
  await expect(title).toBeFocused();
  const block = page.getByLabel("配置示例", { exact: true });
  const inline = page.locator("code.mt-typography-code", { hasText: "npm test" });
  const inlineLegacy = page.locator(".mt-typography code", { hasText: "npm install @bixlab/mtone" }).first();
  await expect(block).toHaveCSS("white-space", "pre");
  await expect(inline).toHaveCSS("background-color", await inlineLegacy.evaluate((el) => getComputedStyle(el).backgroundColor));
  await expect(inline).toHaveCSS("padding-inline-start", "4px");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  expect(await block.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
  await expect(block).toHaveAttribute("tabindex", "0");
  await page.keyboard.press("Tab");
  await expect(block).toBeFocused();
  await expect(block).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => block.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.scrollX)).toBe(0);

  const light = await block.evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.getByRole("button", { name: "深色", exact: true }).click();
  await expect(block).not.toHaveCSS("background-color", light);
  await expect(inline).toHaveCSS("background-color", await block.evaluate((el) => getComputedStyle(el).backgroundColor));

  await page.setViewportSize({ width: 1550, height: 720 });
  await expect.poll(() => block.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(false);
  await expect(block).not.toHaveAttribute("tabindex", "0");
  console.log("Typography.Code semantic docs and keyboard scrolling verified");
} finally {
  await browser?.close();
  await server.close();
}

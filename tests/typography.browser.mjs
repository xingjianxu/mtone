import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 5221, strictPort: true },
  logLevel: "error",
});
await server.listen();
await mkdir("artifacts/typography-browser", { recursive: true });
let failed = false;
try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
    ["webkit", webkit],
  ]) {
    let browser;
    try {
      browser = await engine.launch({ headless: true });
      const page = await browser.newPage({
        viewport: { width: 800, height: 650 },
      });
      await page.goto("http://127.0.0.1:5221/tests/fixtures/typography.html");
      const content = page
        .getByTestId("clamp")
        .locator(".mt-typography-content");
      const collapsed = await content.boundingBox();
      assert(collapsed.height < 50);
      await page.getByRole("button", { name: "展开" }).click();
      assert((await content.boundingBox()).height > collapsed.height * 2);
      await page.getByRole("button", { name: "收起" }).click();
      assert((await content.boundingBox()).height < 50);
      assert((await page.getByTestId("single").boundingBox()).width === 180);
      await expect(page.getByTestId("danger-link")).toHaveCSS(
        "color",
        "rgb(212, 76, 71)",
      );
      await expect(page.getByTestId("single").locator("span")).toHaveCSS(
        "text-overflow",
        "ellipsis",
      );
      await page.getByRole("button", { name: "编辑" }).click();
      await expect(page.getByRole("textbox")).toBeFocused();
      await page.getByRole("textbox").fill("Updated");
      await page.keyboard.press("Enter");
      await expect(page.getByText("Updated", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "编辑" })).toBeFocused();
      await page.getByRole("button", { name: "编辑" }).click();
      await page.getByRole("textbox").fill("Cancelled");
      await page.keyboard.press("Escape");
      await expect(page.getByText("Updated", { exact: true })).toBeVisible();
      const quote = page.getByTestId("quote-default");
      await expect(quote).toHaveCSS("border-left-width", "3px");
      await expect(quote.locator("footer")).toHaveCSS("padding-top", "0px");
      await expect(quote.locator("footer")).toHaveCSS(
        "border-top-width",
        "0px",
      );
      await expect(quote.locator("footer")).toHaveCSS("display", "block");
      await expect(quote).toHaveCSS("background-color", "rgb(247, 247, 245)");
      await expect(page.getByTestId("quote-icon")).toHaveCSS(
        "border-left-color",
        "rgb(68, 131, 97)",
      );
      const quoteBox = await page.getByTestId("quote-icon").boundingBox();
      const iconBox = await page
        .getByTestId("quote-icon")
        .locator(".mt-blockquote-icon")
        .boundingBox();
      assert(Math.abs(iconBox.width - 28) < 1);
      assert(iconBox.y < quoteBox.y && iconBox.y + iconBox.height > quoteBox.y);
      await expect(page.getByTestId("quote-rtl")).toHaveCSS(
        "border-right-width",
        "3px",
      );
      await page.setViewportSize({ width: 375, height: 750 });
      const overflow = await page
        .getByTestId("quote-icon")
        .evaluate((el) => el.scrollWidth > el.clientWidth);
      assert(!overflow);
      await page.screenshot({
        path: `artifacts/typography-browser/${name}.png`,
        fullPage: true,
      });
      await page.setViewportSize({ width: 900, height: 800 });
      await page.goto(
        "http://127.0.0.1:5221/tests/fixtures/typography-docs.html",
      );
      for (const label of [
        "Title 标题",
        "Text 文本",
        "Paragraph 段落",
        "Link 链接",
        "Blockquote 引用",
      ]) {
        await expect(page.getByRole("region", { name: label })).toBeVisible();
      }
      await page.screenshot({
        path: `artifacts/typography-browser/${name}-docs.png`,
        fullPage: true,
      });
      console.log(`${name}: Typography passed`);
    } catch (error) {
      failed = true;
      console.error(name, error);
    } finally {
      await browser?.close();
    }
  }
} finally {
  await server.close();
}
if (failed) process.exitCode = 1;

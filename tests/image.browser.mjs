import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 5220, strictPort: true },
  logLevel: "error",
});
await server.listen();
await mkdir("artifacts/image-browser", { recursive: true });
let failed = false;
try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
    ["webkit", webkit],
  ]) {
    let browser, page;
    try {
      browser = await engine.launch();
      page = await browser.newPage({ viewport: { width: 900, height: 800 } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("http://127.0.0.1:5220/tests/fixtures/image.html");
      await expect(page.getByAltText("Fallback")).toHaveJSProperty(
        "naturalWidth",
        600,
      );
      const trigger = page.getByRole("button", { name: "预览 Single" });
      await trigger.click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await page.getByRole("button", { name: "放大", exact: true }).click();
      await expect(dialog.locator("img")).toHaveCSS(
        "transform",
        "matrix(1.5, 0, 0, 1.5, 0, 0)",
      );
      const canvas = dialog.locator(".mt-image-canvas");
      const box = await canvas.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(
        box.x + box.width / 2 + 40,
        box.y + box.height / 2 + 30,
      );
      await page.mouse.up();
      await expect(dialog.locator("img")).toHaveCSS(
        "transform",
        "matrix(1.5, 0, 0, 1.5, 40, 30)",
      );
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
      await page.getByRole("button", { name: "预览 First" }).click();
      await page.getByRole("button", { name: "下一张" }).focus();
      await page.keyboard.press("Enter");
      await expect(
        dialog.getByRole("button", { name: "下一张" }),
      ).toBeFocused();
      await expect(dialog.getByAltText("Second")).toBeVisible();
      await page.keyboard.press("Enter");
      await expect(dialog.getByAltText("Third")).toBeVisible();
      await page.keyboard.press("ArrowLeft");
      await expect(dialog.getByAltText("Second")).toBeVisible();
      await page.keyboard.press("Tab");
      // Base UI's focus guard redirects to the first control in requestAnimationFrame.
      // Await that actual focus destination rather than inspecting the transient guard.
      await expect(
        dialog.getByRole("button", { name: "关闭预览" }),
      ).toBeFocused();
      await page.getByRole("button", { name: "关闭预览" }).click();
      await expect(
        page.getByRole("button", { name: "预览 First" }),
      ).toBeFocused();
      await page.setViewportSize({ width: 320, height: 640 });
      await page.getByRole("button", { name: "预览 First" }).click();
      await expect(dialog).toBeVisible();
      // Opening focus is scheduled by Base UI; do not send keys to the old trigger.
      await expect(dialog.getByRole("button", { name: "关闭预览" })).toBeFocused();
      await page.keyboard.press("ArrowRight");
      await expect(dialog.getByAltText("Second")).toBeVisible();
      await page.keyboard.press("ArrowRight");
      await expect(dialog.getByAltText("Third")).toBeVisible();
      await page.getByRole("button", { name: "旋转", exact: true }).click();
      await expect(dialog.locator("img")).toHaveJSProperty("naturalWidth", 400);
      const rotated = await dialog.locator("img").boundingBox();
      const area = await canvas.boundingBox();
      assert(
        rotated.x >= area.x - 1 &&
          rotated.x + rotated.width <= area.x + area.width + 1 &&
          rotated.y >= area.y - 1 &&
          rotated.y + rotated.height <= area.y + area.height + 1,
        "rotated portrait fits canvas",
      );
      await page.screenshot({
        path: `artifacts/image-browser/${name}-mobile.png`,
        fullPage: true,
      });
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        "page does not overflow",
      );
      const bounds = await dialog.locator(".mt-image-toolbar").boundingBox();
      assert(
        bounds.x >= 0 && bounds.x + bounds.width <= 320,
        "toolbar fits narrow viewport",
      );
      assert.deepEqual(errors, []);
    } catch (e) {
      failed = true;
      console.error(name, e);
      if (page)
        await page
          .screenshot({ path: `artifacts/image-browser/${name}-failure.png` })
          .catch(() => {});
    } finally {
      await browser?.close();
    }
  }
} finally {
  await server.close();
}
if (failed) process.exitCode = 1;

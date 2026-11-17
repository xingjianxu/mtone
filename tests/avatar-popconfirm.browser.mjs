import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 5203, strictPort: true },
  logLevel: "error",
});
await server.listen();
await mkdir("artifacts/avatar-popconfirm-browser", { recursive: true });
let failed = false;
try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
    ["webkit", webkit],
  ]) {
    if(process.env.COMPONENT_BROWSERS && !process.env.COMPONENT_BROWSERS.split(",").includes(name)) continue;
    let browser, page;
    try {
      browser = await engine.launch({ headless: true, ...(name === "chromium" && process.env.CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.CHROMIUM_EXECUTABLE_PATH} : {}) });
      page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(
        "http://127.0.0.1:5203/tests/fixtures/avatar-popconfirm.html",
      );
      await expect(page.getByTestId("bad-image")).toHaveText("FA");
      await expect(page.getByTestId("responsive")).toHaveCSS("width", "48px");
      const fit = await page.getByTestId("long").evaluate((el) => {
        const a = el.getBoundingClientRect(),
          t = el.querySelector(".mt-avatar-text").getBoundingClientRect();
        return t.width <= a.width - 7;
      });
      assert(fit, "text must fit inside avatar");
      await page.getByRole("button", { name: "Show 2 more members" }).focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("dialog")).toContainText("Bob");
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
      const trigger = page.getByRole("button", { name: "Delete", exact: true });
      await trigger.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("dialog")).toHaveAccessibleName(
        "Delete record?",
      );
      await expect(
        page.getByRole("button", { name: "Cancel", exact: true }),
      ).toBeFocused();
      assert(
        await page.getByRole("dialog").evaluate((el) => !el.closest("main")),
        "popup escapes overflow container",
      );
      await page.keyboard.press("Escape");
      await expect(trigger).toBeFocused();
      await trigger.click();
      await page.getByRole("button", { name: "OK", exact: true }).click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(page.getByTestId("calls")).toHaveText("1");
      await page.getByLabel("Fail save").check();
      await page.getByRole("button", { name: "Save asynchronously" }).click();
      await page.getByRole("button", { name: "OK", exact: true }).click();
      await expect(
        page.getByRole("button", { name: "OK", exact: true }),
      ).toBeDisabled();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByRole("alert")).toBeVisible();
      await expect(page.getByTestId("calls")).toHaveText("2");
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await page.getByLabel("Fail save").uncheck();
      await page.getByRole("button", { name: "Save asynchronously" }).click();
      await page.getByRole("button", { name: "OK", exact: true }).click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(page.getByTestId("calls")).toHaveText("3");
      for (const width of [375, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await expect(page.getByTestId("responsive")).toHaveCSS("width", "24px");
        for (const placement of [
          "Wide trigger",
          "topLeft",
          "top",
          "topRight",
          "leftTop",
          "left",
          "leftBottom",
          "rightTop",
          "right",
          "rightBottom",
          "bottomLeft",
          "bottom",
          "bottomRight",
        ]) {
          await page
            .getByRole("button", { name: placement, exact: true })
            .click();
          const popup = page.getByRole("dialog");
          await expect(popup).toBeVisible();
          await expect(popup).toHaveCSS("overflow", "visible");
          await expect(popup).toHaveCSS("padding", "12px");
          await expect
            .poll(async () => {
              const b = await popup.boundingBox();
              return b && b.x >= -1 && b.x + b.width <= width + 1;
            })
            .toBeTruthy();
          await page.keyboard.press("Escape");
          await expect(popup).toHaveCount(0);
        }
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          "page fits narrow viewport",
        );
      }
      await page.screenshot({
        path: `artifacts/avatar-popconfirm-browser/${name}.png`,
        fullPage: true,
      });
      assert.deepEqual(errors, []);
      console.log(`${name}: passed`);
    } catch (e) {
      failed = true;
      console.error(name, e);
      if (page)
        await page
          .screenshot({
            path: `artifacts/avatar-popconfirm-browser/${name}-failure.png`,
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

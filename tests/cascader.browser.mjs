import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 5222, strictPort: true },
  logLevel: "error",
});
await server.listen();
await mkdir("artifacts/cascader-browser", { recursive: true });
let failed = false;
try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
    ["webkit", webkit],
  ]) {
    let browser, page;
    try {
      browser = await engine.launch({ headless: true });
      page = await browser.newPage({ viewport: { width: 375, height: 760 } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("http://127.0.0.1:5222/tests/fixtures/cascader.html");
      const trigger = page.getByRole("combobox", {
        name: "Location",
        exact: true,
      });
      await trigger.press("ArrowDown");
      const popup = page.getByRole("dialog");
      await expect(
        popup.getByRole("treeitem", { name: "Asia", exact: true }),
      ).toBeFocused();
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      await expect(trigger).toContainText("Asia / China / Shanghai");
      await expect(trigger).toBeFocused();
      await page.getByRole("button", { name: "Clear selection" }).click();
      await expect(trigger).toContainText("Select");
      await page
        .getByRole("combobox", { name: "Search location", exact: true })
        .click();
      await page.getByRole("searchbox").fill("Asia Beijing");
      await page.getByRole("searchbox").press("ArrowDown");
      await page.keyboard.press("Enter");
      await expect(
        page.getByRole("combobox", { name: "Search location", exact: true }),
      ).toContainText("Beijing");
      await page
        .getByRole("combobox", { name: "Multiple", exact: true })
        .click();
      await popup
        .getByRole("checkbox", { name: "Select Asia", exact: true })
        .click();
      await expect(
        page.getByRole("combobox", { name: "Multiple", exact: true }),
      ).toContainText("1 selected");
      await page.keyboard.press("Escape");
      await page.screenshot({
        path: `artifacts/cascader-browser/${name}.png`,
        fullPage: true,
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(errors).toEqual([]);
    } catch (e) {
      failed = true;
      console.error(name, e);
      if (page)
        await page
          .screenshot({
            path: `artifacts/cascader-browser/${name}-failure.png`,
          })
          .catch(() => {});
    } finally {
      await browser?.close();
    }
  }
} finally {
  await server.close();
}
if (failed) process.exit(1);

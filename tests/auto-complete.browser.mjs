import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 5217, strictPort: true },
  logLevel: "error",
});
await server.listen();
await mkdir("artifacts/auto-complete-browser", { recursive: true });
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
      await page.goto(
        "http://127.0.0.1:5217/tests/fixtures/auto-complete.html",
      );
      const input = page.getByRole("combobox", { name: "Query" });
      await input.fill("free");
      await expect(page.getByRole("option", { name: "Alice" })).toBeVisible();
      await input.press("ArrowDown");
      await input.press("ArrowDown");
      await input.press("Enter");
      await expect(input).toHaveValue("free");
      await input.press("ArrowDown");
      await input.press("Enter");
      await expect(input).toHaveValue("bob");
      await page.getByRole("button", { name: /Clear|清除/ }).click();
      await expect(input).toHaveValue("");
      await input.fill("anything");
      await input.press("Escape");
      await expect(input).toHaveValue("anything");
      await expect(page.getByRole("listbox")).toHaveCount(0);
      await expect(input).toBeFocused();
      const border = await input.evaluate(
        (el) => getComputedStyle(el.parentElement).borderColor,
      );
      expect(border).toBe("rgb(147, 180, 220)");
      const group = page.getByRole("combobox", { name: "Grouped" });
      await group.click();
      await expect(page.getByRole("option")).toHaveCount(1);
      await expect(page.getByText("People")).toBeVisible();
      await page.screenshot({
        path: `artifacts/auto-complete-browser/${name}.png`,
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
            path: `artifacts/auto-complete-browser/${name}-failure.png`,
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

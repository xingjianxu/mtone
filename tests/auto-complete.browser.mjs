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
  ].filter(
    ([name]) =>
      !process.env.MTONE_BROWSER || process.env.MTONE_BROWSER === name,
  )) {
    let browser, page;
    try {
      browser = await engine.launch({
        headless: true,
        ...(name === "chromium" && process.env.CHROMIUM_PATH
          ? { executablePath: process.env.CHROMIUM_PATH }
          : {}),
      });
      page = await browser.newPage({ viewport: { width: 375, height: 760 } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(
        "http://127.0.0.1:5217/tests/fixtures/auto-complete.html",
      );
      const input = page.getByRole("combobox", { name: "Query" });
      await input.fill("free");
      await expect(page.getByRole("option", { name: "Alice" })).toBeVisible();
      const emptyLiveRegion = page
        .locator(".mt-auto-complete-popup [role=status]")
        .last();
      await expect(emptyLiveRegion).toHaveText("");
      expect(
        await emptyLiveRegion.evaluate(
          (el) => el.getBoundingClientRect().height,
        ),
      ).toBe(0);
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
      expect(
        await page
          .locator(".mt-auto-complete-empty")
          .evaluate((el) => el.getBoundingClientRect().height),
      ).toBe(0);
      const popupTop = (
        await page.locator(".mt-auto-complete-popup").boundingBox()
      ).y;
      const labelTop = (await page.getByText("People").boundingBox()).y;
      expect(labelTop - popupTop).toBeLessThan(10);

      await page.screenshot({
        path: `artifacts/auto-complete-browser/${name}.png`,
        fullPage: true,
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      for (const [label, text] of [
        ["Empty", /No suggestions|无匹配建议/],
        ["Custom empty", "Nothing yet"],
      ]) {
        await page.keyboard.press("Escape");
        await page.getByRole("combobox", { name: label, exact: true }).click();
        const message = page.locator(".mt-auto-complete-empty");
        await expect(message).toHaveText(text);
        expect(
          await message.evaluate((el) => getComputedStyle(el).paddingTop),
        ).toBe("8px");
      }
      for (const label of [
        "Loading empty",
        "Loading suggestions",
        "Suppressed empty",
      ]) {
        await page.keyboard.press("Escape");
        await page.getByRole("combobox", { name: label, exact: true }).click();
        const empty = page.locator(".mt-auto-complete-empty");
        await expect(empty).toHaveText("");
        expect(
          await empty.evaluate((el) => el.getBoundingClientRect().height),
        ).toBe(0);
        if (label.startsWith("Loading"))
          await expect(page.getByText(/Loading…|加载中…/)).toBeVisible();
      }
      await page.screenshot({
        path: `artifacts/auto-complete-browser/${name}-empty-states.png`,
        fullPage: true,
      });
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

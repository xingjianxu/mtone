import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import assert from "node:assert/strict";
const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 5217, strictPort: true },
  logLevel: "error",
});
await server.listen();
try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
    ["webkit", webkit],
  ]) {
    if (
      process.env.CARD_GROUP_BROWSER &&
      name !== process.env.CARD_GROUP_BROWSER
    )
      continue;
    const browser = await engine.launch({
      headless: true,
      ...(name === "chromium" && process.env.CHROMIUM_PATH
        ? { executablePath: process.env.CHROMIUM_PATH }
        : {}),
    });
    try {
      const page = await browser.newPage({
        viewport: { width: 1100, height: 800 },
      });
      await page.goto("http://127.0.0.1:5217/tests/fixtures/card-group.html");
      const fold = page.getByTestId("fold"),
        toggle = fold.getByRole("button", { name: "Collapse card" });
      await page.getByLabel("Draft").fill("Retained draft");
      await fold.getByRole("button", { name: "Action 0" }).click();
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      await toggle.focus();
      await page.keyboard.press("Enter");
      await expect(
        fold.getByRole("button", { name: "Expand card" }),
      ).toBeFocused();
      await expect(page.getByLabel("Draft")).toBeHidden();
      await expect(
        fold.getByRole("button", { name: "Action 1" }),
      ).toBeVisible();
      await page.keyboard.press("Space");
      await expect(page.getByLabel("Draft")).toHaveValue("Retained draft");
      for (const width of [1100, 360]) {
        await page.setViewportSize({ width, height: 800 });
        const items = page
          .getByTestId("group")
          .locator(":scope > .mt-card-group-item");
        const a = await items.nth(0).boundingBox(),
          b = await items.nth(1).boundingBox(),
          c = await items.nth(2).boundingBox();
        if (width > 768) {
          assert(Math.abs(a.y - b.y) < 1);
          assert(a.width > b.width * 1.9);
          assert(
            Math.abs(a.height - b.height) < 1,
            "divider item should span the full row",
          );
          assert(c.y > a.y);
          assert.equal(
            await items
              .nth(1)
              .evaluate((el) => getComputedStyle(el, "::before").opacity),
            "1",
          );
        } else {
          assert(b.y > a.y && c.y > b.y);
          assert(Math.abs(a.width - b.width) < 1);
          assert.equal(
            await items
              .nth(1)
              .evaluate((el) => getComputedStyle(el, "::before").opacity),
            "0",
          );
        }
        assert.equal(
          await items
            .nth(2)
            .evaluate((el) => getComputedStyle(el, "::after").opacity),
          "1",
        );
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        if (process.env.CARD_GROUP_SCREENSHOTS)
          await page.screenshot({
            path: `/tmp/card-group-${width}.png`,
            fullPage: true,
          });
      }
      const vertical = page
        .getByTestId("vertical")
        .locator(":scope > .mt-card-group-item");
      assert.equal(
        await vertical
          .nth(1)
          .evaluate((el) => getComputedStyle(el, "::after").opacity),
        "1",
      );
      console.log(
        `${name}: Card collapse keyboard/state and CardGroup responsive spans/dividers passed`,
      );
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}

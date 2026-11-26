import assert from "node:assert/strict";
import { createServer } from "vite";
import { chromium, expect, firefox, webkit } from "@playwright/test";

const url = "http://127.0.0.1:5292/tests/fixtures/app-layout.html";
const server = await createServer({
  server: { host: "127.0.0.1", port: 5292, strictPort: true },
  logLevel: "error",
});
await server.listen();
let browser;
try {
  const engine = { chromium, firefox, webkit }[
    process.env.BROWSER || "chromium"
  ];
  browser = await engine.launch({
    headless: true,
    executablePath: process.env.BROWSER_PATH,
  });
  const page = await browser.newPage({
    viewport: { width: 1100, height: 640 },
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url);
  const main = page.getByRole("main");
  const nav = page.getByRole("navigation", { name: "Team navigation" });
  const account = page.getByRole("button", { name: "Team member" });
  await expect(main.getByRole("heading", { name: "Projects" })).toBeVisible();
  await expect(page.getByRole("banner")).toHaveCount(0);
  await expect(page.getByRole("tablist")).toHaveCount(0);
  await expect(nav.getByRole("button").first()).toHaveAttribute(
    "aria-current",
    "page",
  );

  for (const width of [1100, 320]) {
    await page.setViewportSize({ width, height: 640 });
    const rects = await page.locator(".mt-app-layout").evaluate((root) => {
      const side = root
        .querySelector(".mt-app-layout-sidebar")
        .getBoundingClientRect();
      const main = root.querySelector("main").getBoundingClientRect();
      return {
        sideWidth: side.width,
        sideRight: side.right,
        mainLeft: main.left,
        bounded: document.documentElement.scrollWidth <= innerWidth,
        height: root.getBoundingClientRect().height,
      };
    });
    assert(rects.bounded && Math.abs(rects.sideRight - rects.mainLeft) < 1);
    assert.equal(rects.height, 640);
    assert(Math.abs(rects.sideWidth - Math.min(240, width * 0.4)) < 1);

    const start = await account.boundingBox();
    await nav.getByRole("button").last().scrollIntoViewIfNeeded();
    assert.deepEqual(
      await account.boundingBox(),
      start,
      "navigation scroll keeps account at bottom",
    );
    assert.equal(await main.evaluate((el) => el.scrollTop), 0);
    await main.getByText("End of projects").scrollIntoViewIfNeeded();
    assert.deepEqual(
      await account.boundingBox(),
      start,
      "main scroll keeps sidebar fixed",
    );
    assert((await main.evaluate((el) => el.scrollTop)) > 0);
    await main.evaluate((el) => {
      el.scrollTop = 0;
    });

    await account.focus();
    await account.press("ArrowDown");
    const menu = page.getByRole("menu", { name: "Account actions" });
    await expect(menu).toBeVisible();
    const popup = await menu.boundingBox();
    assert(popup.y + popup.height <= start.y, "account menu opens upward");
    assert(
      popup.x >= 0 && popup.x + popup.width <= width + 1,
      "menu stays inside narrow viewport",
    );
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(account).toBeFocused();
    await account.click();
    await menu.getByRole("menuitem", { name: "Profile", exact: true }).click();
    await expect(main.getByRole("status")).toHaveText("Profile opened");
    await expect(menu).toBeHidden();
  }
  assert.deepEqual(errors, []);
  console.log(
    "AppLayout: navigation and main scroll independently; bottom menu opens upward at desktop and narrow widths",
  );
} finally {
  await browser?.close();
  await server.close();
}

import assert from "node:assert/strict";
import { createServer } from "vite";
import { chromium, expect } from "@playwright/test";

const server = await createServer({
  configFile: false,
  optimizeDeps: { entries: ["tests/fixtures/admin-layout-header.html", "tests/fixtures/app-layout.html"] },
  server: { host: "127.0.0.1", port: 0 },
  logLevel: "error",
});
await server.listen();
let browser;
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH,
  });
  const page = await browser.newPage();
  const fixture = new URL(
    "tests/fixtures/admin-layout-header.html",
    server.resolvedUrls.local[0],
  ).href;
  for (const mode of ["extra", "children"]) {
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 720 });
      await page.goto(fixture + (mode === "children" ? "?children" : ""));
      await page.getByRole("button", { name: "Action" }).waitFor();
      await page
        .locator(`.mt-layout-sider[data-collapsed="${width === 390}"]`)
        .waitFor();
      const { brand, header, button, controlCenter, padding, breadcrumb } =
        await page.evaluate(() => {
          const heading = document.querySelector(".mt-sidebar-heading");
          const topbar = document.querySelector(".mt-layout-header");
          const action = topbar.querySelector("button");
          const rect = (el) => el.getBoundingClientRect().toJSON();
          return {
            brand: rect(heading),
            header: rect(topbar),
            button: rect(action),
            controlCenter:
              topbar.getBoundingClientRect().top + topbar.clientHeight / 2,
            padding: [
              getComputedStyle(heading).paddingBlock,
              getComputedStyle(topbar).paddingBlock,
            ],
            breadcrumb: topbar
              .querySelector(".mt-breadcrumb")
              ?.getBoundingClientRect().height,
          };
        });
      assert.equal(
        header.bottom,
        brand.bottom,
        `${mode} ${width}: brand=${brand.height}, header=${header.height}`,
      );
      assert.equal(header.height, 48);
      assert.deepEqual(padding, ["0px", "0px"]);
      assert.equal(button.height, 32);
      assert.ok(Math.abs(button.top + button.height / 2 - controlCenter) < 0.5);
      assert.ok(
        button.right <= header.right && button.left >= header.left,
        JSON.stringify({ mode, width, button, header }),
      );
      if (mode === "extra") assert.equal(breadcrumb, 20);
      const content = page.locator(".mt-layout-content");
      assert(
        await content.evaluate((el) => {
          el.scrollTop = 120;
          return el.scrollTop === 120;
        }),
      );
      assert.equal(
        await page
          .locator(".mt-layout-header")
          .evaluate((el) => el.getBoundingClientRect().bottom),
        header.bottom,
      );
    }
  }
  await page.setViewportSize({ width: 290, height: 720 });
  await page.goto(fixture + "?demo");
  const demo = page.getByRole("button", { name: "更多操作" });
  await demo.waitFor();
  await demo.press("Enter");
  await page.getByRole("menuitem", { name: "查看通知" }).click();
  await page.getByText("暂时没有新通知。").waitFor();
  await page.getByRole("menu").waitFor({ state: "hidden" });

  const appPage = await browser.newPage({
    viewport: { width: 1100, height: 640 },
  });
  const errors = [];
  appPage.on("pageerror", (error) => errors.push(error.message));
  await appPage.goto(new URL("tests/fixtures/app-layout.html", server.resolvedUrls.local[0]).href);
  const main = appPage.getByRole("main");
  const nav = appPage.getByRole("navigation", { name: "Team navigation" });
  const account = appPage.getByRole("button", { name: "Team member" });
  await expect(main.getByRole("heading", { name: "Projects" })).toBeVisible();
  await expect(appPage.getByRole("banner")).toHaveCount(0);
  await expect(appPage.getByRole("tablist")).toHaveCount(0);
  await expect(nav.getByRole("button").first()).toHaveAttribute(
    "aria-current",
    "page",
  );

  for (const width of [1100, 320]) {
    await appPage.setViewportSize({ width, height: 640 });
    const rects = await appPage.locator(".mt-app-layout").evaluate((root) => {
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
    const menu = appPage.getByRole("menu", { name: "Account actions" });
    await expect(menu).toBeVisible();
    const popup = await menu.boundingBox();
    assert(popup.y + popup.height <= start.y, "account menu opens upward");
    assert(
      popup.x >= 0 && popup.x + popup.width <= width + 1,
      "menu stays inside narrow viewport",
    );
    await appPage.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(account).toBeFocused();
    await account.click();
    await menu.getByRole("menuitem", { name: "Profile", exact: true }).click();
    await expect(main.getByRole("status")).toHaveText("Profile opened");
    await expect(menu).toBeHidden();
  }
  assert.deepEqual(errors, []);

  console.log(
    "AdminLayout and AppLayout: header alignment, narrow composition, independent scroll, bottom account menu passed",
  );
} finally {
  await browser?.close();
  await server.close();
}

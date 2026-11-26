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

  await demo.press("Enter");
  await page.getByRole("menu").waitFor();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
  await expect(demo).toBeFocused();

  for (const width of [1000, 320]) {
    await page.setViewportSize({ width, height: 720 });
    await page.goto(fixture + "?topbar");
    const bar = page.getByRole("banner");
    await expect(bar).toHaveCount(1);
    await expect(bar.getByText("产品架构与设计规范")).toBeVisible();
    const record = bar.getByRole("button", { name: "记录版本" });
    await expect(record).toBeInViewport();
    await expect(bar.getByRole("button", { name: "账号菜单" })).toBeInViewport();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await record.click();
    await expect(page.getByRole("status")).toHaveText("已记录新版本");
    if (width === 320) {
      const more = bar.getByRole("button", { name: "更多操作" });
      await expect(more).toBeInViewport();
      await more.press("Enter");
      await page.getByRole("menuitem", { name: "通知", exact: true }).click();
      await expect(page.getByRole("status")).toHaveText("已选择通知");
      await expect(page.getByRole("menu")).toBeHidden();
    } else {
      await expect(bar.getByText("已保存 · v19")).toBeVisible();
      await expect(bar.getByRole("button", { name: "通知", exact: true })).toBeInViewport();
    }
  }

  for (const width of [1000, 320]) {
    await page.setViewportSize({ width, height: 720 });
    await page.goto(fixture + "?topbar-center");
    const bar = page.getByRole("banner");
    const group = bar.getByRole("group", { name: "文档模式" });
    await expect(group).toBeVisible();
    const rootBox = await bar.boundingBox();
    const groupBox = await group.boundingBox();
    assert(Math.abs(rootBox.x + rootBox.width / 2 - groupBox.x - groupBox.width / 2) < 1,
      "the center follows the full bar, not the gap between unequal sides");
    await group.getByRole("button", { name: "预览" }).click();
    await expect(page.getByRole("status")).toHaveText("当前模式：预览");
    await expect(bar.getByRole("button", { name: "分享" })).toBeInViewport();
  }

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
  const resizeFixture = new URL("tests/fixtures/app-layout.html", server.resolvedUrls.local[0]);
  await appPage.setViewportSize({ width: 1100, height: 640 });
  await appPage.goto(resizeFixture.href + "?resize=true");
  const sidebar = appPage.locator(".mt-app-layout-sidebar");
  const divider = appPage.getByRole("separator");
  const collapse = appPage.getByRole("button", { name: "Collapse sidebar" });
  const expand = appPage.getByRole("button", { name: "Expand sidebar" });
  const navIcon = nav.getByRole("button", { name: "Workspace navigation page 1", exact: true });
  const sidebarWidth = async () => Math.round((await sidebar.boundingBox()).width);
  await expect.poll(sidebarWidth).toBe(240);
  await expect(divider).toBeVisible();
  const grip = await divider.boundingBox();
  await appPage.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
  await appPage.mouse.down();
  await appPage.mouse.move(grip.x + grip.width / 2 + 45, grip.y + grip.height / 2, { steps: 10 });
  await appPage.mouse.up();
  await expect.poll(sidebarWidth).toBe(285);
  await divider.focus();
  await divider.press("ArrowLeft");
  await expect.poll(sidebarWidth).toBeLessThan(285);
  const draggedWidth = await sidebarWidth();
  await collapse.click();
  await expect.poll(sidebarWidth).toBe(52);
  await expect(divider).toBeHidden();
  await expect(expand).toBeFocused();
  await expect(navIcon.locator("svg")).toBeVisible();
  await expect(navIcon.locator(".mt-sidebar-sr-only")).toHaveText("Workspace navigation page 1");
  await updateMenu();
  await expand.click();
  await expect.poll(sidebarWidth).toBe(draggedWidth);
  await expect(divider).toBeVisible();
  await appPage.setViewportSize({ width: 320, height: 640 });
  await expect(divider).toBeHidden();
  await expect.poll(sidebarWidth).toBe(128);
  await collapse.click();
  await expect.poll(sidebarWidth).toBe(52);
  assert(await appPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

  await appPage.setViewportSize({ width: 1100, height: 640 });
  await appPage.goto(resizeFixture.href + "?resize=natural");
  await expect(main.getByText("End of projects")).toBeInViewport();
  assert((await main.boundingBox()).height > 40);
  assert(Math.abs((await main.boundingBox()).height - (await sidebar.boundingBox()).height) < 1);

  async function updateMenu() {
    await account.click();
    const menu = appPage.getByRole("menu", { name: "Account actions" });
    await expect(menu).toBeVisible();
    await menu.getByRole("menuitem", { name: "Profile", exact: true }).click();
    await expect(main.getByRole("status")).toHaveText("Profile opened");
    await expect(menu).toBeHidden();
  }
  assert.deepEqual(errors, []);

  console.log(
    "AdminLayout, Topbar and AppLayout: header alignment, narrow composition, independent scroll and account menus passed",
  );
} finally {
  await browser?.close();
  await server.close();
}

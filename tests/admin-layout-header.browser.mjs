import assert from "node:assert/strict";
import { createServer } from "vite";
import { chromium } from "@playwright/test";

const server = await createServer({
  configFile: false,
  optimizeDeps: { entries: ["tests/fixtures/admin-layout-header.html"] },
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

  console.log(
    "AdminLayout: fixed and centered header, narrow breadcrumb, responsive sidebar and scroll passed",
  );
} finally {
  await browser?.close();
  await server.close();
}

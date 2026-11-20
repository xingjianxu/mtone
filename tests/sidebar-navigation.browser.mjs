import assert from "node:assert/strict";
import { chromium, firefox, webkit } from "@playwright/test";
import { createServer } from "vite";

const serve = async (root, cacheDir) => {
  const server = await createServer({
    root,
    cacheDir,
    server: { host: "127.0.0.1", port: 0 },
    logLevel: "error",
  });
  await server.listen();
  return server;
};
const fixtureServer = await serve(
  process.cwd(),
  "node_modules/.vite-sidebar-fixture",
);
const docsServer = await serve(
  "apps/docs",
  "../../node_modules/.vite-sidebar-docs",
);
const fixtureURL = fixtureServer.resolvedUrls.local[0];
const docsURL = docsServer.resolvedUrls.local[0];

const sizes = (rows) =>
  rows.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().height),
  );
const gap = (first, second) =>
  first.evaluate(
    (element, next) =>
      next.getBoundingClientRect().top - element.getBoundingClientRect().bottom,
    second,
  );
const groupSpacing = (groups) =>
  groups.evaluateAll((elements) =>
    elements.map((element) =>
      Number.parseFloat(getComputedStyle(element).marginTop),
    ),
  );
const assertGroupStartInset = async (group) => {
  const inset = await group.evaluate(
    (element) =>
      element.getBoundingClientRect().top -
      element.parentElement.getBoundingClientRect().top,
  );
  // Firefox can report tiny floating-point differences between DOMRect positions.
  assert.ok(
    Math.abs(inset - 12) < 0.01,
    `Sidebar padding stays 12px (got ${inset}px)`,
  );
};
const alignment = (row) =>
  row.evaluate((element) => {
    const center = (rect) => rect.top + rect.height / 2;
    const rowCenter = center(element.getBoundingClientRect());
    const label = document.createRange();
    label.selectNodeContents(element.lastChild);
    return [
      Math.abs(
        center(element.querySelector("svg").getBoundingClientRect()) -
          rowCenter,
      ),
      Math.abs(center(label.getBoundingClientRect()) - rowCenter),
    ];
  });

try {
  for (const [name, engine, executablePath] of [
    ["chromium", chromium, process.env.CHROMIUM_PATH],
    ["firefox", firefox],
    ["webkit", webkit, process.env.WEBKIT_PATH],
  ]) {
    if (process.env.BROWSER && process.env.BROWSER !== name) continue;
    const browser = await engine.launch({ headless: true, executablePath });
    try {
      const page = await browser.newPage({
        viewport: { width: 1200, height: 850 },
      });
      page.setDefaultTimeout(10000);
      await page.goto(`${fixtureURL}tests/fixtures/sidebar-navigation.html`);
      const sidebar = page.getByRole("complementary", { name: "Library" });
      const admin = page.getByRole("complementary", { name: "Admin" });
      const unwrapped = page.getByRole("complementary", { name: "Grouped" });
      const directGroups = unwrapped.locator(":scope > .mt-nav-group");
      const wrappedGroups = admin.locator(
        ".mt-sidebar-content > .mt-nav-group",
      );
      const followingLooseItems = sidebar.locator(
        ".mt-sidebar-content > .mt-nav-group",
      );
      const overview = sidebar.getByRole("button", { name: "Overview" });
      const longLabel = sidebar.getByRole("button", {
        name: /^A navigation label/,
      });
      await longLabel.waitFor();
      const librarySizes = await sizes(sidebar.locator(".mt-nav-item"));
      const adminSizes = await sizes(admin.locator(".mt-nav-item"));

      assert.deepEqual(
        {
          direct: await groupSpacing(directGroups),
          wrapped: await groupSpacing(wrappedGroups),
          afterLooseItems: await groupSpacing(followingLooseItems),
        },
        { direct: [0, 12], wrapped: [0, 12], afterLooseItems: [12] },
        `${name}: only groups at the top of sidebar navigation lose extra margin`,
      );
      for (const groups of [directGroups, wrappedGroups]) {
        await assertGroupStartInset(groups.first());
      }

      const docs = await browser.newPage({
        viewport: { width: 1200, height: 850 },
      });
      docs.setDefaultTimeout(10000);
      await docs.goto(`${docsURL}#/start`);
      const nav = docs.getByRole("navigation", { name: "文档导航" });
      const start = nav.getByRole("link", { name: "快速开始" });
      const gallery = nav.getByRole("link", { name: "Component gallery" });
      const grouped = nav.locator(":scope > div > a");
      await grouped.first().waitFor();
      const docsSizes = await sizes(nav.getByRole("link"));
      const distinct = (measurements) => [...new Set(measurements)];
      assert.deepEqual(
        {
          sidebar: distinct(librarySizes),
          admin: distinct(adminSizes),
          docs: distinct(docsSizes),
        },
        { sidebar: [34], admin: [34], docs: [34] },
        `${name}: all navigation rows are 34 CSS px`,
      );
      assert.equal(await gap(overview, await longLabel.elementHandle()), 3);
      assert.equal(
        await gap(
          sidebar.getByRole("button", { name: "Current", exact: true }),
          await sidebar
            .getByRole("button", { name: "Archived" })
            .elementHandle(),
        ),
        3,
      );
      assert.equal(await gap(start, await gallery.elementHandle()), 3);
      assert.equal(
        await gap(grouped.first(), await grouped.nth(1).elementHandle()),
        3,
      );
      for (const row of [overview, longLabel, start]) {
        assert(
          (await alignment(row)).every((distance) => distance <= 1.5),
          `${name}: centered icon and label`,
        );
      }
      assert.equal(await overview.getAttribute("aria-current"), "page");

      await sidebar.getByRole("button", { name: "收起侧边栏" }).press("Enter");
      assert.equal(await sidebar.getAttribute("data-collapsed"), "true");
      assert.deepEqual(
        await sizes(sidebar.locator(".mt-nav-item")),
        [34, 34, 34, 34],
      );
      assert.equal((await sidebar.boundingBox()).width, 52);
      await page.keyboard.press("Tab");
      assert.equal(
        await overview.evaluate((row) => row === document.activeElement),
        true,
      );
      const tooltip = page.getByRole("tooltip");
      await tooltip.waitFor();
      assert.equal(await tooltip.textContent(), "Overview");
      await page.keyboard.press("Escape");
      await tooltip.waitFor({ state: "hidden" });
      await sidebar.getByRole("button", { name: "展开侧边栏" }).click();
      assert.equal(await sidebar.getAttribute("data-collapsed"), "false");

      await admin.getByRole("button", { name: "收起侧边栏" }).press("Enter");
      assert.equal(await admin.getAttribute("data-collapsed"), "true");
      assert.deepEqual(await groupSpacing(wrappedGroups), [0, 12]);
      await assertGroupStartInset(wrappedGroups.first());
      assert.equal(
        await wrappedGroups
          .nth(1)
          .evaluate((group) => getComputedStyle(group).borderTopWidth),
        "1px",
      );
      assert.deepEqual(await sizes(admin.locator(".mt-nav-item")), [34, 34]);

      await docs.setViewportSize({ width: 390, height: 850 });
      await nav.waitFor({ state: "hidden" });
      await docs.getByRole("button", { name: "打开导航" }).click();
      await gallery.waitFor();
      assert.deepEqual(distinct(await sizes(nav.getByRole("link"))), [34]);
      await gallery.click();
      await nav.waitFor({ state: "hidden" });
      assert.equal(new URL(docs.url()).hash, "#/gallery");
      console.log(
        `${name}: 34px sidebar, AdminLayout and docs navigation; spacing, alignment and collapse preserved`,
      );
    } finally {
      await browser.close();
    }
  }
} finally {
  await Promise.all([fixtureServer.close(), docsServer.close()]);
}

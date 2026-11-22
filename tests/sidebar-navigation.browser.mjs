import assert from "node:assert/strict";
import { chromium, expect, firefox, webkit } from "@playwright/test";
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
const assertPinnedNavigation = async (sidebar, content, name, minimumScrollRange) => {
  const pinned = sidebar.locator(".mt-sidebar-heading, .mt-tab-bar, .mt-sidebar-footer");
  const bounds = () => pinned.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().toJSON()));
  const beforeScroll = await bounds();
  assert.equal(beforeScroll.length, 3);
  const range = await content.evaluate((element) => element.scrollHeight - element.clientHeight);
  assert.ok(range > minimumScrollRange, `${name}: only the middle active panel is independently scrollable`);
  const scrollTop = Math.min(180, range);
  await content.evaluate((element, position) => { element.scrollTop = position; }, scrollTop);
  await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBe(scrollTop);
  assert.deepEqual(await bounds(), beforeScroll, `${name}: header, tabs and footer stay pinned`);
  assert.equal(await sidebar.evaluate((element) => element.scrollTop), 0);
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
        { sidebar: [32], admin: [32], docs: [32] },
        `${name}: all navigation rows are 32 CSS px`,
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
      assert.notEqual(await overview.evaluate((element) => getComputedStyle(element, "::before").content), "none");

      await sidebar.getByRole("button", { name: "收起侧边栏" }).press("Enter");
      assert.equal(await sidebar.getAttribute("data-collapsed"), "true");
      assert.deepEqual(
        await sizes(sidebar.locator(".mt-nav-item")),
        [32, 32, 32, 32],
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
      const railDivider = (group) => group.evaluate((node) => {
        const divider = getComputedStyle(node, "::before");
        return [
          getComputedStyle(node).borderBlockStartWidth,
          divider.content !== "none",
          divider.borderBlockStartWidth,
        ];
      });
      assert.deepEqual(await railDivider(wrappedGroups.first()), ["0px", false, "0px"]);
      assert.deepEqual(await railDivider(wrappedGroups.nth(1)), ["0px", true, "1px"]);
      assert.deepEqual(await sizes(admin.locator(".mt-nav-item")), [32, 32]);

      await docs.setViewportSize({ width: 390, height: 850 });
      await nav.waitFor({ state: "hidden" });
      await docs.getByRole("button", { name: "打开导航" }).click();
      await gallery.waitFor();
      assert.deepEqual(distinct(await sizes(nav.getByRole("link"))), [32]);
      await gallery.click();
      await nav.waitFor({ state: "hidden" });
      assert.equal(new URL(docs.url()).hash, "#/gallery");
      await page.goto(`${fixtureURL}tests/fixtures/sidebar-navigation.html?tabs`);
      const tabbed = page.getByRole("complementary", { name: "Tabbed Admin" });
      const list = tabbed.getByRole("tablist", { name: "Local categories" });
      const work = list.getByRole("tab", { name: "Workspace" });
      const projects = list.getByRole("tab", { name: "Projects" });
      const dashboard = tabbed.getByRole("button", { name: "Dashboard" });
      const panel = tabbed.getByRole("tabpanel", { name: "Workspace" });
      const content = panel.locator(".mt-sidebar-content");
      await expect(work).toHaveAttribute("aria-selected", "true");
      await expect(panel).toHaveAttribute("aria-labelledby", await work.getAttribute("id"));
      await expect(dashboard).toHaveAttribute("aria-current", "page");
      assert.deepEqual(await sizes(list.getByRole("tab")), [32, 32, 32]);
      assert.equal(await work.evaluate((element) => getComputedStyle(element, "::after").backgroundColor),
        "rgb(37, 99, 173)", `${name}: selected Sidebar tab is blue`);
      const neutralColor = await dashboard.evaluate((element) => {
        const color = getComputedStyle(element).backgroundColor;
        const channels = color.match(/\d+/g)?.slice(0, 3).map(Number);
        return channels && channels[0] > 100 && channels[0] < 253 && Math.max(...channels) - Math.min(...channels) <= 6;
      });
      assert.ok(neutralColor, `${name}: current navigation row keeps its neutral fill`);
      assert.equal(await dashboard.evaluate((element) => getComputedStyle(element, "::before").content), "none");


      await assertPinnedNavigation(tabbed, content, `${name} AdminLayout.Sider`, 200);

      await work.focus();
      await page.keyboard.press("ArrowRight");
      await expect(projects).toBeFocused();
      await expect(work).toHaveAttribute("aria-selected", "true");
      await page.keyboard.press("Space");
      await expect(projects).toHaveAttribute("aria-selected", "true");
      const projectButton = tabbed.getByRole("button", { name: "Project inbox" });
      await expect(projectButton).toBeVisible();
      await expect(dashboard).toBeHidden();

      await page.setViewportSize({ width: 390, height: 850 });
      await expect(tabbed).toHaveAttribute("data-collapsed", "true");
      assert.equal((await tabbed.boundingBox()).width, 52);
      await expect(list).toBeHidden();
      await expect(projectButton).toBeVisible();
      await page.setViewportSize({ width: 1200, height: 850 });
      await expect(list).toBeVisible();
      await expect(projects).toHaveAttribute("aria-selected", "true");
      await expect(projectButton).toBeVisible();

      await docs.goto(`${docsURL}#/components/Sidebar?section=tabs`);
      const demo = docs.getByRole("complementary", { name: "工作区侧栏" });
      await expect(demo.getByRole("tab", { name: "工作区" })).toHaveAttribute("aria-selected", "true");
      await assertPinnedNavigation(demo,
        demo.getByRole("tabpanel", { name: "工作区" }).locator(".mt-sidebar-content"), `${name} standalone docs Sidebar`, 30);
      await demo.getByRole("tab", { name: "收藏" }).click();
      await expect(demo.getByRole("button", { name: "设计素材" })).toBeVisible();
      assert.equal(new URL(docs.url()).hash, "#/components/Sidebar?section=tabs");
      console.log(
        `${name}: 32px sidebar, pinned tabs, local navigation, keyboard, spacing and collapse preserved`,
      );
    } finally {
      await browser.close();
    }
  }
} finally {
  await Promise.all([fixtureServer.close(), docsServer.close()]);
}

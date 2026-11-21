import assert from "node:assert/strict";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import { createServer } from "vite";

const server = await createServer({ server: { host: "127.0.0.1", port: 5286, strictPort: true }, logLevel: "error" });
await server.listen();
let browser;
try {
  const engine = { chromium, firefox, webkit }[process.env.BROWSER || "chromium"];
  browser = await engine.launch({ headless: true, executablePath: process.env.BROWSER_PATH });
  for (const scenario of [
    { query: "", width: 980, rtl: false, touch: false },
    { query: "?admin&rtl&dark", width: 320, rtl: true, touch: true },
  ]) {
    const context = await browser.newContext({ viewport: { width: scenario.width, height: 500 }, hasTouch: scenario.touch });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:5286/tests/fixtures/nav-submenu.html${scenario.query}`);
    const leaf = (label) => page.getByRole("button", { name: label, exact: true });
    const parent = leaf("Billing and licensing");
    const popup = page.getByRole("dialog", { name: "Billing and licensing" });
    const sidebar = page.locator(".mt-sidebar");
    const current = leaf("Usage");
    await expect(current).toHaveAttribute("aria-current", "page");
    await expect(parent).toHaveAttribute("aria-expanded", "true");
    await expect(parent).not.toHaveAttribute("aria-current");
    const parentTypography = () => parent.evaluate((row) => ({
      label: Number(getComputedStyle(row.querySelector(".mt-nav-item-label")).fontWeight),
      row: Number(getComputedStyle(row).fontWeight),
      icon: Number(getComputedStyle(row.querySelector(".mt-nav-submenu-icon")).fontWeight),
      height: row.getBoundingClientRect().height,
      marker: getComputedStyle(row, "::before").content,
    }));
    const activeTypography = await parentTypography();
    assert(activeTypography.label > activeTypography.row);
    assert.deepEqual([activeTypography.icon, activeTypography.height, activeTypography.marker], [activeTypography.row, 34, "none"]);
    const paint = await current.evaluate((button) => {
      const marker = getComputedStyle(button, "::before");
      const probe = document.createElement("span");
      probe.style.color = "var(--mt-blue)";
      button.append(probe);
      const blue = getComputedStyle(probe).color;
      probe.remove();
      return {
        height: button.getBoundingClientRect().height,
        marker: marker.backgroundColor,
        blue,
        radius: getComputedStyle(button).borderRadius,
        start: marker.insetInlineStart,
        direction: getComputedStyle(button).direction,
        bg: getComputedStyle(button).backgroundColor,
      };
    });
    assert.deepEqual([paint.height, paint.radius, paint.direction], [34, "6px", scenario.rtl ? "rtl" : "ltr"]);
    assert(paint.marker === paint.blue && parseFloat(paint.start) < 0 && paint.bg !== "rgba(0, 0, 0, 0)", JSON.stringify(paint));
    if (!scenario.touch && engine === chromium) {
      await page.emulateMedia({ forcedColors: "active" });
      assert(await current.evaluate((button) => {
        const probe = document.createElement("span");
        probe.style.forcedColorAdjust = "none";
        probe.style.backgroundColor = "Highlight";
        button.append(probe);
        const actual = getComputedStyle(button, "::before").backgroundColor;
        const expected = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return actual === expected;
      }));
      await page.emulateMedia({ forcedColors: "none" });
    }
    if (!scenario.touch) {
      await leaf("Licensing").hover();
      assert(await leaf("Licensing").evaluate((button) => getComputedStyle(button, "::before").content === "none" && getComputedStyle(button).backgroundColor !== "rgba(0, 0, 0, 0)"));
    }
    await parent.focus();
    await page.keyboard.press("Enter");
    await expect(current).toBeHidden();
    await page.keyboard.press("Space");
    await expect(current).toBeVisible();
    await page.locator(".mt-sidebar-toggle").click();
    await expect(parent).toHaveAttribute("aria-expanded", "false");

    await parent.focus();
    await page.keyboard.press("Enter");
    await expect(popup).toBeVisible();
    const first = popup.getByRole("button", { name: "Overview" });
    await expect(first).toBeFocused();
    await expect(popup.getByRole("button", { name: "Usage" })).toHaveAttribute("aria-current", "page");
    assert.equal(await sidebar.locator(".mt-nav-submenu-popup").count(), 0);
    const popupBox = await popup.boundingBox();
    const parentBox = await parent.boundingBox();
    assert(popupBox.x >= 0 && popupBox.x + popupBox.width <= scenario.width + 1);
    assert(scenario.rtl ? popupBox.x + popupBox.width < parentBox.x : popupBox.x > parentBox.x + parentBox.width);
    if (scenario.rtl) {
      assert(await popup.evaluate((panel) => getComputedStyle(panel).direction === "rtl" && panel.closest("[data-mt-theme]")?.getAttribute("data-mt-theme") === "dark"));
      assert(popupBox.height > (await sidebar.locator(".mt-sidebar-content").boundingBox()).height);
    }
    await page.keyboard.press("Escape");
    await expect(popup).toBeHidden();
    await expect(parent).toBeFocused();
    if (scenario.touch) await parent.tap(); else await parent.click();
    await expect(popup).toBeVisible();
    if (scenario.touch) await first.tap(); else await first.click();
    await expect(page.getByTestId("current")).toHaveText("Overview");
    await expect(popup).toBeHidden();
    await parent.click();
    await expect(popup).toBeVisible();
    await leaf("Outside").click();
    await expect(popup).toBeHidden();
    await expect(leaf("Outside")).toBeFocused();
    await parent.click();
    await expect(popup).toBeVisible();
    await page.locator(".mt-sidebar-toggle").click();
    await expect(leaf("Overview")).toBeVisible();
    await expect(leaf("Overview")).toHaveAttribute("aria-current", "page");
    await page.locator(".mt-sidebar-toggle").click();
    await expect(parent).toHaveAttribute("aria-expanded", "false");
    await leaf("Email").click();
    await page.locator(".mt-sidebar-toggle").click();
    await expect(leaf("Email")).toHaveAttribute("aria-current", "page");
    const inactiveTypography = await parentTypography();
    assert.deepEqual(inactiveTypography, { ...activeTypography, label: activeTypography.row });
    assert.deepEqual(errors, []);
    await context.close();
  }
  const responsive = await browser.newPage({ viewport: { width: 900, height: 550 } });
  await responsive.goto("http://127.0.0.1:5286/tests/fixtures/nav-submenu.html?admin&responsive");
  const branch = responsive.getByRole("button", { name: "Billing and licensing" });
  await branch.focus();
  await responsive.setViewportSize({ width: 625, height: 550 });
  await expect(branch).toHaveAttribute("aria-expanded", "false");
  await expect(branch).toBeFocused();
  await responsive.keyboard.press("Enter");
  const railPopup = responsive.getByRole("dialog", { name: "Billing and licensing" });
  await expect(railPopup.getByRole("button", { name: "Overview" })).toBeFocused();
  await responsive.setViewportSize({ width: 900, height: 550 });
  await expect(railPopup).toBeHidden();
  await expect(branch).toHaveAttribute("aria-expanded", "true");
  await expect(branch).toBeFocused();
  const outside = responsive.getByRole("button", { name: "Outside" });
  await outside.focus();
  await responsive.setViewportSize({ width: 625, height: 550 });
  await expect(branch).toHaveAttribute("aria-expanded", "false");
  await expect(outside).toBeFocused();
  await expect(railPopup).toBeHidden();
  const sidebarToggle = responsive.locator(".mt-sidebar-toggle");
  await sidebarToggle.focus();
  await responsive.setViewportSize({ width: 900, height: 550 });
  await expect(branch).toHaveAttribute("aria-expanded", "true");
  await expect(sidebarToggle).toBeFocused();
  await responsive.getByRole("button", { name: "Overview" }).focus();
  await responsive.setViewportSize({ width: 625, height: 550 });
  await expect(branch).toHaveAttribute("aria-expanded", "false");
  await expect(branch).toBeFocused();
  await responsive.close();
  const spacing = await browser.newPage();
  await spacing.goto("http://127.0.0.1:5286/tests/fixtures/nav-submenu.html?groups");
  for (const [parent, expected] of [["standalone", ["0px", "12px"]], ["wrapped", ["0px", "12px"]], ["after-item", ["12px"]]]) {
    const groups = spacing.getByTestId(parent).locator(":scope > .mt-nav-group");
    await expect(groups).toHaveCount(expected.length);
    const margins = await groups.evaluateAll((elements) => elements.map((group) => getComputedStyle(group).marginTop));
    assert.deepEqual(margins, expected, parent);
    await expect(groups.first().locator(".mt-nav-item").nth(1)).toHaveCSS("margin-top", "3px");
  }
  await expect(spacing.getByTestId("sidebar")).toHaveCSS("padding-top", "12px");
  const wrappedGroups = spacing.getByTestId("wrapped").locator(":scope > .mt-nav-group");
  const standaloneGroups = spacing.getByTestId("standalone").locator(":scope > .mt-nav-group");
  const afterItemGroup = spacing.getByTestId("after-item").locator(":scope > .mt-nav-group");
  const divider = (group) => group.evaluate((node) => {
    const rule = getComputedStyle(node, "::before");
    return rule.content === "none" ? [false, null] : [true, rule.borderBlockStartWidth];
  });
  assert.deepEqual(await divider(standaloneGroups.first()), [false, null]);
  assert.deepEqual(await divider(standaloneGroups.last()), [true, "1px"]);
  assert.deepEqual(await divider(afterItemGroup), [false, null]);
  const wrappedGroup = wrappedGroups.last();
  assert.deepEqual(await divider(wrappedGroup), [true, "1px"]);
  const action = spacing.getByRole("button", { name: "Add view" });
  await action.focus();
  await spacing.keyboard.press("Enter");
  await expect(spacing.getByRole("button", { name: "View count: 1" })).toBeVisible();
  assert(await wrappedGroup.evaluate((node) => {
    const label = node.querySelector(".mt-nav-label");
    const actions = node.querySelector(".mt-nav-group-actions");
    const title = label.getBoundingClientRect();
    const buttons = actions.getBoundingClientRect();
    return label.scrollWidth > label.clientWidth && buttons.right <= title.left;
  }), "the RTL heading action follows the truncated title at inline-end");
  const lowerRow = spacing.getByRole("button", { name: "View count: 1" });
  const before = (await lowerRow.boundingBox()).y;
  const toggleDivider = spacing.getByRole("button", { name: "Toggle group divider" });
  await toggleDivider.click();
  assert.deepEqual(await divider(wrappedGroup), [false, null]);
  assert.equal((await lowerRow.boundingBox()).y, before);
  await toggleDivider.click();
  await spacing.getByTestId("sidebar").locator(".mt-sidebar-toggle").click();
  await expect(action).toHaveCount(0);
  assert.deepEqual(await divider(wrappedGroup), [true, "1px"]);
  const railBefore = (await lowerRow.boundingBox()).y;
  await toggleDivider.click();
  assert.deepEqual(await divider(wrappedGroup), [false, null]);
  assert.equal((await lowerRow.boundingBox()).y, railBefore);
  await spacing.close();
  for (const rtl of [false, true]) {
    const actionsPage = await browser.newPage({ viewport: { width: rtl ? 320 : 640, height: 500 }, hasTouch: rtl });
    await actionsPage.goto(`http://127.0.0.1:5286/tests/fixtures/nav-submenu.html?actions${rtl ? "&rtl" : ""}`);
    const destination = actionsPage.getByRole("link", { name: "A very long folder name for documents" });
    const row = destination.locator("..");
    const edit = actionsPage.getByRole("button", { name: "Edit", exact: true });
    const archive = actionsPage.getByRole("button", { name: "Archive", exact: true });
    const more = actionsPage.locator("[aria-label=More]");
    const outside = actionsPage.getByRole("button", { name: "Outside" });
    await outside.focus();
    await expect(edit).toBeVisible();
    await expect(archive).toBeVisible();
    await expect(actionsPage.getByRole("button", { name: "Edit disabled row" })).toBeVisible();
    await expect(actionsPage.locator("[aria-label='Inactive archive']")).toBeHidden();
    const boxes = async () => ({
      row: await row.boundingBox(),
      item: await destination.boundingBox(),
      edit: await edit.boundingBox(),
      archive: await archive.boundingBox(),
    });
    const normal = await boxes();
    assert.equal(normal.row.height, 34);
    assert.equal(normal.row.y - (await actionsPage.getByRole("button", { name: "Before" }).boundingBox()).y, 37);
    assert.equal((await actionsPage.getByRole("button", { name: "After" }).boundingBox()).y - normal.row.y, 37);
    assert(rtl ? normal.edit.x < normal.item.x : normal.edit.x > normal.item.x);
    assert(rtl ? normal.archive.x < normal.edit.x : normal.archive.x > normal.edit.x);
    assert(await destination.locator(".mt-nav-item-label").evaluate((label) => label.scrollWidth > label.clientWidth));
    const activePaint = await row.evaluate((element) => {
      const probe = document.createElement("span");
      probe.style.background = "var(--mt-nav-selected)";
      element.append(probe);
      const matches = getComputedStyle(element).backgroundColor === getComputedStyle(probe).backgroundColor;
      probe.remove();
      return matches;
    });
    assert(activePaint);
    if (!rtl) {
      await expect(more).toBeHidden();
      await row.hover();
      await expect(more).toBeVisible();
      assert.deepEqual(await boxes(), normal);
      await actionsPage.mouse.move(0, 0);
      await expect(more).toBeHidden();
    } else {
      await expect(more).toBeVisible();
    }
    await destination.focus();
    await actionsPage.keyboard.press("Tab");
    await expect(edit).toBeFocused();
    await actionsPage.keyboard.press("Enter");
    await expect(actionsPage.getByTestId("edit-count")).toHaveText("1");
    assert(!actionsPage.url().endsWith("#destination"));
    await actionsPage.keyboard.press("Tab");
    await expect(more).toBeFocused();
    await actionsPage.keyboard.press("Enter");
    const rename = actionsPage.getByRole("button", { name: "Rename" });
    await expect(rename).toBeVisible();
    await rename.focus();
    await expect(more).toBeVisible();
    await actionsPage.keyboard.press("Escape");
    await expect(rename).toBeHidden();

    await actionsPage.locator(".mt-sidebar-toggle").click();
    await expect(edit).toHaveCount(0);
    await expect(destination).toHaveAttribute("href", "#destination");
    await actionsPage.getByRole("button", { name: "Projects" }).click();
    const popup = actionsPage.getByRole("dialog", { name: "Projects" });
    await expect(popup.getByRole("button", { name: "Workspace" })).toBeFocused();
    await popup.getByRole("button", { name: "Edit project" }).click();
    await expect(actionsPage.getByTestId("edit-count")).toHaveText("2");
    await expect(popup).toBeVisible();
    await actionsPage.close();
  }
  console.log("NavSubmenu inline/rail behavior, positioning, focus, touch, and selected marker passed");
} finally {
  await browser?.close();
  await server.close();
}

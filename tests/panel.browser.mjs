import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { createServer } from "vite";

const server = await createServer({
  server: { host: "127.0.0.1", port: 5421, strictPort: true },
  logLevel: "error",
});
await server.listen();
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 720, height: 850 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("http://127.0.0.1:5421/tests/fixtures/panel.html");

  const standalone = page.getByTestId("standalone");
  const panel = standalone.locator(".mt-ide-panel");
  const header = panel.locator(".mt-tab-bar");
  const input = standalone.getByRole("textbox", { name: "Standalone input" });
  const status = await header.evaluate((el) => {
    const colors = getComputedStyle(el);
    const probe = document.createElement("span");
    probe.style.backgroundColor = "var(--mt-subtle)";
    el.append(probe);
    const bg = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return { themed: bg === colors.backgroundColor, height: el.getBoundingClientRect().height };
  });
  assert.deepEqual(status, { themed: true, height: 34 });
  await expect(standalone.getByRole("button", { name: "More tabs" })).toBeVisible();
  await input.fill("Preserved");
  await input.focus();
  await page.evaluate(() => window.dispatchEvent(new Event("controlled-collapse")));
  const expand = standalone.getByRole("button", { name: "Expand panel" });
  await expect(expand).toBeFocused();
  await expect(standalone.getByRole("tabpanel")).toHaveCount(0);
  await expect(standalone.getByRole("button", { name: "Action" })).toBeVisible();
  await expect(panel).toHaveCSS("height", "34px");
  await expand.press("Enter");
  await expect(input).toHaveValue("Preserved");
  await expect(standalone.getByRole("button", { name: "Collapse panel" })).toBeFocused();

  const moreTabs = standalone.getByRole("button", { name: "More tabs" });
  await moreTabs.click();
  await page.getByRole("menuitem", { name: "Visible", exact: true }).click();
  await expect(standalone.getByRole("tabpanel")).toHaveCount(0);
  await moreTabs.click();
  await page.getByRole("menuitem", { name: "Second tab with a long name" }).click();
  await expect(standalone.getByRole("tabpanel")).toHaveText("Second panel");

  const ide = page.getByTestId("ide");
  const dockControls = ide.getByRole("group", { name: "停靠位置" });
  const placementControls = ide.getByRole("group", { name: "标签位置" });
  const sizeControls = ide.getByRole("group", { name: "标签高度" });
  const splitter = ide.locator(".mt-splitter");
  const workbench = ide.getByLabel("工作面板", { exact: true });
  const editor = ide.getByLabel("代码编辑器", { exact: true });
  const sep = ide.getByRole("separator");
  const workbenchPanel = workbench.locator(".mt-ide-panel");
  const command = workbench.getByRole("textbox", { name: "输入命令" });
  await expect(dockControls.getByRole("button", { name: "底部" })).toHaveAttribute("aria-pressed", "true");
  await expect(splitter).toHaveAttribute("data-orientation", "vertical");
  const bottomBefore = await workbench.boundingBox();
  assert(bottomBefore.y > (await editor.boundingBox()).y);
  await command.fill("npm run dev");
  await sep.focus();
  await page.keyboard.press("ArrowUp");
  await expect.poll(async () => (await workbench.boundingBox()).height).toBeGreaterThan(bottomBefore.height + 1);
  const restored = (await workbench.boundingBox()).height;
  await sep.dblclick();
  await expect.poll(async () => (await workbench.boundingBox()).height).toBeCloseTo(34, 0);
  await expect(workbenchPanel).toHaveAttribute("data-collapsed", "true");
  await expect(sep).toBeEnabled();
  await expect(command).toHaveCount(0);
  await workbench.getByRole("button", { name: "清空终端记录" }).click();
  await sep.dblclick();
  await expect.poll(async () => (await workbench.boundingBox()).height).toBeCloseTo(restored, 0);
  await expect(command).toHaveValue("npm run dev");
  await expect(workbench.getByText("VITE ready")).toHaveCount(0);

  await sep.press("ArrowUp");
  await expect.poll(async () => (await workbench.boundingBox()).height).toBeGreaterThan(restored + 1);
  const resizedAfterRestore = (await workbench.boundingBox()).height;
  await sep.dblclick();
  await expect.poll(async () => (await workbench.boundingBox()).height).toBeCloseTo(34, 0);
  await sep.press("Enter");
  await expect.poll(async () => (await workbench.boundingBox()).height).toBeCloseTo(resizedAfterRestore, 0);

  const terminalTab = workbench.getByRole("tab", { name: "终端" });
  const outputTab = workbench.getByRole("tab", { name: "输出" });
  await terminalTab.click();
  await expect(terminalTab).toBeFocused();
  await expect(terminalTab).toHaveAttribute("aria-selected", "true");
  await expect(command).toHaveCount(0);
  await expect.poll(async () => (await workbench.boundingBox()).height).toBeCloseTo(34, 0);
  await terminalTab.press("Space");
  await expect(command).toHaveValue("npm run dev");
  await expect.poll(async () => (await workbench.boundingBox()).height).toBeCloseTo(resizedAfterRestore, 0);

  await terminalTab.press("Enter");
  await expect(command).toHaveCount(0);
  await outputTab.click();
  await expect(outputTab).toHaveAttribute("aria-selected", "true");
  await expect(workbench.getByText("编译完成")).toBeVisible();
  await expect.poll(async () => (await workbench.boundingBox()).height).toBeCloseTo(resizedAfterRestore, 0);
  await terminalTab.click();
  await expect(command).toHaveValue("npm run dev");

  for (const [dock, orientation, first] of [
    ["顶部", "vertical", true],
    ["左侧", "horizontal", true],
    ["右侧", "horizontal", false],
  ]) {
    await dockControls.getByRole("button", { name: dock }).click();
    await expect(splitter).toHaveAttribute("data-orientation", orientation);
    const axis = orientation === "vertical" ? "y" : "x";
    const dimension = orientation === "vertical" ? "height" : "width";
    const pane = await workbench.boundingBox();
    const code = await editor.boundingBox();
    assert(first ? pane[axis] < code[axis] : pane[axis] > code[axis], dock);
    await expect(command).toHaveValue("npm run dev");
    await sep.dblclick();
    await expect.poll(async () => (await workbench.boundingBox())[dimension]).toBeCloseTo(orientation === "vertical" ? 34 : 144, 0);
    const restoreControl = workbench.getByRole("button", { name: "展开面板" });
    const restoreBox = await restoreControl.boundingBox();
    const rail = await workbench.boundingBox();
    assert(restoreBox.x >= rail.x && restoreBox.x + restoreBox.width <= rail.x + rail.width + 1, dock);
    await sep.press("Enter");
    await expect.poll(async () => (await workbench.boundingBox())[dimension]).toBeCloseTo(pane[dimension], 0);
  }
  const plainSeparator = page.getByTestId("plain-splitter").getByRole("separator");
  const themeColors = [];
  for (const colorScheme of ["light", "dark"]) {
    await page.emulateMedia({ colorScheme });
    await expect(plainSeparator).toHaveCSS("box-shadow", "none");
    for (const [dock, adjacentTab, axis, x, y] of [
      ["底部", "顶部", "height", 0, 1],
      ["顶部", "底部", "height", 0, -1],
      ["左侧", "右侧", "width", -1, 0],
      ["右侧", "左侧", "width", 1, 0],
    ]) {
      await dockControls.getByRole("button", { name: dock }).click();
      await placementControls.getByRole("button", { name: adjacentTab }).click();
      await sep.scrollIntoViewIfNeeded();
      const paint = await sep.evaluate((element, axis) => {
        const style = getComputedStyle(element);
        const probe = document.createElement("span");
        probe.style.color = "var(--mt-border)";
        element.append(probe);
        const borderColor = getComputedStyle(probe).color;
        probe.remove();
        const rect = element.getBoundingClientRect();
        const grip = element.querySelector(".mt-splitter-grip");
        return {
          boxShadow: style.boxShadow,
          borderColor,
          thickness: rect[axis],
          sidesHitSeparator: [0.5, rect[axis] - 0.5].every(offset => {
            const x = rect.left + (axis === "width" ? offset : rect.width / 2);
            const y = rect.top + (axis === "height" ? offset : rect.height / 2);
            return element.contains(document.elementFromPoint(x, y));
          }),
          threeDots: grip && getComputedStyle(grip).width === "3px"
            && getComputedStyle(grip, "::before").content === '""'
            && getComputedStyle(grip, "::after").content === '""',
        };
      }, axis);
      const editorEdge = `${paint.borderColor} ${x}px ${y}px 0px 0px inset`;
      const panelEdge = `${paint.borderColor} ${-x}px ${-y}px 0px 0px inset`;
      assert.equal(paint.boxShadow, `${editorEdge}, ${panelEdge}`, `${colorScheme}: ${dock} 标签栏相邻时两侧各一条线`);
      await placementControls.getByRole("button", { name: dock }).click();
      await expect(sep).toHaveCSS("box-shadow", editorEdge);
      assert.equal(paint.thickness, 6, `${dock}: separator geometry`);
      assert(paint.sidesHitSeparator, `${dock}: the visual line does not shrink the hit target`);
      assert(paint.threeDots, `${dock}: retains all three grip dots`);
      if (dock === "底部") themeColors.push(paint.borderColor);
    }
  }
  assert.notEqual(...themeColors, "light and dark use different border tokens");
  await page.emulateMedia({ colorScheme: "light" });
  console.log("Panel divider: both seams next to tabs, editor seam otherwise, four docks and two themes; hit geometry and grips unchanged");
  const demoBar = workbenchPanel.locator(".mt-tab-bar");
  await dockControls.getByRole("button", { name: "底部" }).click();
  for (const [label, direction] of [["顶部", "top"], ["底部", "bottom"]]) {
    await placementControls.getByRole("button", { name: label }).click();
    for (const [preset, height] of [["md", 32], ["sm", 28], ["lg", 36]]) {
      await sizeControls.getByRole("button", { name: preset, exact: true }).click();
      const geometry = await demoBar.evaluate(bar => {
        const list = bar.querySelector('[role="tablist"]').getBoundingClientRect();
        const rect = bar.getBoundingClientRect();
        const action = bar.querySelector('.mt-tab-extra').getBoundingClientRect();
        return { height: rect.height, below: rect.bottom - list.bottom, action: action.height };
      });
      assert.equal(geometry.height, height + 2, `${direction} ${preset}: the whole header follows the live tab height`);
      assert.equal(geometry.action, 28, "Header actions retain their compact height");
      if (direction === "top") assert.equal(geometry.below, 1, "The indicator meets the header hairline");
    }
  }
  await sizeControls.getByRole("button", { name: "md", exact: true }).click();
  await placementControls.getByRole("button", { name: "顶部" }).click();
  await dockControls.getByRole("button", { name: "右侧" }).click();
  await page.setViewportSize({ width: 320, height: 850 });
  await workbench.getByRole("button", { name: "收起面板" }).click();
  await expect(workbench.getByRole("button", { name: "展开面板" })).toBeVisible();
  await expect(workbench.getByRole("tablist")).toBeVisible();
  await workbench.getByRole("button", { name: "展开面板" }).click();
  const barFrames = workbench.getByRole("tablist").locator(".mt-tab-item");
  await expect(sizeControls.getByRole("button", {name: "md", exact: true})).toHaveAttribute("aria-pressed", "true");
  const dockedWidth = (await workbench.boundingBox()).width;
  const directions = [["顶部", "top"], ["底部", "bottom"], ["左侧", "left"], ["右侧", "right"]];
  for (const [label, direction] of directions) {
    await placementControls.getByRole("button", { name: label }).click();
    await expect(workbenchPanel).toHaveAttribute("data-panel-tab-placement", direction);
    await expect(command).toHaveValue("npm run dev");
    const side = direction === "left" || direction === "right";
    for (const [preset, height] of [["md", 32], ["sm", 28], ["lg", 36]]) {
      await sizeControls.getByRole("button", { name: preset, exact: true }).click();
      expect(await barFrames.evaluateAll(frames => frames.map(frame => frame.getBoundingClientRect().height)))
        .toEqual([height, height, height]);
      assert(Math.abs((await workbench.boundingBox()).width - dockedWidth) < 1, "Changing tab size leaves the expanded Splitter width intact");
      await expect(command).toHaveValue("npm run dev");
    }
    const bar = await demoBar.boundingBox();
    const content = await workbench.getByRole("tabpanel", { name: "终端" }).boundingBox();
    if (direction === "top") assert(bar.y + bar.height <= content.y + 1);
    if (direction === "bottom") assert(bar.y >= content.y + content.height - 1);
    if (direction === "left") assert(bar.x + bar.width <= content.x + 1);
    if (direction === "right") assert(bar.x >= content.x + content.width - 1);
    if (side) {
      assert.equal(bar.width, 44);
      await expect(workbench.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
      await expect(workbench.getByRole("tab", { name: "终端" })).toHaveAttribute("title", "终端");
      await expect(workbench.getByRole("tab", { name: "终端" }).locator(".mt-tab-label")).toHaveCSS("clip-path", "inset(50%)");
      await expect(workbench.getByRole("tab", { name: "终端" })).toHaveAttribute("aria-selected", "true");
    }
    await sep.dblclick();
    await expect(workbench.getByRole("tabpanel")).toHaveCount(0);
    await expect(workbench.getByRole("button", { name: "清空终端记录" })).toBeVisible();
    const toggle = workbench.getByRole("button", { name: "展开面板" });
    await expect(toggle).toBeVisible();
    await expect.poll(async () => (await workbenchPanel.boundingBox())[side ? "width" : "height"])
      .toBeCloseTo(side ? 44 : 38, 0);
    await toggle.press("Enter");
    await expect.poll(async () => (await workbench.boundingBox()).width).toBeCloseTo(dockedWidth, 0);
    await expect(command).toHaveValue("npm run dev");
  }

  // Changing the size while vertically docked and collapsed must also shrink the slot.
  await dockControls.getByRole("button", { name: "底部" }).click();
  await placementControls.getByRole("button", { name: "顶部" }).click();
  await sizeControls.getByRole("button", { name: "md", exact: true }).click();
  await sep.press("Enter");
  await expect(workbench.getByRole("tabpanel")).toHaveCount(0);
  await expect.poll(async () => (await workbench.boundingBox()).height).toBeCloseTo(34, 0);
  await sizeControls.getByRole("button", { name: "sm", exact: true }).click();
  await expect.poll(async () => (await workbench.boundingBox()).height).toBeCloseTo(30, 0);
  await expect(workbench.getByRole("button", { name: "展开面板" })).toBeVisible();
  await sep.press("Enter");
  await expect(command).toHaveValue("npm run dev");
  await placementControls.getByRole("button", { name: "右侧" }).click();

  // A vertical Splitter must not squash a side rail into a horizontal 34px slot.
  await dockControls.getByRole("button", { name: "底部" }).click();
  await sep.press("Enter");
  await expect(workbench.getByRole("button", { name: "展开面板" })).toBeVisible();
  await expect(workbench.getByRole("button", { name: "清空终端记录" })).toBeVisible();
  await sep.press("Enter");
  await expect(command).toHaveValue("npm run dev");

  const rtl = page.getByTestId("rtl-rail");
  const rtlBar = rtl.locator(".mt-tab-bar");
  const consoleTab = rtl.getByRole("tab", { name: "Console" });
  const settingsTab = rtl.getByRole("tab", { name: "Settings" });
  await expect(consoleTab).toHaveAttribute("title", "Console");
  await expect(settingsTab.locator(".mt-tab-label")).toHaveCSS("clip-path", "none");
  assert((await rtlBar.boundingBox()).x > (await rtl.getByRole("tabpanel").boundingBox()).x, "RTL right remains physically right");
  await consoleTab.focus();
  await page.keyboard.press("ArrowDown");
  await expect(settingsTab).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(rtl.getByRole("tabpanel", { name: "Settings" })).toHaveText("Settings content");
  await expect(settingsTab).toHaveAttribute("aria-selected", "true");
  const selectedPaint = await settingsTab.evaluate(button => {
    const probe = document.createElement("span");
    button.append(probe);
    probe.style.background = "var(--mt-select-surface)";
    const sameThemePaint = getComputedStyle(button).backgroundColor === getComputedStyle(probe).backgroundColor;
    probe.remove();
    return sameThemePaint;
  });
  assert(selectedPaint, "The rail's selected tab uses the active theme token");
  assert.deepEqual(errors, []);
  console.log("Panel SSR companion browser: compact and dark header, focus recovery, four docks, keyboard resize and restore passed");
} finally {
  await browser?.close();
  await server.close();
}

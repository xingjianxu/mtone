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

  const ide = page.getByTestId("ide");
  const splitter = ide.locator(".mt-splitter");
  const workbench = ide.getByLabel("工作面板", { exact: true });
  const editor = ide.getByLabel("代码编辑器", { exact: true });
  const sep = ide.getByRole("separator");
  const workbenchPanel = workbench.locator(".mt-ide-panel");
  const command = workbench.getByRole("textbox", { name: "输入命令" });
  await expect(ide.getByRole("button", { name: "底部" })).toHaveAttribute("aria-pressed", "true");
  await expect(splitter).toHaveAttribute("data-orientation", "vertical");
  const bottomBefore = await workbench.boundingBox();
  assert(bottomBefore.y > (await editor.boundingBox()).y);
  await command.fill("npm run dev");
  await sep.focus();
  await page.keyboard.press("ArrowUp");
  await expect.poll(async () => (await workbench.boundingBox()).height).toBeGreaterThan(bottomBefore.height + 1);
  const restored = (await workbench.boundingBox()).height;
  await workbench.getByRole("button", { name: "收起面板" }).click();
  await expect.poll(async () => (await workbench.boundingBox()).height).toBeCloseTo(34, 0);
  await expect(workbenchPanel).toHaveAttribute("data-collapsed", "true");
  await expect(command).toHaveCount(0);
  await workbench.getByRole("button", { name: "清空终端记录" }).click();
  await workbench.getByRole("button", { name: "展开面板" }).click();
  await expect.poll(async () => (await workbench.boundingBox()).height).toBeCloseTo(restored, 0);
  await expect(command).toHaveValue("npm run dev");
  await expect(workbench.getByText("VITE ready")).toHaveCount(0);

  for (const [dock, orientation, first] of [
    ["顶部", "vertical", true],
    ["左侧", "horizontal", true],
    ["右侧", "horizontal", false],
  ]) {
    await ide.getByRole("button", { name: dock }).click();
    await expect(splitter).toHaveAttribute("data-orientation", orientation);
    const axis = orientation === "vertical" ? "y" : "x";
    const dimension = orientation === "vertical" ? "height" : "width";
    const pane = await workbench.boundingBox();
    const code = await editor.boundingBox();
    assert(first ? pane[axis] < code[axis] : pane[axis] > code[axis], dock);
    await expect(command).toHaveValue("npm run dev");
    await workbench.getByRole("button", { name: "收起面板" }).click();
    await expect.poll(async () => (await workbench.boundingBox())[dimension]).toBeCloseTo(orientation === "vertical" ? 34 : 144, 0);
    const restoreControl = workbench.getByRole("button", { name: "展开面板" });
    const restoreBox = await restoreControl.boundingBox();
    const rail = await workbench.boundingBox();
    assert(restoreBox.x >= rail.x && restoreBox.x + restoreBox.width <= rail.x + rail.width + 1, dock);
    await restoreControl.press("Enter");
    await expect.poll(async () => (await workbench.boundingBox())[dimension]).toBeCloseTo(pane[dimension], 0);
  }
  await page.setViewportSize({ width: 320, height: 850 });
  await workbench.getByRole("button", { name: "收起面板" }).click();
  await expect(workbench.getByRole("button", { name: "展开面板" })).toBeVisible();
  await expect(workbench.getByRole("tablist")).toBeVisible();
  assert.deepEqual(errors, []);
  console.log("Panel SSR companion browser: compact and dark header, focus recovery, four docks, keyboard resize and restore passed");
} finally {
  await browser?.close();
  await server.close();
}

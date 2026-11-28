import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, expect } from "@playwright/test";
import { createServer } from "vite";

const cacheDir = await mkdtemp(join(tmpdir(), "mtone-playgrounds-"));
let browser, server;
try {
  server = await createServer({
    root: "apps/docs",
    cacheDir,
    server: { host: "127.0.0.1", port: 0 },
    logLevel: "error",
  });
  await server.listen();
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || process.env.BROWSER_PATH,
  });
  const page = await browser.newPage({
    viewport: { width: 1360, height: 860 },
  });
  const base = server.resolvedUrls.local[0];
  const go = (name) => page.goto(new URL(`#/components/${name}`, base).href);
  await go("Tree?section=playground");
  const treeDemo = page.locator('main [data-playground="Tree"]');
  const tree = treeDemo.getByRole("tree", { name: "树形配置预览" });
  const toggle = (name) => treeDemo.getByRole("button", { name, exact: true });
  await expect(tree).toHaveClass(/mt-tree-lines/);
  await toggle("连接线").click();
  await expect(tree).not.toHaveClass(/mt-tree-lines/);
  await treeDemo.getByRole("combobox", { name: "选择" }).click();
  await page.getByRole("option", { name: "选择：多选", exact: true }).click();
  await expect(tree).toHaveAttribute("aria-multiselectable", "true");
  await toggle("更多设置").click();
  const advanced = page.getByRole("dialog", { name: "Tree 更多设置" });
  await expect(
    advanced.getByRole("switch", { name: "父子独立勾选" }),
  ).toBeDisabled();
  await advanced
    .getByRole("textbox", { name: "节点间距（px）" })
    .press("ArrowUp");
  await expect(tree).toHaveCSS("height", "224px");
  assert.equal(
    await tree.evaluate((node) =>
      node.style.getPropertyValue("--_mt-tree-row-gap"),
    ),
    "3px",
  );
  await advanced.getByRole("button", { name: "全部展开" }).click();
  await expect(tree.getByRole("treeitem", { name: "往年记录" })).toBeVisible();
  await advanced.getByRole("button", { name: "全部折叠" }).click();
  await expect(tree.getByRole("treeitem", { name: "往年记录" })).toHaveCount(0);
  await advanced.press("Escape");
  await expect(toggle("更多设置")).toBeFocused();
  await toggle("重置").click();
  await expect(tree).toHaveClass(/mt-tree-lines/);
  await expect(tree).not.toHaveAttribute("aria-multiselectable", "true");

  for (const name of [
    "Tree",
    "Button",
    "Select",
    "PageLayout",
    "Panel",
    "BlockEditor",
    "DataTable",
    "AiChat",
  ]) {
    await page.setViewportSize({ width: 390, height: 800 });
    await go(name);
    const toolbar = page.getByRole("group", {
      name: `${name} 示例设置`,
      exact: true,
    });
    await expect(toolbar).toBeVisible();
    assert(
      await toolbar.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      `${name} toolbar is wider than its frame`,
    );
    if (
      await toolbar
        .getByRole("button", { name: "更多设置", exact: true })
        .count()
    ) {
      await toolbar
        .getByRole("button", { name: "更多设置", exact: true })
        .click();
      const popover = page.getByRole("dialog", { name: `${name} 更多设置` });
      await expect(popover).toBeVisible();
      const bounds = await popover.boundingBox();
      assert(
        bounds && bounds.x >= 0 && bounds.x + bounds.width <= 391,
        `${name} settings exceed viewport`,
      );
      await popover.press("Escape");
    }
    if (name === "Button") {
      const sample = page.locator(
        '[data-playground="Button"] .docs-playground-preview button',
      );
      await toolbar.getByRole("combobox", { name: "尺寸" }).click();
      await page.getByRole("option", { name: "尺寸：lg", exact: true }).click();
      await expect(sample).toHaveClass(/mt-size-lg/);
      await toolbar.getByRole("button", { name: "重置" }).click();
      await expect(sample).toHaveClass(/mt-size-md/);
    }
    if (name === "BlockEditor") {
      const preview = page.locator(
        '[data-playground="BlockEditor"] .docs-playground-preview',
      );
      await expect(preview.locator('[contenteditable="true"]')).toBeVisible();
      await toolbar.getByRole("button", { name: "只读" }).click();
      await expect(preview.locator('[contenteditable="true"]')).toHaveCount(0);
    }
  }
  console.log(
    "Playgrounds: real Tree settings, keyboard dismissal and reset; eight mobile component routes fit.",
  );
} finally {
  await browser?.close();
  await server?.close();
  await rm(cacheDir, { recursive: true, force: true });
}

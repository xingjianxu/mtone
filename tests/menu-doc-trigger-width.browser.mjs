import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, expect } from "@playwright/test";
import { createServer } from "vite";

const cacheDir = await mkdtemp(join(tmpdir(), "mtone-menu-doc-width-"));
let browser, server;

async function assertContentWidth(trigger) {
  await expect(trigger).toBeVisible();
  const geometry = await trigger.evaluate((button) => {
    const triggerBox = button.getBoundingClientRect();
    const parent = button.parentElement;
    const probe = button.cloneNode(true);
    probe.removeAttribute("id");
    probe.setAttribute("aria-hidden", "true");
    probe.style.position = "absolute";
    probe.style.width = "max-content";
    probe.style.visibility = "hidden";
    parent.append(probe);
    const naturalWidth = probe.getBoundingClientRect().width;
    probe.remove();
    return {
      name: button.textContent.trim(),
      width: triggerBox.width,
      naturalWidth,
      available: parent.clientWidth,
    };
  });
  const details = JSON.stringify(geometry);
  assert(Math.abs(geometry.width - geometry.naturalWidth) < 1, details);
  assert(geometry.width < geometry.available, details);
}

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
    executablePath: process.env.CHROMIUM_PATH,
  });
  const page = await browser.newPage();
  const base = server.resolvedUrls.local[0];
  const menuName = "文档操作";
  const alignedName = "右对齐菜单，宽度 240px";
  const stringTriggerName = "默认文字触发";
  for (const viewport of [1440, 390]) {
    await page.setViewportSize({ width: viewport, height: 840 });
    await page.goto(new URL("#/components/Menu", base).href);
    const plain = page.getByRole("button", { name: menuName, exact: true });
    const aligned = page.getByRole("button", { name: alignedName, exact: true });
    await assertContentWidth(plain);
    await assertContentWidth(aligned);
    const stringTrigger = page.getByRole("button", { name: stringTriggerName, exact: true });
    await assertContentWidth(stringTrigger);
    const preset = page.getByRole("button", { name: "预设按钮触发", exact: true });
    const custom = page.getByRole("button", { name: "自定义元素触发", exact: true });
    await expect(preset.locator(".mt-btn-section-end svg")).toHaveAttribute("width", "14");
    await expect(custom.locator(".mt-btn-section-end svg")).toHaveAttribute("width", "16");
    await expect(stringTrigger.locator(".mt-btn-section-end svg")).toHaveAttribute("aria-hidden", "true");
    await stringTrigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menuitem", { name: "导出 PDF", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(stringTrigger).toBeFocused();
    await expect(page.getByRole("menu")).toHaveCount(0);

    await plain.click();
    const defaultPanel = page.getByRole("menu");
    await expect(defaultPanel.getByRole("menuitem", { name: "打开文档" })).toBeVisible();
    const [defaultBox, plainBox] = await Promise.all([defaultPanel.boundingBox(), plain.boundingBox()]);
    assert(defaultBox.width >= 160 && defaultBox.width < 240 && defaultBox.width > plainBox.width);
    assert(Math.abs(defaultBox.x - plainBox.x) < 1, "default panel is start aligned");
    await page.keyboard.press("Escape");
    await expect(defaultPanel).toHaveCount(0);

    await aligned.click();
    const fixedPanel = page.getByRole("menu");
    await expect(fixedPanel.getByRole("menuitem", { name: "打开文档" })).toBeVisible();
    const [fixedBox, alignedBox] = await Promise.all([fixedPanel.boundingBox(), aligned.boundingBox()]);
    assert(Math.abs(fixedBox.width - 240) < 1, "documented panel width is unchanged");
    if (viewport === 1440) {
      assert(Math.abs(fixedBox.x + fixedBox.width - alignedBox.x - alignedBox.width) < 1, "wide-screen right alignment is unchanged");
    }
    assert(fixedBox.x >= 0 && fixedBox.x + fixedBox.width <= viewport + 1, "popup stays within the viewport");
    await page.keyboard.press("Escape");
  }

  await page.setViewportSize({ width: 1440, height: 840 });
  await page.goto(new URL("#/gallery", base).href);
  const card = page.locator(".gallery-card").filter({
    has: page.getByRole("link", { name: "Menu", exact: true }),
  });
  await assertContentWidth(card.getByRole("button", { name: menuName, exact: true }));
  await assertContentWidth(card.getByRole("button", { name: alignedName, exact: true }));

  await page.goto(new URL("#/components/Button?section=dropdown-preset", base).href);
  const standalone = page.getByRole("button", { name: "筛选方式", exact: true });
  await expect(standalone.locator(".mt-btn-section-end svg")).toHaveAttribute("width", "14");
  await expect(standalone).not.toHaveAttribute("aria-haspopup", "menu");
  await standalone.click();
  await expect(page.getByRole("status").filter({ hasText: "普通点击次数：1" })).toBeVisible();
  await expect(page.getByRole("menu")).toHaveCount(0);

  const mobile = await browser.newPage({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 840 } });
  await mobile.goto(new URL("#/components/Menu?section=trigger-options", base).href);
  await mobile.getByRole("button", { name: stringTriggerName, exact: true }).tap();
  await expect(mobile.getByRole("menuitem", { name: "导出 PDF", exact: true })).toBeVisible();
  await mobile.getByRole("menuitem", { name: "导出 PDF", exact: true }).tap();
  await expect(mobile.getByRole("status").filter({ hasText: "默认文字：pdf" })).toBeVisible();
  await mobile.close();

  console.log("Menu docs: content-sized triggers on desktop/mobile and in the gallery; popup widths and alignment preserved");
} finally {
  await browser?.close();
  await server?.close();
  await rm(cacheDir, { recursive: true, force: true });
}

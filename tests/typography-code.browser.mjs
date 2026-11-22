import { chromium, expect } from "@playwright/test";
import { preview } from "vite";

// Use the actual production output under the same non-root path as Pages.
const server = await preview({
  configFile: false,
  base: "/mtone/",
  build: { outDir: "dist/docs" },
  preview: { host: "127.0.0.1", port: 0, strictPort: true },
  logLevel: "error",
});
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH });
  const page = await browser.newPage({ viewport: { width: 320, height: 680 }, colorScheme: "light" });
  const base = new URL(server.resolvedUrls.local[0]);
  const highlightRequests = [];
  const foreignRequests = [];
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.origin === base.origin) return route.continue();
    foreignRequests.push(url.href);
    return route.abort();
  });
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (/\/(?:typography-highlight|python|rust|vue)-[^/]+\.js$/.test(url.pathname)) highlightRequests.push(url);
  });
  await page.goto(new URL("#/components/Typography?section=Code", base).href);
  const title = page.getByRole("heading", { name: "Code", exact: true });
  await expect(title).toBeFocused();
  const block = page.getByLabel("配置示例", { exact: true });
  const inline = page.locator("code.mt-typography-code", { hasText: "npm test" });
  const inlineLegacy = page.locator(".mt-typography code", { hasText: "npm install @bixlab/mtone" }).first();
  await expect(block).toHaveCSS("white-space", "pre");
  await expect(inline).toHaveCSS("background-color", await inlineLegacy.evaluate((el) => getComputedStyle(el).backgroundColor));
  await expect(inline).toHaveCSS("padding-inline-start", "4px");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  expect(await block.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
  await expect(block).toHaveAttribute("tabindex", "0");
  await page.keyboard.press("Tab");
  await expect(block).toBeFocused();
  await expect(block).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => block.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.scrollX)).toBe(0);

  const light = await block.evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.getByRole("button", { name: "深色", exact: true }).click();
  await expect(block).not.toHaveCSS("background-color", light);
  await expect(inline).toHaveCSS("background-color", await block.evaluate((el) => getComputedStyle(el).backgroundColor));

  await page.setViewportSize({ width: 1550, height: 720 });
  await expect.poll(() => block.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(false);
  await expect(block).not.toHaveAttribute("tabindex", "0");
  const fixed = page.getByLabel("预先着色的 TSX 示例", { exact: true });
  const live = page.getByLabel("可切换高亮的 Python 示例", { exact: true });
  const fixedTokens = fixed.locator(".mt-code-token");
  expect(await fixedTokens.count()).toBeGreaterThan(0);
  await expect(live.locator(".mt-code-token")).toHaveCount(0);
  expect(highlightRequests).toEqual([]);
  const liveText = await live.locator("code").textContent();
  const darkColor = await fixedTokens.first().evaluate((token) => getComputedStyle(token).color);
  await page.getByRole("button", { name: "浅色", exact: true }).click();
  await expect(fixedTokens.first()).not.toHaveCSS("color", darkColor);
  expect(highlightRequests).toEqual([]);
  await page.getByRole("button", { name: "实时语法高亮" }).click();
  const liveTokens = live.locator(".mt-code-token");
  await expect(liveTokens.first()).toBeVisible();
  expect(await live.locator("code").textContent()).toBe(liveText);
  expect(highlightRequests.some((url) => /\/typography-highlight-/.test(url.pathname))).toBe(true);
  expect(highlightRequests.some((url) => /\/python-/.test(url.pathname))).toBe(true);
  expect(highlightRequests.some((url) => /\/rust-/.test(url.pathname))).toBe(false);
  expect(highlightRequests.every((url) => url.origin === base.origin &&
    url.pathname.startsWith("/mtone/assets/"))).toBe(true);
  expect(foreignRequests).toEqual([]);
  await page.getByRole("button", { name: "实时语法高亮" }).click();
  await expect(liveTokens).toHaveCount(0);

  const vueText = '动态文字 "quoted"';
  await page.getByRole("button", { name: "Vue 混合语法" }).click();
  await page.getByRole("textbox", { name: "Vue 示例文字" }).fill(vueText);
  const vue = page.getByLabel("实时高亮的 Vue 示例");
  await expect(vue.locator(".mt-code-token", { hasText: /^const$/ })).toBeVisible();
  await expect(vue.locator(".mt-code-token", { hasText: /^string$/ })).toBeVisible();
  const exactVue = `<script setup lang="ts">
const label: string = ${JSON.stringify(vueText)};
</script>
<template><p>{{ label }}</p></template>`;
  expect(await vue.locator("code").textContent()).toBe(exactVue);
  expect(highlightRequests.some((url) => /\/vue-/.test(url.pathname))).toBe(true);
  expect(foreignRequests).toEqual([]);
  console.log("Typography.Code keyboard, exact source and on-origin production highlighting verified");
} finally {
  await browser?.close();
  await server.close();
}

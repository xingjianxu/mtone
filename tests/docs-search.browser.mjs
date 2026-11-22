import { execSync } from "node:child_process";
import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { preview } from "vite";
import { chromium, firefox, webkit } from "@playwright/test";
import assert from "node:assert/strict";

// Browser navigation should use the shipped app, not Vite's cold optimizer
// (which can reload the page while assertions are inspecting its DOM).
const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const docsDist = fileURLToPath(new URL("../dist/docs/", import.meta.url));
if (process.env.MTONE_DOCS_PREBUILT !== "1") {
  execSync("npm run build:docs", { cwd: repoRoot, stdio: "inherit" });
}
for (const file of ["index.html", "showcase.html"]) {
  await access(new URL(`../dist/docs/${file}`, import.meta.url)).catch((error) => {
    throw new Error(`Missing built docs file ${file}; run npm run build:docs before using MTONE_DOCS_PREBUILT=1.`, { cause: error });
  });
}
const base = "http://127.0.0.1:5197/mtone/";
const server = await preview({
  root: repoRoot,
  configFile: false,
  base: "/mtone/",
  build: { outDir: docsDist },
  preview: { host: "127.0.0.1", port: 5197, strictPort: true },
  logLevel: "error",
});
let browser;
try {
  const engine = process.env.BROWSER || "chromium";
  browser = await ({ chromium, firefox, webkit })[engine].launch({ headless: true, executablePath: process.env.CHROMIUM_PATH });
  const page = await browser.newPage();
  const sidebar = page.locator(".docs-sidebar");
  const goToStart = async () => {
    await page.goto(`${base}#/start`);
    await sidebar.locator('a[href="#/start"][aria-current="page"]').waitFor({ state: "attached" });
  };
  for (const width of [1280, 768, 360, 320]) {
    await page.setViewportSize({ width, height: 740 });
    await goToStart();
    const toggle = page.locator(".mobile-menu");
    const mobile = await toggle.isVisible();
    if (mobile) await toggle.click();
    const groups = sidebar.locator("nav > .mt-nav-group");
    assert.deepEqual((await groups.evaluateAll((elements) =>
      elements.slice(0, 2).map((group) => getComputedStyle(group).marginTop))), ["0px", "12px"]);
    assert.equal(await groups.first().locator(".mt-nav-label").textContent(), "开始使用");
    const links = groups.first().locator(":scope > a");
    assert.deepEqual(await links.evaluateAll((elements) =>
      elements.slice(0, 2).map((link) => [getComputedStyle(link).height, getComputedStyle(link).marginTop])),
      [["32px", "0px"], ["32px", "3px"]]);
    assert.equal(await links.first().getAttribute("aria-current"), "page");
    if (width === 1280 || width === 360) {
      const popupGroup = groups.filter({ has: page.locator(".mt-nav-label", { hasText: "弹层与菜单" }) });
      assert.deepEqual(await popupGroup.locator(":scope > a").evaluateAll((anchors) =>
        anchors.slice(0, 4).map((anchor) => [anchor.textContent, anchor.getAttribute("href")])
      ), [
        ["Popover", "#/components/Popover"], ["Menu", "#/components/Menu"],
        ["ContextMenu", "#/components/ContextMenu"], ["Menubar", "#/components/Menubar"],
      ]);
      if (mobile) {
        await popupGroup.getByRole("link", { name: "Menu", exact: true }).click();
        await page.waitForURL("**/#/components/Menu");
        assert.equal(await toggle.getAttribute("aria-expanded"), "false");
        await toggle.click();
        await popupGroup.getByRole("link", { name: "Menu", exact: true, current: "page" }).waitFor();
        await goToStart();
        await toggle.click();
      }
    }
    const showcase = sidebar.getByRole("link", { name: "应用示例", exact: true });
    assert.equal(await showcase.getAttribute("href"), "./showcase.html");
    assert.equal(await showcase.getAttribute("target"), "_blank");
    const activeRow = links.first();
    const paletteMatches = () => activeRow.evaluate((anchor) => {
      const probe = document.createElement("span");
      anchor.append(probe);
      probe.style.backgroundColor = "var(--mt-nav-selected)";
      const bg = getComputedStyle(probe).backgroundColor;
      probe.style.backgroundColor = "var(--mt-blue)";
      const marker = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return getComputedStyle(anchor).backgroundColor === bg
        && getComputedStyle(anchor, "::before").backgroundColor === marker;
    });
    assert(await paletteMatches());
    if (width === 1280) {
      await page.emulateMedia({ colorScheme: "dark" });
      assert(await paletteMatches());
      await page.emulateMedia({ colorScheme: "light" });
      const themeLink = sidebar.getByRole("link", { name: "主题与样式", exact: true });
      if (engine === "chromium") {
        for (const options of [{ modifiers: ["Control"] }, { button: "middle" }]) {
          const [newTab] = await Promise.all([
            page.context().waitForEvent("page"),
            themeLink.click(options),
          ]);
          await newTab.waitForURL("**/#/theme");
          assert(page.url().endsWith("#/start"));
          await newTab.close();
        }
        const [example] = await Promise.all([page.waitForEvent("popup"), showcase.click()]);
        await example.waitForURL("**/showcase.html");
        await example.close();
      }
      await themeLink.focus();
      await page.keyboard.press("Enter");
      await page.waitForURL("**/#/theme");
      await sidebar.locator('a[href="#/theme"][aria-current="page"]').waitFor();
      await goToStart();
    }
    if (mobile) {
      await sidebar.getByRole("link", { name: "主题与样式", exact: true }).click();
      await page.waitForURL("**/#/theme");
      assert.equal(await toggle.getAttribute("aria-expanded"), "false");
    }
    const trigger = page.getByRole("button", { name: "搜索组件", exact: true });
    assert.equal(await page.locator(".docs-sidebar input").count(), 0);
    assert(await page.locator(".topbar").evaluate(el => el.scrollWidth <= el.clientWidth));
    await trigger.click();
    const input = page.getByRole("combobox");
    await input.waitFor();
    await page.waitForFunction(() => document.activeElement?.getAttribute("role") === "combobox");
    assert(await page.getByRole("dialog").evaluate(el => {
      const r = el.getBoundingClientRect();
      return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight;
    }));
    await page.keyboard.press("Tab");
    await page.waitForFunction(() => document.querySelector('[role="dialog"]')?.contains(document.activeElement));
    await input.focus();
    await input.fill("ButtonGroup");
    await input.press("Enter");
    await page.waitForURL("**/#/components/ButtonGroup");
    await page.getByRole("dialog").waitFor({ state: "detached" });
    await page.keyboard.press("Control+k");
    await input.waitFor();
    assert.equal(await input.inputValue(), "");
    await input.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "detached" });
    await page.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "搜索组件");
    await page.goto(`${base}#/components/Input`);
    const editor = page.locator(".example-stage input:not([disabled])").first();
    await editor.focus();
    await page.keyboard.press("Control+k");
    assert.equal(await page.getByRole("dialog").count(), 0);
  }
  console.log("Docs Spotlight desktop/mobile keyboard and layout checks passed");
} finally {
  await browser?.close();
  await server.close();
}

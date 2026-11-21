import { createServer } from "vite";
import { chromium, firefox, webkit } from "@playwright/test";
import assert from "node:assert/strict";
const server = await createServer({ root: "apps/docs", server: { host: "127.0.0.1", port: 5197, strictPort: true }, logLevel: "error" });
await server.listen();
let browser;
try {
  const engine = process.env.BROWSER || "chromium";
  browser = await ({ chromium, firefox, webkit })[engine].launch({ headless: true, executablePath: process.env.CHROMIUM_PATH });
  const page = await browser.newPage();
  for (const width of [1280, 768, 360, 320]) {
    await page.setViewportSize({ width, height: 740 });
    await page.goto("http://127.0.0.1:5197/#/start");
    const sidebar = page.locator(".docs-sidebar");
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
      await page.goto("http://127.0.0.1:5197/#/start");
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
    await page.goto("http://127.0.0.1:5197/#/components/Input");
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

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

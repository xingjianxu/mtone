import assert from "node:assert/strict";
import { createServer } from "vite";
import { chromium, firefox, webkit } from "@playwright/test";
const port = 5217;
const server = await createServer({ root: "apps/docs", server: { host: "127.0.0.1", port, strictPort: true }, logLevel: "error" });
await server.listen();
let browser;
try {
  browser = await ({ chromium, firefox, webkit })[process.env.BROWSER || "chromium"].launch({ headless: true, executablePath: process.env.CHROMIUM_PATH });
  const page = await browser.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
      writeText: async (text) => { window.lastClipboardWrite = text; }
    } });
  });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(`http://127.0.0.1:${port}/#/components/Table`);
    await page.getByRole("heading", { level: 1, name: "Table", exact: true }).waitFor();
    if (width < 1111) await page.locator(".component-outline-mobile > summary").click();
    const outline = page.getByRole("navigation", { name: "本页目录", exact: true });
    const anchor = outline.getByRole("link", { name: "表头选择菜单", exact: true });
    const href = await anchor.getAttribute("href");
    await anchor.click();
    await page.waitForURL(url => url.hash === href);
    const id = new URLSearchParams(href.split("?")[1]).get("section");
    await page.waitForFunction((id) => document.activeElement?.id === id, id);
    const demo = page.locator(`#${id}`).locator("..");
    const codeToggle = demo.getByText("查看代码", { exact: true });
    await codeToggle.click();
    const code = await demo.locator("pre > code").textContent();
    assert(code.includes("@bixlab/mtone") && code.includes("Table"));
    await demo.getByRole("button", { name: "复制代码" }).click();
    await page.waitForFunction((code) => window.lastClipboardWrite === code, code);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.reload();
    await page.waitForFunction((id) => document.activeElement?.id === id, id);
    await page.goto(`http://127.0.0.1:${port}/#/components/Input?section=input-search`);
    await page.waitForFunction(() => document.activeElement?.id === "input-search");
    assert.equal(await page.getByRole("heading", { level: 1, name: "Input", exact: true }).count(), 1);
  }
  console.log("Component docs: desktop/mobile outline, deep links, exact clipboard source and Input section links passed");
} finally {
  await browser?.close();
  await server.close();
}

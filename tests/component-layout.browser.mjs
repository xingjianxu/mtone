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
    const disclosure = page.locator(".component-outline .mt-toc-disclosure");
    const openOutline = async () => {
      if (width < 1111) {
        await disclosure.and(page.locator("[data-collapsible]")).waitFor();
        await disclosure.locator("summary").press("Enter");
        assert(await disclosure.evaluate((el) => el.open));
      }
    };
    assert.equal(await disclosure.locator("nav[data-mt-toc]").count(), 1);
    await openOutline();
    const outline = page.getByRole("navigation", { name: "本页目录", exact: true });
    const anchor = outline.getByRole("link", { name: "表头选择菜单", exact: true });
    const href = await anchor.getAttribute("href");
    await anchor.click();
    await page.waitForURL(url => url.hash === href);
    const id = new URLSearchParams(href.split("?")[1]).get("section");
    await page.waitForFunction((id) => document.activeElement?.id === id, id);
    if (width < 1111) assert.equal(await disclosure.evaluate((el) => el.open), false);
    await openOutline();
    await anchor.click();
    await page.waitForFunction((id) => document.activeElement?.id === id, id);
    if (width < 1111) assert.equal(await disclosure.evaluate((el) => el.open), false);
    const targetTop = await page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect().top);
    assert(targetTop >= 70 && targetTop <= 105, `same-hash routed section at ${targetTop}`);
    const demo = page.locator(`#${id}`).locator("..");
    const source = demo.locator("details.component-demo-source");
    const codeToggle = source.locator("summary").filter({ hasText: "查看代码" });
    const codeBlock = source.locator("pre.mt-typography-code-block");
    assert.equal(await source.evaluate((element) => element.open), false);
    assert.equal(await source.locator(".mt-code-token").count(), 0);
    await codeToggle.press("Enter");
    await codeBlock.waitFor();
    const code = await codeBlock.locator("code").textContent();
    assert(code.includes("@bixlab/mtone") && code.includes("Table"));
    await codeBlock.locator(".mt-code-token").first().waitFor();
    assert.equal(await codeBlock.locator("code").textContent(), code);
    const copy = source.getByRole("button", { name: "复制代码" });
    await codeToggle.press("Tab");
    assert(await copy.evaluate((el) => el === document.activeElement));
    await copy.press("Enter");
    await page.waitForFunction((code) => window.lastClipboardWrite === code, code);
    await copy.press("Tab");
    assert(await codeBlock.evaluate((el) => el === document.activeElement));
    const geometry = await codeBlock.evaluate((el) => ({
      scrollsVertically: el.scrollHeight > el.clientHeight && el.clientHeight <= window.innerHeight * .6,
      scrollsHorizontally: el.scrollWidth > el.clientWidth && getComputedStyle(el).overflowX === "auto",
      fitsDisclosure: el.getBoundingClientRect().right <= el.closest("details").getBoundingClientRect().right + 1,
    }));
    assert(geometry.scrollsVertically && geometry.fitsDisclosure, JSON.stringify(geometry));
    if (width < 500) assert(geometry.scrollsHorizontally, JSON.stringify(geometry));
    await codeToggle.press("Space");
    await codeBlock.waitFor({ state: "hidden" });
    await codeToggle.press("Enter");
    await codeBlock.waitFor();
    assert.equal(await codeBlock.locator("code").textContent(), code);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForFunction(() => {
      const links = document.querySelectorAll(".component-outline nav a");
      return links[links.length - 1]?.getAttribute("aria-current") === "location";
    });
    await page.reload();
    await page.waitForFunction((id) => document.activeElement?.id === id, id);
    await page.goto(`http://127.0.0.1:${port}/#/components/Input?section=input-search`);
    await page.waitForFunction(() => document.activeElement?.id === "input-search");
    assert.equal(await page.getByRole("heading", { level: 1, name: "Input", exact: true }).count(), 1);
  }
  console.log("Component docs: desktop/mobile outline, deep links, keyboard code disclosure, exact clipboard source and Input section links passed");
} finally {
  await browser?.close();
  await server.close();
}

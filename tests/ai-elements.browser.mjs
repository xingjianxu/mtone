import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import { createServer } from "vite";

const server = await createServer({ root: process.cwd(), server: { host: "127.0.0.1", port: 0 }, logLevel: "error" });
await server.listen();
const url = new URL("tests/fixtures/ai-elements.html", server.resolvedUrls.local[0]).href;
await mkdir("artifacts/ai-elements-browser", { recursive: true });
try {
  for (const [name, engine, executablePath] of [["chromium", chromium, process.env.CHROMIUM_PATH], ["firefox", firefox], ["webkit", webkit]]) {
    if (process.env.MTONE_BROWSER && process.env.MTONE_BROWSER !== name) continue;
    const browser = await engine.launch({ headless: true, executablePath });
    try {
      const page = await browser.newPage({ viewport: { width: 320, height: 850 } });
      await page.goto(url);
      const log = page.getByRole("log", { name: "Agent conversation" });
      const bottom = () => log.evaluate(el => el.scrollHeight - el.clientHeight - el.scrollTop);
      await expect.poll(bottom).toBeLessThan(2);
      await log.evaluate(el => { el.scrollTop = 0; });
      const jump = page.getByRole("button", { name: "Jump to latest" });
      await expect(jump).toBeVisible();
      await page.getByRole("button", { name: "Append", exact: true }).click();
      await expect(log.getByText("Stream update")).toBeAttached();
      await expect.poll(() => log.evaluate(el => el.scrollTop)).toBeLessThan(2);
      await jump.click();
      await expect.poll(bottom).toBeLessThan(2);
      const input = page.getByRole("textbox", { name: "Message", exact: true });
      await input.fill("Draft");
      await input.press("Shift+Enter");
      await input.press("A");
      assert.match(await input.inputValue(), /Draft\n/i);
      await input.press("Enter");
      await expect(log.getByText("Draft", { exact: false })).toBeAttached();
      await expect(input).toHaveValue("");
      await page.getByRole("button", { name: "Confirm", exact: true }).focus();
      await page.keyboard.press("Enter");
      await expect(page.getByText("Confirmed", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Toggle theme" }).click();
      await expect(page.locator("[data-mt-theme]").first()).toHaveAttribute("data-mt-theme", "dark");
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "no page overflow at 320px");
      await page.screenshot({ path: `artifacts/ai-elements-browser/${name}-dark.png` });
      console.log(`${name}: AI scroll retention, keyboard compose/approval and narrow dark appearance passed`);
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}

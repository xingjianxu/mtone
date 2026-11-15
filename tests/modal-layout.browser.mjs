import { createServer } from "vite";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const server = await createServer({ root: process.cwd(), server: { port: 5188, host: "127.0.0.1", strictPort: true }, logLevel: "error" });
await server.listen();
let browser;
try {
  browser = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), headless: true });
  const page = await browser.newPage();
  for (const width of [900, 360]) for (const density of ["compact", "comfortable"]) for (const mode of ["normal", "long", "empty", "wrap"]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(`http://127.0.0.1:5188/tests/fixtures/modal-layout.html?mode=${mode}&density=${density}`);
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    const result = await dialog.evaluate((el) => {
      const box = el.getBoundingClientRect();
      const title = el.querySelector(".mt-dialog-title").getBoundingClientRect();
      const close = el.querySelector(".mt-dialog-close").getBoundingClientRect();
      const footer = el.querySelector(".mt-dialog-footer");
      let gaps = [], groupGaps = null;
      if (footer) {
        const f = footer.getBoundingClientRect(), style = getComputedStyle(footer);
        const buttons = [...footer.querySelectorAll("button")].map(button => button.getBoundingClientRect());
        groupGaps = { top: Math.min(...buttons.map(b => b.top)) - f.top - parseFloat(style.borderTopWidth), bottom: f.bottom - Math.max(...buttons.map(b => b.bottom)) - parseFloat(style.borderBottomWidth), wrapped: buttons[0].top !== buttons[1].top };
        gaps = [...footer.querySelectorAll("button")].map(button => { const b = button.getBoundingClientRect(); return { top: b.top - f.top - parseFloat(style.borderTopWidth), bottom: f.bottom - b.bottom - parseFloat(style.borderBottomWidth) }; });
      }
      return { gaps, groupGaps, delta: Math.abs((title.top + title.bottom - close.top - close.bottom) / 2), right: box.right, left: box.left, overflow: el.scrollWidth > el.clientWidth, closeInside: close.left >= box.left && close.right <= box.right, titleGap: close.left - title.right };
    });
    console.log({ width, density, mode, ...result });
    assert(result.left >= 0 && result.right <= width && !result.overflow && result.closeInside, "Responsive containment");
    if (mode !== "empty") {
      assert(result.delta < 0.5, "Title and close must share vertical center");
      assert(result.titleGap >= 8, "Title must not overlap close");
      assert.equal(result.gaps.length, 2);
      assert.equal(result.groupGaps.top, 12);
      assert.equal(result.groupGaps.bottom, 12);
      if (mode === "wrap" && width === 360) assert(result.groupGaps.wrapped, "Long buttons must wrap on narrow screens");
      if (!result.groupGaps.wrapped) for (const gap of result.gaps) assert(Math.abs(gap.top - gap.bottom) < 0.5, "Footer button gaps must be equal");
    } else { assert.equal(result.gaps.length, 0); await page.getByRole("dialog", { name: "对话框", exact: true }).waitFor(); }
    await page.getByRole("button", { name: "关闭", exact: true }).click();
    await dialog.waitFor({ state: "hidden" });
  }
  for (const mode of ["confirm", "drawer"]) {
    await page.goto(`http://127.0.0.1:5188/tests/fixtures/modal-layout.html?mode=${mode}`);
    await page.locator(".mt-dialog-footer").waitFor();
    assert.equal(await page.locator(".mt-modal-dialog").count(), 0, "Scoped Modal changes must not affect siblings");
    assert.equal(await page.locator(".mt-dialog-footer").evaluate(el => getComputedStyle(el).marginTop), "24px");
  }
} finally { await browser?.close(); await server.close(); }

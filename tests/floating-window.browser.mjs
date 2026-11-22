import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { createServer } from "vite";

const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 0 },
  logLevel: "error",
});
await server.listen();
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH,
  });
  const url = new URL("tests/fixtures/floating-window.html", server.resolvedUrls.local[0]).href;
  const page = await browser.newPage({ viewport: { width: 900, height: 680 } });
  await page.goto(url);
  const opener = page.getByRole("button", { name: "Open notes", exact: true });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Notes", exact: true });
  await expect(dialog).toHaveAttribute("aria-modal", "false");
  await expect(dialog).toBeFocused();
  await expect(dialog).toHaveCSS("background-color", "rgb(32, 32, 31)");
  await page.getByRole("button", { name: "Background action" }).click();
  await expect(page.getByRole("status")).toHaveText("Background clicks: 1");
  await expect(dialog).toBeVisible();
  assert(await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight),
    "The window does not lock scrolling of the surrounding page");
  const content = dialog.locator(".mt-floating-window-content");
  assert(await content.evaluate((node) => node.scrollHeight > node.clientHeight),
    "Tall window content scrolls independently");
  await content.hover();
  await page.mouse.wheel(0, 50);
  await expect.poll(() => content.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);

  const geometry = async () => {
    const { x, y, width, height } = await dialog.boundingBox();
    return [x, y, width, height].map(Math.round);
  };
  await expect.poll(geometry).toEqual([120, 100, 380, 260]);
  const drag = async (control, dx, dy) => {
    const { x, y, width, height } = await control.boundingBox();
    await page.mouse.move(x + width / 2, y + height / 2);
    await page.mouse.down();
    await page.mouse.move(x + width / 2 + dx, y + height / 2 + dy, { steps: 4 });
    await page.mouse.up();
  };
  await drag(dialog.getByRole("heading", { name: "Notes" }), 110, 46);
  await expect.poll(geometry).toEqual([230, 146, 380, 260]);
  const resize = dialog.getByRole("button", { name: "Resize window" });
  await drag(resize, 96, 54);
  await expect.poll(geometry).toEqual([230, 146, 476, 314]);
  await dialog.getByRole("button", { name: "Move window" }).press("ArrowRight");
  await resize.press("Shift+ArrowDown");
  await expect.poll(geometry).toEqual([238, 146, 476, 338]);

  const draft = dialog.getByRole("textbox", { name: "Draft" });
  await draft.fill("A draft that survives");
  await dialog.getByRole("button", { name: "Minimize window" }).click();
  await expect(dialog).toHaveCount(0);
  const restore = page.getByRole("button", { name: "Restore window" });
  await expect(restore).toBeFocused();
  const icon = await restore.boundingBox();
  const viewport = await restore.evaluate(() => ({
    width: window.visualViewport.width,
    height: window.visualViewport.height,
  }));
  assert(Math.abs(icon.x + icon.width - viewport.width + 12) < 1);
  assert(Math.abs(icon.y + icon.height - viewport.height + 12) < 1);
  await restore.click();
  await expect(dialog).toBeFocused();
  await expect(draft).toHaveValue("A draft that survives");
  await expect.poll(geometry).toEqual([238, 146, 476, 338]);
  await page.setViewportSize({ width: 360, height: 270 });
  await expect.poll(geometry).toEqual([12, 12, 336, 246]);
  await dialog.getByRole("button", { name: "Close window" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();

  const touch = await browser.newPage({ viewport: { width: 430, height: 640 }, hasTouch: true, isMobile: true });
  await touch.goto(url);
  await touch.getByRole("button", { name: "Open notes", exact: true }).tap();
  const touchDialog = touch.getByRole("dialog", { name: "Notes" });
  await expect(touchDialog).toBeVisible();
  const touchMove = touchDialog.getByRole("button", { name: "Move window" });
  const grip = await touchMove.boundingBox();
  const leftBefore = (await touchDialog.boundingBox()).x;
  const session = await touch.context().newCDPSession(touch);
  const x = Math.round(grip.x + grip.width / 2), y = Math.round(grip.y + grip.height / 2);
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x - 9, y: y + 10 }] });
  await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x - 20, y: y + 24 }] });
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect.poll(async () => Math.round((await touchDialog.boundingBox()).x)).toBe(Math.round(leftBefore - 20));

  console.log("FloatingWindow: nonmodal pointer/touch/keyboard geometry, viewport bounds and minimize state verified");
} finally {
  await browser?.close();
  await server.close();
}

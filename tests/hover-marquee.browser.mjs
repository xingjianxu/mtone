import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { createServer } from "vite";

const server = await createServer({
  server: { host: "127.0.0.1", port: 5417, strictPort: true },
  logLevel: "error",
});
await server.listen();
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined });
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:5417/tests/fixtures/hover-marquee.html");
  const long = page.getByTestId("long");
  const short = page.getByTestId("short");
  const rtl = page.getByTestId("rtl");
  const track = (box) => box.locator(".mt-hover-marquee-text");
  const positionAt = (box, fraction) => track(box).evaluate((node, fraction) => {
    const animation = node.getAnimations()[0];
    const timing = animation.effect.getTiming();
    animation.pause();
    animation.currentTime = Number(timing.duration) * fraction;
    return new DOMMatrix(getComputedStyle(node).transform).m41;
  }, fraction);
  await expect(long).toHaveAttribute("tabindex", "0");
  await expect(track(long)).toHaveCSS("text-overflow", "ellipsis");
  await expect(track(long)).toHaveCSS("animation-name", "none");
  const outerWidth = (await long.boundingBox()).width;
  assert.equal(outerWidth, 142);
  await expect(short).not.toHaveAttribute("tabindex");
  await short.hover();
  await expect(track(short)).toHaveCSS("animation-name", "none");
  await long.hover();
  await expect(track(long)).toHaveCSS("animation-name", "mt-hover-marquee-pan");
  assert.equal((await long.boundingBox()).width, outerWidth);
  const distance = await long.evaluate(node => node.firstElementChild.scrollWidth - node.clientWidth);
  assert(distance > 100);
  assert.equal(await positionAt(long, 0.1), 0);
  assert(Math.abs(await positionAt(long, 0.85) + distance) < 1);
  assert.equal(await positionAt(long, 1.1), 0, "continues looping after the tail pause");
  await page.mouse.move(0, 0);
  await expect(track(long)).toHaveCSS("animation-name", "none");
  await page.getByRole("button", { name: "Change label" }).focus();
  await page.keyboard.press("Tab");
  await expect(long).toBeFocused();
  await expect(track(long)).toHaveCSS("animation-name", "mt-hover-marquee-pan");
  await long.hover();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "After" })).toBeFocused();
  await expect(track(long)).toHaveCSS("animation-name", "mt-hover-marquee-pan");
  await page.mouse.move(0, 0);
  await expect(track(long)).toHaveCSS("animation-name", "none");
  await rtl.hover();
  assert(await positionAt(rtl, 0.85) > 20, "RTL pans toward the opposite physical side");

  const resize = page.getByRole("button", { name: "Resize" });
  await resize.click();
  await expect(long).not.toHaveAttribute("data-overflow");
  await resize.click();
  await expect(long).toHaveAttribute("data-overflow", "");
  const change = page.getByRole("button", { name: "Change label" });
  await change.click();
  await expect(long).toHaveText("Fit");
  await expect(long).not.toHaveAttribute("tabindex");
  await change.click();
  await expect(long).toHaveAttribute("tabindex", "0");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await long.focus();
  await expect(track(long)).toHaveCSS("animation-name", "none");
  await expect(long).toHaveCSS("overflow-x", "auto");
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => long.evaluate(node => node.scrollLeft)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "After" }).focus();
  await expect(long).toHaveCSS("overflow-x", "hidden");
  await expect.poll(() => long.evaluate(node => node.scrollLeft)).toBe(0);
  assert((await long.textContent()).endsWith("END"));
  const touch = await browser.newPage({ hasTouch: true, isMobile: true, viewport: { width: 375, height: 600 } });
  await touch.goto("http://127.0.0.1:5417/tests/fixtures/hover-marquee.html");
  const touched = touch.getByTestId("long");
  await expect(track(touched)).toHaveCSS("animation-name", "none");
  await touched.tap();
  await expect(touched).toHaveCSS("overflow-x", "auto");
  await expect(track(touched)).toHaveCSS("animation-name", "none");
  await touch.close();
  console.log("HoverMarquee: LTR/RTL reveal, pause and repeat, focus, reset, resize, text changes and reduced motion passed");
} finally {
  await browser?.close();
  await server.close();
}

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
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:5417/tests/fixtures/hover-marquee.html");
  const long = page.getByTestId("long");
  const short = page.getByTestId("short");
  const rtl = page.getByTestId("rtl");
  const rich = page.getByTestId("rich");
  const track = (box) => box.locator(".mt-hover-marquee-text");
  const positionAt = (box, fraction) =>
    track(box).evaluate((node, fraction) => {
      const animation = node.getAnimations()[0];
      const timing = animation.effect.getTiming();
      animation.pause();
      animation.currentTime = Number(timing.duration) * fraction;
      return new DOMMatrix(getComputedStyle(node).transform).m41;
    }, fraction);
  const assertContinuousLoop = async (box) => {
    const frames = await track(box).evaluate((node) => {
      const original = node.querySelector(".mt-hover-marquee-original") ?? node;
      const copy = node.querySelector(".mt-hover-marquee-copy");
      const animation = node.getAnimations()[0];
      const duration = Number(animation.effect.getTiming().duration);
      const style = getComputedStyle(node);
      const tailStart =
        Number.parseFloat(style.getPropertyValue("--mt-marquee-tail-start")) /
          100 || 0.8;
      const tailEnd =
        Number.parseFloat(style.getPropertyValue("--mt-marquee-tail-end")) /
          100 || 1;
      const gap =
        Number.parseFloat(style.getPropertyValue("--mt-marquee-gap")) || 0;
      const box = node.parentElement.getBoundingClientRect();
      const fromStart = (rect) =>
        rect.left - box.left;
      const fromEnd = (rect) =>
        rect.right - box.right;
      animation.pause();
      const at = (fraction) => {
        animation.currentTime = duration * fraction;
        const source = original.getBoundingClientRect();
        const repeat = copy?.getBoundingClientRect();
        return {
          sourceStart: fromStart(source),
          sourceEnd: fromEnd(source),
          repeatStart: repeat ? fromStart(repeat) : null,
          separation: repeat
            ? repeat.left - source.right
            : null,
        };
      };
      return {
        initial: at(0),
        paused1: at(tailStart + (tailEnd - tailStart) / 4),
        paused2: at(tailStart + ((tailEnd - tailStart) * 3) / 4),
        advancing: at((tailEnd + 1) / 2),
        beforeWrap: at(0.9999),
        afterWrap: at(1.0001),
        gap,
        pauseMs: (tailEnd - tailStart) * duration,
      };
    });
    assert(Math.abs(frames.initial.sourceStart) < 1, "track starts at the physical left even in RTL");
    assert(
      frames.beforeWrap.repeatStart !== null,
      "the original tail must hand off to the next visible repetition before the boundary",
    );
    assert(
      frames.pauseMs >= 500 && frames.pauseMs < 1000,
      "tail pauses briefly",
    );
    assert(
      Math.abs(frames.paused1.sourceEnd) < 1 &&
        Math.abs(frames.paused2.sourceEnd) < 1,
      "the full ending remains aligned and still during the pause",
    );
    assert(
      frames.gap > 0 &&
        frames.gap <= 24 &&
        Math.abs(frames.paused1.separation - frames.gap) < 1,
      "one small whitespace is placed between the original and the next copy",
    );
    assert(
      frames.advancing.repeatStart > 0 &&
        frames.advancing.repeatStart < frames.paused1.repeatStart,
      "the next copy moves into view after the pause rather than snapping back",
    );
    assert(
      frames.beforeWrap.repeatStart !== null &&
        Math.abs(frames.beforeWrap.repeatStart - frames.afterWrap.sourceStart) <
          1,
      "the next copy just before wrapping aligns with the original just after wrapping",
    );
  };
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
  await assertContinuousLoop(long);
  await page.mouse.move(0, 0);
  await expect(track(long)).toHaveCSS("animation-name", "none");
  await expect(track(long)).toHaveCSS("transform", "none");
  await expect(long.locator(".mt-hover-marquee-original")).toHaveCSS(
    "text-overflow",
    "ellipsis",
  );
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
  assert(
    (await positionAt(rtl, 0.4)) < -20,
    "RTL still pans physically left",
  );
  await assertContinuousLoop(rtl);
  await rich.hover();
  const copy = rich.locator(".mt-hover-marquee-copy");
  await expect(copy).toHaveAttribute("aria-hidden", "true");
  await expect(copy).toHaveAttribute("inert", "");
  await expect(copy.locator("strong")).toHaveText("Formatted start");
  await expect(rich.locator('[id="formatted-start"]')).toHaveCount(1);
  await expect(copy.locator("em")).toHaveText("with formatted ending");
  assert.equal(
    (await rich.ariaSnapshot()).match(/Formatted start/g)?.length,
    1,
    "the original remains the single accessible copy of rich inline text",
  );

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
  await expect(long.locator(".mt-hover-marquee-copy")).toBeHidden();
  assert.equal(
    await long.evaluate(
      (node) =>
        node.scrollWidth -
        node.querySelector(".mt-hover-marquee-original").scrollWidth,
    ),
    0,
    "native scrolling never includes the animated repetition",
  );
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => long.evaluate((node) => node.scrollLeft))
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "After" }).focus();
  await expect(long).toHaveCSS("overflow-x", "hidden");
  await expect.poll(() => long.evaluate((node) => node.scrollLeft)).toBe(0);
  assert((await long.textContent()).endsWith("END"));
  const touch = await browser.newPage({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 375, height: 600 },
  });
  await touch.goto("http://127.0.0.1:5417/tests/fixtures/hover-marquee.html");
  const touched = touch.getByTestId("long");
  await expect(track(touched)).toHaveCSS("animation-name", "none");
  await touched.tap();
  await expect(touched).toHaveCSS("overflow-x", "auto");
  await expect(track(touched)).toHaveCSS("animation-name", "none");
  await touch.close();
  console.log(
    "HoverMarquee: LTR/RTL seamless loop across the tail pause and gap, focus/reset, resize, rich copy isolation and manual reveal passed",
  );
} finally {
  await browser?.close();
  await server.close();
}

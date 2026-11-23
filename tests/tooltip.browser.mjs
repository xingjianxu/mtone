import { createServer } from "vite";
import { chromium, expect, firefox, webkit } from "@playwright/test";

const engine = process.env.BROWSER ?? "chromium";
const browserType = { chromium, firefox, webkit }[engine];
if (!browserType) throw new Error(`Unknown Tooltip test browser: ${engine}`);

const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 0 },
  logLevel: "error",
});
await server.listen();
const fixture = `${server.resolvedUrls.local[0]}tests/fixtures/tooltip.html`;

const right = ({ x, width }) => x + width;
const bottom = ({ y, height }) => y + height;
const centerX = ({ x, width }) => x + width / 2;
const centerY = ({ y, height }) => y + height / 2;

function gap(side, anchor, popup) {
  if (side === "top") return anchor.y - bottom(popup);
  if (side === "bottom") return popup.y - bottom(anchor);
  if (side === "left") return anchor.x - right(popup);
  return popup.x - right(anchor);
}

let browser;
try {
  browser = await browserType.launch({
    headless: true,
    executablePath: engine === "chromium" ? process.env.CHROMIUM_PATH : undefined,
  });
  const page = await browser.newPage({ viewport: { width: 980, height: 560 }, reducedMotion: "reduce" });
  const target = page.getByRole("button", { name: "Geometry target", exact: true });
  const portal = page.getByTestId("tooltip-portal");
  const popup = portal.getByRole("tooltip");
  const positioner = portal.locator(".test-tooltip-positioner");
  const arrow = popup.locator(".test-tooltip-arrow");

  for (const side of ["top", "bottom", "left", "right"]) {
    await page.goto(`${fixture}?side=${side}`);
    await expect(popup).toHaveClass(/(?:^| )test-tooltip-popup(?: |$)/);
    await expect(popup).toHaveAttribute("data-side", side);
    await expect(positioner).toHaveCSS("z-index", "1603");
    await expect(popup).toHaveCSS("font-size", "13px");
    await expect(arrow).toBeVisible();
    const anchorBox = await target.boundingBox();
    const popupBox = await popup.boundingBox();
    const arrowBox = await arrow.boundingBox();
    expect(gap(side, anchorBox, popupBox)).toBeGreaterThan(0);
    const horizontalEdge = side === "top" || side === "bottom";
    const popupEdge = side === "top" ? bottom(popupBox) : side === "bottom" ? popupBox.y :
      side === "left" ? right(popupBox) : popupBox.x;
    const arrowEdge = horizontalEdge ? centerY(arrowBox) : centerX(arrowBox);
    expect(Math.abs(arrowEdge - popupEdge)).toBeLessThan(10);
    expect(Math.abs(horizontalEdge ? centerX(arrowBox) - centerX(anchorBox) :
      centerY(arrowBox) - centerY(anchorBox))).toBeLessThan(3);
    if (horizontalEdge) expect(Math.abs(right(popupBox) - right(anchorBox))).toBeLessThan(2);
    else expect(Math.abs(centerY(popupBox) - centerY(anchorBox))).toBeLessThan(2);
  }

  await page.goto(`${fixture}?side=bottom`);
  await expect(popup).toBeVisible();
  const original = await popup.boundingBox();
  await page.getByRole("button", { name: "Grow content" }).click();
  await expect.poll(async () => (await popup.boundingBox()).width).toBeGreaterThan(original.width + 45);
  await expect.poll(async () => Math.abs(right(await popup.boundingBox()) - right(original))).toBeLessThan(2);

  await page.getByRole("button", { name: "Move anchor" }).click();
  await expect.poll(async () => (await popup.boundingBox()).x).toBeGreaterThan(original.x + 35);
  await expect.poll(async () => Math.abs(right(await popup.boundingBox()) - right(await target.boundingBox()))).toBeLessThan(2);

  const priorGap = gap("bottom", await target.boundingBox(), await popup.boundingBox());
  await page.getByRole("button", { name: "Increase offset" }).click();
  await expect.poll(async () => gap("bottom", await target.boundingBox(), await popup.boundingBox())).toBeGreaterThan(priorGap + 10);

  await page.setViewportSize({ width: 260, height: 320 });
  await page.goto(`${fixture}?edge`);
  await expect(popup).toHaveAttribute("data-side", "bottom");
  await expect(popup).toBeVisible();
  await expect.poll(async () => {
    const box = await popup.boundingBox();
    return box.x >= -1 && right(box) <= 261;
  }).toBe(true);
  await page.setViewportSize({ width: 220, height: 320 });
  await expect.poll(async () => {
    const box = await popup.boundingBox();
    return box.x >= -1 && right(box) <= 221;
  }).toBe(true);

  await page.setViewportSize({ width: 980, height: 560 });
  await page.goto(`${fixture}?interactions`);
  const tip = (text) => page.getByRole("tooltip").filter({ hasText: text });
  const button = (name) => page.getByRole("button", { name, exact: true });
  await button("Hover target").hover();
  await expect(tip("Pointer hint")).toBeVisible();
  await button("Outside target").hover();
  await expect(tip("Pointer hint")).toBeHidden();

  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(button("Focus target")).toBeFocused();
  const focusTip = tip("Keyboard hint");
  await expect(focusTip).toBeVisible();
  const descriptionId = await focusTip.getAttribute("id");
  expect(descriptionId).toBeTruthy();
  await expect(button("Focus target")).toHaveAttribute("aria-describedby", descriptionId);
  await page.keyboard.press("Tab");
  await expect(button("Click target")).toBeFocused();
  await expect(focusTip).toBeHidden();

  await page.keyboard.press("Enter");
  await expect(tip("Click hint")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tip("Click hint")).toBeHidden();
  await expect(page.getByTestId("click-copy")).toBeAttached();
  await expect(button("Click target")).toBeFocused();
  await button("Click target").click();
  await expect(tip("Click hint")).toBeVisible();
  await button("Click target").click();
  await expect(tip("Click hint")).toBeHidden();

  await button("Context target").click({ button: "right" });
  await expect(tip("Context hint")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tip("Context hint")).toBeHidden();
  await button("Context target").focus();
  await page.keyboard.press("Shift+F10");
  await expect(tip("Context hint")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tip("Context hint")).toBeHidden();

  await expect(button("Disabled feature")).toBeDisabled();
  const disabledTrigger = page.locator(".mt-tooltip-disabled-trigger");
  await disabledTrigger.hover();
  await expect(tip("Disabled reason")).toBeVisible();
  await button("Suppressed target").hover();
  await expect(tip("Disabled reason")).toBeHidden();
  await expect(tip("Must not render")).toBeHidden();
  await button("Context target").focus();
  await page.keyboard.press("Tab");
  await expect(disabledTrigger).toBeFocused();
  await expect(tip("Disabled reason")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(tip("Disabled reason")).toBeHidden();

  console.log(`Tooltip placements, dynamic geometry, portals, trigger modes and disabled controls passed (${engine})`);
} finally {
  await browser?.close();
  await server.close();
}

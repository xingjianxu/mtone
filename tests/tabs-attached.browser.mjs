import { chromium, expect } from "@playwright/test";
import { createServer } from "vite";

const server = await createServer({ server: { host: "127.0.0.1", port: 0 }, logLevel: "error" });
await server.listen();
async function checkSeam(page, lists, selected, panel, colors, { overflow = false } = {}) {
  const box = await selected.boundingBox();
  const panelBox = await panel.boundingBox();
  const railBox = await lists.locator("..").boundingBox();
  const scrollbar = await lists.evaluate((list) => list.offsetHeight - list.clientHeight);
  // Under classic scrollbars only the native scrollbar track may separate
  // the selected tab's last row from the panel, never an additional rail stripe.
  if (overflow) expect(scrollbar).toBeGreaterThan(0);
  else expect(scrollbar).toBe(0);
  expect(panelBox.y - box.y - box.height).toBeCloseTo(scrollbar);

  const png = (await page.screenshot({ scale: "css" })).toString("base64");
  const rgb = (color) => color.match(/\d+/g).slice(0, 3).map(Number);
  const row = Math.round(box.y + box.height) - 1;
  const selectedX = Math.round(box.x + box.width / 2);
  const railX = Math.round(railBox.x + railBox.width) - 2;
  const coordinates = [
    [selectedX, row],
    [selectedX, Math.round(panelBox.y)],
    [railX, row],
    [railX, row - 1],
    [railX, row + 1],
  ];
  const pixels = await page.evaluate(async ({ png, coordinates }) => {
    const image = await createImageBitmap(await (await fetch("data:image/png;base64," + png)).blob());
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);
    return coordinates.map(([x, y]) => [...context.getImageData(x, y, 1, 1).data].slice(0, 3));
  }, { png, coordinates });
  const { surface, divider, railColor } = colors;
  expect(pixels).toEqual([rgb(surface), rgb(surface), rgb(divider), rgb(railColor), rgb(surface)]);
}

let browser;
try {
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH,
    ignoreDefaultArgs: ["--hide-scrollbars"],
    args: ["--disable-features=OverlayScrollbar,FluentOverlayScrollbar"],
  });
  const page = await browser.newPage({ viewport: { width: 1100, height: 480 } });
  for (const theme of ["light", "dark"]) {
    await page.goto(`${server.resolvedUrls.local[0]}tests/fixtures/tabs-attached.html?theme=${theme}`);
    const lists = page.getByRole("tablist", { name: "Repository" });
    const code = lists.getByRole("tab", { name: "Code", exact: true });
    const issues = lists.getByRole("tab", { name: "Issues", exact: true });
    const disabled = lists.getByRole("tab", { name: "Disabled", exact: true });
    const panel = page.getByRole("tabpanel");
    const themeColor = (key) => colorFor(`var(${key})`);
    const colorFor = (value) => lists.evaluate((list, value) => {
      const swatch = document.createElement("span");
      swatch.style.color = value;
      list.append(swatch);
      const color = getComputedStyle(swatch).color;
      swatch.remove();
      return color;
    }, value);
    const surface = await themeColor("--mt-bg");
    const rail = lists.locator("..");
    const railColor = await themeColor("--mt-subtle");
    const divider = await themeColor("--mt-border");
    const muted = await colorFor("color-mix(in srgb, var(--mt-muted) 84%, var(--mt-fg))");
    await expect(rail).toHaveCSS("background-color", railColor);
    await expect(code).toHaveCSS("height", "34px");
    await expect(code).toHaveCSS("background-color", surface);
    await expect(panel).toHaveCSS("background-color", surface);
    await expect(code).toHaveCSS("border-top-color", divider);
    await expect(code).toHaveCSS("border-inline-start-color", divider);
    await expect(code).toHaveCSS("border-inline-end-color", divider);
    await expect(code).toHaveCSS("border-bottom-width", "0px");
    await expect(code).not.toHaveCSS("border-top-left-radius", "0px");
    await expect(issues).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(issues).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
    await expect(issues).toHaveCSS("color", muted);
    await expect(issues.locator("svg")).toHaveCSS("stroke", muted);
    await expect(disabled).toBeDisabled();

    const box = await code.boundingBox();
    const icon = await code.locator("svg").boundingBox();
    const label = await code.locator(".mt-tab-label").boundingBox();
    expect(Math.abs(icon.y + icon.height / 2 - (label.y + label.height / 2))).toBeLessThan(0.55);
    expect(box.width).toBeLessThan((await lists.boundingBox()).width / 4);

    const colors = { surface, divider, railColor };
    await checkSeam(page, lists, code, panel, colors);

    const params = new URL(page.url());
    params.searchParams.set("tall", "");
    await page.goto(params.href);
    await expect(page.getByRole("button", { name: "Extra start" })).toHaveCSS("height", "61px");
    await expect(page.getByRole("button", { name: "Extra end" })).toHaveCSS("height", "47px");
    await checkSeam(page, lists, code, panel, colors);
    const tallBox = await code.boundingBox();

    await code.hover();
    await expect(code).toHaveCSS("background-color", surface);
    await issues.hover();
    await expect(issues).toHaveCSS("background-color", await themeColor("--mt-hover"));
    await code.focus();
    await page.keyboard.press("ArrowRight");
    await expect(issues).toBeFocused();
    await expect(issues).toHaveCSS("outline-style", "solid");
    await expect(issues).toHaveAttribute("aria-selected", "false");
    const issuesBefore = await issues.boundingBox();
    await page.keyboard.press("Enter");
    await expect(panel).toHaveText("Issue contents");
    expect(await issues.boundingBox()).toEqual(issuesBefore);
    expect(await code.boundingBox()).toEqual(tallBox);

    await page.setViewportSize({ width: 320, height: 480 });
    await expect(page.getByRole("button", { name: "All views" })).toBeVisible();
    await page.getByRole("button", { name: "All views" }).click();
    await page.getByRole("menuitem", { name: "Insights" }).click();
    const selected = lists.getByRole("tab", { name: "Insights" });
    await expect(selected).toBeFocused();
    await expect(selected).toHaveAttribute("aria-selected", "true");
    const visible = await selected.boundingBox();
    const port = await lists.boundingBox();
    expect(visible.x).toBeGreaterThanOrEqual(port.x - 1);
    expect(visible.x + visible.width).toBeLessThanOrEqual(port.x + port.width + 1);
    expect(await lists.evaluate((el) => el.scrollHeight - el.clientHeight)).toBe(0);
    await checkSeam(page, lists, selected, panel, colors, { overflow: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    await page.setViewportSize({ width: 1100, height: 480 });
    await page.mouse.move(0, 0);
  }

  await page.emulateMedia({ forcedColors: "active" });
  await page.goto(`${server.resolvedUrls.local[0]}tests/fixtures/tabs-attached.html`);
  const selected = page.getByRole("tab", { name: "Code", exact: true });
  const inactive = page.getByRole("tab", { name: "Issues", exact: true });
  const selectedStyle = await selected.evaluate((el) => {
    const css = getComputedStyle(el);
    return [css.backgroundColor, css.borderTopColor, css.color];
  });
  expect(selectedStyle[1]).not.toBe(selectedStyle[0]);
  await expect(inactive).toHaveCSS("border-top-width", "0px");
  const forcedInactiveBox = await inactive.boundingBox();
  await selected.focus();
  await page.keyboard.press("ArrowRight");
  await expect(inactive).toBeFocused();
  await expect(inactive).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  await expect(inactive).toHaveAttribute("aria-selected", "true");
  expect(await inactive.boundingBox()).toEqual(forcedInactiveBox);
  console.log("Attached Tabs geometry, seam, theme and interaction checks passed");
} finally {
  await browser?.close();
  await server.close();
}

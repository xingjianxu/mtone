import assert from "node:assert/strict";
import { chromium, firefox, webkit } from "@playwright/test";
import { createServer } from "vite";

const engine = process.env.BROWSER ?? "chromium";
const browserType = { chromium, firefox, webkit }[engine];
assert(browserType, "a recognized Playwright engine is required");
const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 0 },
  logLevel: "error",
});
await server.listen();
let browser;
try {
  browser = await browserType.launch({
    headless: true,
    executablePath:
      engine === "chromium" ? process.env.CHROMIUM_PATH : undefined,
  });
  const page = await browser.newPage();
  await page.goto(
    server.resolvedUrls.local[0] + "tests/fixtures/button-icon-only.html",
  );
  const geometry = (name) =>
    page.getByRole("button", { name, exact: true }).evaluate((button) => {
      const bounds = button.getBoundingClientRect();
      const style = getComputedStyle(button);
      return {
        width: bounds.width,
        height: bounds.height,
        blockStart: style.paddingBlockStart,
        blockEnd: style.paddingBlockEnd,
        line: style.lineHeight,
        start: style.paddingInlineStart,
        end: style.paddingInlineEnd,
      };
    });
  for (const [name, size] of [
    ["Small icon", 28],
    ["Medium icon", 32],
    ["Large icon", 36],
    ["Themed icon", 40],
    ["Close", 32],
    ["移除筛选", 28],
  ]) {
    assert.deepEqual(
      await geometry(name),
      { width: size, height: size, start: "0px", end: "0px", blockStart: "0px", blockEnd: "0px", line: "20px" },
      name,
    );
  }
  for (const [name, height, start, end, block] of [
    ["Text with start", 28, "4px", "6px", "3px"],
    ["Normal text", 32, "9px", "9px", "5px"],
    ["Text with end", 36, "14px", "12px", "7px"],
  ]) {
    const bounds = await geometry(name);
    assert(bounds.width > height, name);
    assert.deepEqual(
      { height: bounds.height, start: bounds.start, end: bounds.end, blockStart: bounds.blockStart, blockEnd: bounds.blockEnd, line: bounds.line },
      { height, start, end, blockStart: block, blockEnd: block, line: "20px" },
      name,
    );
  }
  console.log(
    `${engine}: named icon-only squares, Alert close and FilterChip remove; ordinary RTL section geometry preserved`,
  );
} finally {
  await browser?.close();
  await server.close();
}

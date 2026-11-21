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
        start: style.paddingInlineStart,
        end: style.paddingInlineEnd,
      };
    });
  for (const [name, size] of [
    ["Small icon", 24],
    ["Medium icon", 34],
    ["Large icon", 36],
    ["Themed icon", 40],
  ]) {
    assert.deepEqual(
      await geometry(name),
      { width: size, height: size, start: "0px", end: "0px" },
      name,
    );
  }
  assert.deepEqual(await geometry("Legacy small"), {
    width: 34,
    height: 24,
    start: "6px",
    end: "6px",
  });
  assert.deepEqual(await geometry("Legacy large"), {
    width: 34,
    height: 36,
    start: "14px",
    end: "14px",
  });
  for (const [name, height, start, end] of [
    ["Text with start", 24, "4px", "6px"],
    ["Text with end", 36, "14px", "12px"],
  ]) {
    const bounds = await geometry(name);
    assert(bounds.width > height, name);
    assert.deepEqual(
      { height: bounds.height, start: bounds.start, end: bounds.end },
      { height, start, end },
      name,
    );
  }
  console.log(
    `${engine}: named icon-only squares and legacy dimensions; ordinary RTL section geometry preserved`,
  );
} finally {
  await browser?.close();
  await server.close();
}

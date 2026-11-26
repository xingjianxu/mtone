import { chromium, expect } from "@playwright/test";
import { createServer } from "vite";

const server = await createServer({
  server: { host: "127.0.0.1", port: 5209, strictPort: true }, logLevel: "error",
});
await server.listen();
let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const page = await browser.newPage({ viewport: { width: 1000, height: 650 } });
  const url = "http://127.0.0.1:5209/tests/fixtures/layout-persistence.html";
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url);
  const left = page.getByTestId("left");
  const splitter = page.getByRole("separator");
  const width = async (locator) => Math.round((await locator.boundingBox()).width);
  const resize = async (separator, delta) => {
    const { x, y, width, height } = await separator.boundingBox();
    await page.mouse.move(x + width / 2, y + height / 2);
    await page.mouse.down();
    await page.mouse.move(x + width / 2 + delta, y + height / 2, { steps: 5 });
    await page.mouse.up();
  };
  await expect.poll(() => width(left)).toBe(160);
  await resize(splitter, 60);
  await expect.poll(() => width(left)).toBe(220);
  await page.reload();
  await expect.poll(() => width(left)).toBe(220);
  await page.goto(url + "?narrow");
  await expect.poll(() => width(left)).toBe(220);
  await splitter.press("Enter");
  await expect.poll(() => width(left)).toBe(0);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("mtone:layout:v1:splitter:test-split")).panels[0].collapsed)).toBe(true);
  await page.reload();
  await expect.poll(() => width(left)).toBe(0);
  await splitter.press("Enter");
  await expect.poll(() => width(left)).toBe(160);
  await page.goto(url + "?controlled");
  await expect.poll(() => width(left)).toBe(179);
  await page.goto(url + "?changed");
  await expect.poll(() => width(left)).toBe(160);

  await page.goto(url + "?mode=sidebar");
  const sidebar = page.locator("[data-sidebar-resize-pane='sidebar']");
  await expect.poll(() => width(sidebar)).toBe(240);
  await resize(page.getByRole("separator"), 66);
  await expect.poll(() => width(sidebar)).toBe(306);
  await page.getByRole("button", { name: "收起侧边栏" }).click();
  await expect(page.locator(".mt-sidebar-resize")).toHaveAttribute("data-sidebar-collapsed", "true");
  await page.reload();
  await expect(page.locator(".mt-sidebar-resize")).toHaveAttribute("data-sidebar-collapsed", "true");
  await page.getByRole("button", { name: "展开侧边栏" }).click();
  await expect.poll(() => width(sidebar)).toBe(306);
  expect(errors).toEqual([]);
  console.log("Browser layout persistence checks passed");
} finally {
  await browser?.close();
  await server.close();
}

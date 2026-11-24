import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { createServer } from "vite";

const server = await createServer({ server: { host: "127.0.0.1", port: 5422, strictPort: true }, logLevel: "error" });
await server.listen();
let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 720, height: 620 }, colorScheme: "light" });
  await page.goto("http://127.0.0.1:5422/tests/fixtures/setting-row.html");
  const group = page.getByRole("group", { name: "编辑器设置" });
  const readOnly = group.getByRole("switch", { name: "只读模式" });
  await expect(readOnly).toHaveAccessibleDescription("打开后锁定编辑器，仍可搜索内容。");
  await readOnly.press("Space");
  await expect(readOnly).toBeChecked();
  const number = group.getByRole("textbox", { name: "光标上下文行数" });
  await number.press("ArrowUp");
  await expect(number).toHaveValue("4");
  await expect(number).toHaveAccessibleDescription("光标与编辑器边缘之间至少保留的行数。");
  const select = group.getByRole("combobox", { name: "Tab 空格数" });
  await select.click();
  await page.getByRole("option", { name: "8 个空格" }).click();
  await expect(select).toContainText("8 个空格");
  const appearance = () => group.evaluate(element => {
    const rows = [...element.children];
    const outer = element.getBoundingClientRect();
    return {
      surface: getComputedStyle(element).backgroundColor,
      rowSurfaces: rows.map(row => getComputedStyle(row).backgroundColor),
      seams: rows.map(row => getComputedStyle(row).borderBlockStartWidth),
      compact: rows.every(row => {
        const label = row.querySelector(".mt-setting-row-copy").getBoundingClientRect();
        const control = row.querySelector(".mt-setting-row-control").getBoundingClientRect();
        return Math.abs((label.top + label.bottom) - (control.top + control.bottom)) < 1;
      }),
      fits: element.scrollWidth <= Math.ceil(outer.width) && rows.every(row => row.scrollWidth <= row.clientWidth + 1),
    };
  });
  const light = await appearance();
  assert.deepEqual(light.rowSurfaces, Array(4).fill("rgba(0, 0, 0, 0)"));
  assert.deepEqual(light.seams, ["0px", "1px", "1px", "1px"]);
  assert(light.compact && light.fits, "Wide controls align to the text block center");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(async () => (await appearance()).surface).not.toBe(light.surface);
  await page.setViewportSize({ width: 248, height: 650 });
  const narrow = await appearance();
  assert(!narrow.compact && narrow.fits, "Narrow controls wrap without overflowing");
  await expect(readOnly).toBeChecked();
  await expect(select).toContainText("8 个空格");
  console.log("SettingRow: accessible independent controls, shared themed group, dividers and narrow layouts passed");
} finally {
  await browser?.close();
  await server.close();
}

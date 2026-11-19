import { resolve } from "node:path";
import { chromium, expect, firefox, webkit } from "@playwright/test";

const browserName = process.env.BROWSER ?? "chromium";
const browser = await { chromium, firefox, webkit }[browserName].launch({
  headless: true,
  ...(browserName === "chromium" && process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {}),
});
try {
  const page = await browser.newPage({ colorScheme: "light" });
  await page.setContent(`
    <div class="mt-scope" id="default"><input class="mt-input"></div>
    <div class="mt-scope" id="dark" data-mt-theme="dark">
      <input class="mt-input">
      <button class="mt-btn mt-btn-solid">Solid</button>
      <button class="mt-checkbox" data-checked>✓</button>
      <div class="mt-popup">Overlay</div>
      <div class="mt-list-group">Group</div>
      <div class="mt-badge mt-tone-red">Alert</div>
      <div class="mt-scope" data-mt-theme="light" id="nested"><input class="mt-input"></div>
    </div>
    <div class="mt-scope" data-mt-theme="system" id="system"><input class="mt-input"></div>
    <div class="mt-popup" id="global">Browser-level overlay</div>
  `);
  await page.addStyleTag({ path: resolve(process.env.THEME_CSS_PATH ?? "packages/mtone/dist/styles.css") });
  const light = "rgb(255, 255, 255)";
  const dark = "rgb(32, 32, 31)";
  const lightText = "rgb(55, 53, 47)";
  const darkText = "rgb(238, 236, 232)";
  for (const selector of ["#default input", "#nested input", "#system input", "#global"]) {
    await expect(page.locator(selector)).toHaveCSS("background-color", light);
    await expect(page.locator(selector)).toHaveCSS("color", lightText);
  }
  for (const selector of ["#dark > input", "#dark .mt-popup", "#dark .mt-list-group"]) {
    await expect(page.locator(selector)).toHaveCSS("background-color", dark);
  }
  for (const selector of ["#dark > input", "#dark .mt-popup"]) {
    await expect(page.locator(selector)).toHaveCSS("color", darkText);
  }
  await expect(page.locator("#dark .mt-btn-solid")).toHaveCSS("background-color", darkText);
  await expect(page.locator("#dark .mt-btn-solid")).toHaveCSS("color", dark);
  await expect(page.locator("#dark .mt-checkbox")).toHaveCSS("color", dark);
  await expect(page.locator("#dark .mt-tone-red")).toHaveCSS("background-color", "rgb(73, 47, 45)");
  await expect(page.locator("#dark .mt-tone-red")).toHaveCSS("color", "rgb(255, 170, 164)");

  await expect(page.locator("#dark .mt-badge")).toHaveCSS("background-color", "rgb(73, 47, 45)");
  await expect(page.locator("#dark .mt-badge")).toHaveCSS("color", "rgb(255, 170, 164)");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("#system input")).toHaveCSS("background-color", dark);
  await expect(page.locator("#default input")).toHaveCSS("background-color", light);
  await expect(page.locator("#nested input")).toHaveCSS("background-color", light);
  await page.locator("html").evaluate((root) => root.setAttribute("data-mt-theme", "system"));
  await expect(page.locator("#global")).toHaveCSS("background-color", dark);
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("#system input")).toHaveCSS("background-color", light);
  await expect(page.locator("#global")).toHaveCSS("background-color", light);
  await expect(page.locator("#dark > input")).toHaveCSS("background-color", dark);
  await page.locator("#dark > input").focus();
  await expect(page.locator("#dark > input")).toHaveCSS("border-color", "rgb(134, 181, 237)");
} finally {
  await browser.close();
}

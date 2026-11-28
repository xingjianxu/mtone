import { expect, chromium, firefox, webkit } from "@playwright/test";
import { resolve } from "node:path";

const name = process.env.BROWSER ?? "chromium";
const browser = await { chromium, firefox, webkit }[name].launch({
  headless: true,
  ...(name === "chromium" && process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
});
try {
  const page = await browser.newPage({ colorScheme: "light" });
  const sample = `
    <button class="mt-nav-item mt-active">Current navigation</button>
    <div class="mt-tree-item" aria-selected="true">Selected node</div>
    <div class="mt-option" aria-selected="true">Selected option</div>
    <button class="mt-switch" data-checked><span class="mt-switch-thumb"></span></button>
    <button class="mt-checkbox" data-checked>✓</button>
    <button class="mt-btn mt-btn-outline" data-toggle-mode="background" aria-pressed="true">Toggle</button>
    <button class="mt-btn mt-btn-ghost" data-toggle-mode="icon" aria-pressed="true"><span class="mt-btn-section-start">★</span></button>`;
  await page.setContent(`
    <div id="standalone">${sample}</div>
    <div class="mt-scope" data-mt-theme="system" id="system">${sample}</div>
    <div class="mt-scope" data-mt-theme="light" data-mt-theme-preset="azure" id="explicit">
      ${sample}
      <div class="mt-scope" data-mt-theme="light" data-mt-theme-preset="original" id="original">${sample}</div>
      <div class="mt-scope" data-mt-theme="dark" data-mt-theme-preset="reading" style="--mt-nav-selected: #2d3b2b" id="custom">${sample}</div>
    </div>`);
  await page.addStyleTag({ path: resolve(process.env.THEME_CSS_PATH ?? "packages/mtone/dist/styles.css") });
  const light = { surface: "rgb(233, 242, 255)", text: "rgb(37, 97, 173)", toggle: "rgb(37, 97, 173)", ink: "rgb(255, 255, 255)" };
  const dark = { surface: "rgb(36, 56, 79)", text: "rgb(188, 217, 255)", toggle: "rgb(77, 135, 204)", ink: "rgb(10, 23, 38)" };
  const expectAzure = async (scope, spec) => {
    for (const klass of [".mt-nav-item", ".mt-tree-item", ".mt-option"]) {
      await expect(page.locator(`#${scope} > ${klass}`)).toHaveCSS("background-color", spec.surface);
      await expect(page.locator(`#${scope} > ${klass}`)).toHaveCSS("color", spec.text);
    }
    for (const klass of [".mt-switch", ".mt-checkbox", ".mt-btn-outline"]) {
      await expect(page.locator(`#${scope} > ${klass}`)).toHaveCSS("background-color", spec.toggle);
    }
    await expect(page.locator(`#${scope} .mt-switch-thumb`).first()).toHaveCSS("background-color", spec.ink);
    await expect(page.locator(`#${scope} .mt-btn-ghost .mt-btn-section-start`).first()).toHaveCSS("color", spec.text);
  };
  for (const scope of ["standalone", "system", "explicit"]) await expectAzure(scope, light);
  await expect(page.locator("#original > .mt-nav-item")).toHaveCSS("background-color", "rgb(229, 229, 229)");
  await expect(page.locator("#original > .mt-tree-item")).toHaveCSS("color", "rgb(55, 53, 47)");
  await expect(page.locator("#original > .mt-switch")).toHaveCSS("background-color", "rgb(55, 53, 47)");
  await expect(page.locator("#custom > .mt-nav-item")).toHaveCSS("background-color", "rgb(45, 59, 43)");
  await expect(page.locator("#custom > .mt-switch")).toHaveCSS("background-color", "rgb(238, 236, 232)");
  await page.emulateMedia({ colorScheme: "dark" });
  await expectAzure("system", dark);
  await expectAzure("explicit", light);
  await page.emulateMedia({ colorScheme: "light" });
  await expectAzure("system", light);
} finally {
  await browser.close();
}

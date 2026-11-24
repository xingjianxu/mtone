import { resolve } from "node:path";
import { chromium, expect, firefox, webkit } from "@playwright/test";

import { measureSemanticColors, semanticColorCases, semanticColorMarkup } from "./fixtures/theme-palette.mjs";

const selectionSurfaces = `
  <div class="mt-tree-item" aria-selected="true" data-selection="tree">Tree</div>
  <div class="mt-table-wrap"><div class="mt-table"><table><tbody>
    <tr data-selected><td class="mt-table-cell" data-selection="table">Table</td></tr>
  </tbody></table></div></div>
  <div class="mt-check-card" data-selection="card"><input class="mt-check-card-control" type="checkbox" checked>Card</div>
  <div class="mt-settings-dialog-detail"><div data-mt-settings-highlight data-selection="settings">Setting</div></div>
  <div class="mt-ide-panel" data-side-rail><div class="mt-tab-bar"><div class="mt-tab-list">
    <div class="mt-tab-item"><button class="mt-tab" aria-selected="true" data-selection="panel">Panel</button></div>
  </div></div></div>
`;

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
    <div class="mt-scope" id="default"><input class="mt-input">${selectionSurfaces}</div>
    <div class="mt-scope" id="dark" data-mt-theme="dark">
      <input class="mt-input">
      <button class="mt-btn mt-btn-solid">Solid</button>
      <button class="mt-checkbox" data-checked>✓</button>
      <div class="mt-popup">Overlay</div>
      <div class="mt-list-group">Group</div>
      <div class="mt-tag mt-tone-red">Alert</div>
      ${selectionSurfaces}
      <div class="mt-scope" data-mt-theme="light" id="nested"><input class="mt-input"></div>
    </div>
    <div class="mt-scope" data-mt-theme="system" id="system"><input class="mt-input">${selectionSurfaces}</div>
    <div class="mt-scope" style="--mt-selected: #143556" id="selection-override">${selectionSurfaces}</div>
    <div class="mt-scope" style="--mt-select-surface: initial" id="selection-fallback">${selectionSurfaces}</div>
    <div class="mt-popup" id="global">Browser-level overlay</div>
    ${semanticColorMarkup}
  `);
  await page.addStyleTag({ path: resolve(process.env.THEME_CSS_PATH ?? "packages/mtone/dist/styles.css") });
  const expectSemanticColors = async (dark) => {
    const paints = await page.evaluate(measureSemanticColors, semanticColorCases(dark));
    for (const { selector, role, actual, expected } of paints) {
      expect(actual, `${role}: ${selector}`).toBe(expected);
    }
  };
  await expectSemanticColors(false);
  const expectCoral = async (selector, color) => {
    const swatch = await page.locator(selector).evaluate((root) => {
      const el = document.createElement("span");
      el.style.backgroundColor = "var(--mt-accent-coral)";
      root.append(el);
      const painted = getComputedStyle(el).backgroundColor;
      el.remove();
      return painted;
    });
    expect(swatch).toBe(color);
  };
  const selectedLight = "rgb(233, 238, 244)";
  const selectedDark = "rgb(41, 55, 70)";
  const expectSelection = async (scope, colorFor) => {
    for (const sink of ["tree", "table", "card", "settings", "panel"]) {
      await expect(page.locator(`${scope} [data-selection="${sink}"]`)).toHaveCSS(
        "background-color", typeof colorFor === "function" ? colorFor(sink) : colorFor,
      );
    }
  };
  await expectSelection("#default", selectedLight);
  await expectSelection("#dark", selectedDark);
  await expectSelection("#system", selectedLight);
  await expectSelection("#selection-fallback", selectedLight);
  await expectSelection("#selection-override", (sink) =>
    ["tree", "table", "panel"].includes(sink) ? "rgb(20, 53, 86)" : selectedLight);

  const coralLight = "rgb(209, 99, 75)";
  const coralDark = "rgb(253, 140, 115)";
  for (const selector of ["#default", "#nested", "#system"]) {
    await expectCoral(selector, coralLight);
  }
  await expectCoral("#dark", coralDark);
  const light = "rgb(255, 255, 255)";
  const dark = "rgb(32, 32, 31)";
  const lightText = "rgb(55, 53, 47)";
  const darkText = "rgb(238, 236, 232)";
  for (const selector of ["#default > input.mt-input", "#nested input", "#system > input.mt-input", "#global"]) {
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

  await expect(page.locator("#dark .mt-tag")).toHaveCSS("background-color", "rgb(73, 47, 45)");
  await expect(page.locator("#dark .mt-tag")).toHaveCSS("color", "rgb(255, 170, 164)");
  await page.emulateMedia({ colorScheme: "dark" });
  await expectSemanticColors(true);
  await expectSelection("#system", selectedDark);
  await expectCoral("#system", coralDark);
  await expectCoral("#nested", coralLight);
  await expect(page.locator("#system > input.mt-input")).toHaveCSS("background-color", dark);
  await expect(page.locator("#default > input.mt-input")).toHaveCSS("background-color", light);
  await expect(page.locator("#nested input")).toHaveCSS("background-color", light);
  await page.locator("html").evaluate((root) => root.setAttribute("data-mt-theme", "system"));
  await expect(page.locator("#global")).toHaveCSS("background-color", dark);
  await page.emulateMedia({ colorScheme: "light" });
  await expectSelection("#system", selectedLight);
  await expectCoral("#system", coralLight);
  await expect(page.locator("#system > input.mt-input")).toHaveCSS("background-color", light);
  await expect(page.locator("#global")).toHaveCSS("background-color", light);
  await expect(page.locator("#dark > input")).toHaveCSS("background-color", dark);
  await page.locator("#dark > input").focus();
  await expect(page.locator("#dark > input")).toHaveCSS("border-color", "rgb(134, 181, 237)");
} finally {
  await browser.close();
}

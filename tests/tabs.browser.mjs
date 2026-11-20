import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 5212, strictPort: true },
  logLevel: "error",
});
await server.listen();
await mkdir("artifacts/tabs-browser", { recursive: true });
let failed = false;
try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
    ["webkit", webkit],
  ]) {
    let browser, page;
    try {
      browser = await engine.launch({ headless: true });
      page = await browser.newPage({ viewport: { width: 900, height: 800 } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("http://127.0.0.1:5212/tests/fixtures/tabs.html");
      const list = page.getByRole("tablist", { name: "Documents" });
      await expect(list.getByRole("tab")).toHaveCount(15);
      await page.getByLabel("Draft 0", { exact: true }).fill("persist");
      await list.getByRole("tab", { name: "Document 1", exact: true }).click();
      await list.getByRole("tab", { name: "Document 0", exact: true }).click();
      await expect(page.getByLabel("Draft 0", { exact: true })).toHaveValue(
        "persist",
      );
      await page.getByRole("button", { name: "More tabs" }).click();
      await page
        .getByRole("menuitem", { name: "Document 14", exact: true })
        .click();
      await expect(
        list.getByRole("tab", { name: "Document 14", exact: true }),
      ).toHaveAttribute("aria-selected", "true");
      await expect(
        list.getByRole("tab", { name: "Document 14", exact: true }),
      ).toBeFocused();
      await page
        .getByRole("button", { name: "Close Document 14", exact: true })
        .click();
      await expect(list.getByRole("tab")).toHaveCount(14);
      await expect(
        list.getByRole("tab", { name: "Document 0", exact: true }),
      ).toHaveAttribute("aria-selected", "true");
      await list.getByRole("tab", { name: "Document 0", exact: true }).focus();
      await page.keyboard.press("Alt+Shift+ArrowRight");
      await expect(list.getByRole("tab").first()).toHaveText("Document 1");
      await page.getByRole("button", { name: "Add tab" }).click();
      await expect(list.getByRole("tab", { name: "New document" })).toHaveCount(
        1,
      );
      await page.getByRole("tab", { name: "Card B", exact: true }).click();
      await expect(page.getByText("B contents", { exact: true })).toBeVisible();
      for (const width of [375, 320]) {
        await page.setViewportSize({ width, height: 800 });
        for (const placement of ["top", "bottom", "start", "end"]) {
          await page
            .getByLabel("Placement", { exact: true })
            .selectOption(placement);
          await expect
            .poll(() =>
              page.evaluate(
                () => document.documentElement.scrollWidth <= window.innerWidth,
              ),
            )
            .toBe(true);
          // Horizontal is the implicit ARIA tablist default; Base UI omits it.
          await expect.poll(() => list.getAttribute("aria-orientation").then(
            orientation => orientation ?? "horizontal",
          )).toBe(["start", "end"].includes(placement) ? "vertical" : "horizontal");
          await page.screenshot({
            path: `artifacts/tabs-browser/${name}-${width}-${placement}.png`,
            fullPage: true,
          });
        }
      }
      const nested = page.getByRole("tab", { name: "Inner", exact: true });
      await expect(nested).toHaveCSS("padding-top", "9px");
      await expect(nested).toHaveCSS("border-inline-end-width", "0px");
      await page.getByRole("tab", { name: "First RTL", exact: true }).focus();
      await page.keyboard.press("ArrowLeft");
      await expect(
        page.getByRole("tab", { name: "Second RTL", exact: true }),
      ).toBeFocused();
      await page.goto("http://127.0.0.1:5212/tests/fixtures/tabs-compact.html");
      for (const variant of ["card", "editable-card"]) {
        for (const [size, height, font] of [["small", 24, 12], ["medium", 28, 14], ["large", 32, 15]]) {
          for (const placement of ["top", "bottom", "start", "end"]) {
            const region = page.getByTestId(`${variant}-${size}-${placement}`);
            const frames = region.locator(".mt-tab-item");
            for (const frame of await frames.all()) {
              await expect(frame).toHaveCSS("height", `${height}px`);
              await expect(frame).toHaveCSS("border-bottom-left-radius", "0px");
              await expect(frame).toHaveCSS("border-bottom-right-radius", "0px");
            }
            const tab = region.getByRole("tab", {name:"Icon tab", exact:true});
            await expect(tab).toHaveCSS("font-size", `${font}px`);
            await expect(tab).toHaveCSS("gap", "6px");
            await expect(tab).toHaveCSS("border-bottom-left-radius", "0px");
            await expect(tab.locator("svg")).toHaveCSS("height", "14px");
            await tab.hover();
            await expect(tab).toHaveCSS("border-bottom-right-radius", "0px");
            await expect(region.getByRole("tab", {name:"Disabled", exact:true})).toBeDisabled();
          }
        }
      }
      await expect(page.getByRole("tablist", {name:"Nested medium card", exact:true}).locator(".mt-tab-item")).toHaveCSS("height", "28px");
      await expect(page.getByRole("tab", {name:"Line tab", exact:true})).toHaveCSS("padding-top", "9px");
      await expect(page.getByLabel("Unchanged input", {exact:true})).toHaveCSS("height", "34px");
      await page.getByTestId("editable-card-medium-top").screenshot({path:`artifacts/tabs-browser/${name}-compact-card.png`});
      if (errors.length) throw Error(errors.join("\n"));
      console.log(`${name}: Tabs passed`);
    } catch (e) {
      failed = true;
      console.error(name, e);
      await page
        ?.screenshot({
          path: `artifacts/tabs-browser/${name}-failure.png`,
          fullPage: true,
        })
        .catch(() => {});
    } finally {
      await browser?.close();
    }
  }
} finally {
  await server.close();
}
if (failed) process.exitCode = 1;

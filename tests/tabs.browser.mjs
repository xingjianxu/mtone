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
      await expect(nested).toHaveCSS("padding-top", "0px");
      await expect(nested).toHaveCSS("border-inline-end-width", "0px");
      await page.getByRole("tab", { name: "First RTL", exact: true }).focus();
      await page.keyboard.press("ArrowLeft");
      await expect(
        page.getByRole("tab", { name: "Second RTL", exact: true }),
      ).toBeFocused();
      await page.goto("http://127.0.0.1:5212/tests/fixtures/tabs-compact.html");
      for (const variant of ["line", "card", "editable-card"]) {
        for (const [size, font] of [["small", 12], ["medium", 14], ["large", 15]]) {
          for (const placement of ["top", "bottom", "start", "end"]) {
            const region = page.getByTestId(`${variant}-${size}-${placement}`);
            const frames = region.locator(".mt-tab-item");
            await expect(region.getByRole("tablist")).toHaveCSS("gap", variant === "line" ? "6px" : "4px");
            const vertical = ["start", "end"].includes(placement);
            const spacing = await frames.evaluateAll(([a, b], isVertical) => {
              const first = a.getBoundingClientRect();
              const second = b.getBoundingClientRect();
              return isVertical ? second.top - first.bottom : second.left - first.right;
            }, vertical);
            expect(spacing).toBeCloseTo(variant === "line" ? 6 : 4);

            for (const frame of await frames.all()) {
              await expect(frame).toHaveCSS("height", "34px");
              await expect(frame).toHaveCSS("border-bottom-left-radius", "0px");
              await expect(frame).toHaveCSS("border-bottom-right-radius", "0px");
            }
            const tab = region.getByRole("tab", {name:"Icon tab", exact:true});
            await expect(tab).toHaveCSS("font-size", `${font}px`);
            const label = tab.locator(".mt-tab-label");
            const margin = variant === "card" ? "0px" : variant === "line" ? "6px" : "3px";
            const padding = variant === "editable-card" ? "7px" : variant === "card" || ["start", "end"].includes(placement) ? "10px" : size === "large" ? "4px" : "2px";
            await expect(label).toHaveCSS("margin-inline-start", margin);
            await expect(label).toHaveCSS("margin-inline-end", margin);
            await expect(tab).toHaveCSS("padding-inline-start", padding);
            await expect(tab).toHaveCSS("padding-inline-end", padding);
            for (const frame of await frames.all()) {
              await expect(frame).toHaveCSS("margin-inline-start", "0px");
              await expect(frame).toHaveCSS("margin-inline-end", "0px");
            }
            await expect(tab).toHaveCSS("gap", "6px");
            await expect(tab).toHaveCSS("border-bottom-left-radius", "0px");
            await expect(tab.locator("svg")).toHaveCSS("height", "14px");
            await tab.hover();
            await expect(tab).toHaveCSS("border-bottom-right-radius", "0px");
            await expect(region.getByRole("tab", {name:"Disabled", exact:true})).toBeDisabled();
          }
        }
      }
      await expect(page.getByRole("tablist", {name:"Nested medium card", exact:true}).locator(".mt-tab-item")).toHaveCSS("height", "34px");
      const lineTab = page.getByRole("tab", {name:"Line tab", exact:true});
      const lineLabel = lineTab.locator("span.mt-tab-label");
      await expect(lineLabel).toHaveCSS("margin-inline-start", "6px");
      await expect(lineLabel).toHaveCSS("margin-inline-end", "6px");
      await expect(lineTab).toHaveCSS("padding-top", "0px");
      await expect(lineTab).toHaveCSS("padding-inline-start", "2px");
      await expect(lineTab).toHaveCSS("padding-inline-end", "2px");
      const lineList = page.getByRole("tablist", {name:"Unchanged line", exact:true});
      await expect(lineList).toHaveCSS("gap", "6px");
      await expect(lineList.locator(".mt-tab-item")).toHaveCSS("margin-inline-start", "0px");
      await expect(lineList.locator(".mt-tab-item")).toHaveCSS("margin-inline-end", "0px");
      for (const placement of ["top", "start"]) {
        const customList = page.getByRole("tablist", {name:`Custom gap ${placement}`, exact:true});
        await expect(customList).toHaveCSS("gap", "9px");
        const spacing = await customList.locator(".mt-tab-item").evaluateAll(([a, b], vertical) => {
          const first = a.getBoundingClientRect();
          const second = b.getBoundingClientRect();
          return vertical ? second.top - first.bottom : second.left - first.right;
        }, placement === "start");
        expect(spacing).toBeCloseTo(9);
      }
      await expect(page.getByLabel("Unchanged input", {exact:true})).toHaveCSS("height", "34px");
      await expect(page.getByRole("tablist", {name:"Explicit zero gap", exact:true})).toHaveCSS("gap", "0px");
      async function lowerRows(frame) {
        const rect = await frame.boundingBox();
        // Locator screenshots can capture a neighboring row because of
        // clip rounding. Sample the two pixels inside the frame
        // directly from the viewport, excluding the adjacent list border.
        const data = (await page.screenshot({ scale: "css" })).toString("base64");
        return page.evaluate(async ({ data, x, bottom }) => {
          const image = await createImageBitmap(await (await fetch("data:image/png;base64," + data)).blob());
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0);
          const pixel = (y) => [...context.getImageData(x, y, 1, 1).data];
          return [pixel(bottom - 1), pixel(bottom - 2)];
        }, { data, x: Math.floor(rect.x + 20), bottom: Math.round(rect.y + rect.height) });
      }
      for (const variant of ["card", "editable-card"]) {
        const region = page.getByTestId(`${variant}-medium-top`);
        // Anchor the frame at integer viewport coordinates before sampling.
        await region.evaluate((node) => Object.assign(node.style, {
          position: "fixed", top: "24px", left: "24px", width: "380px", zIndex: "10",
        }));
        const activeFrame = region.locator(".mt-tab-item[data-active]");
        const inactiveFrame = region.locator(".mt-tab-item:not([data-active])").first();
        const activeTab = activeFrame.getByRole("tab");
        await page.mouse.move(0, 0);
        const activeIdle = await lowerRows(activeFrame);
        await activeTab.hover();
        await expect(activeTab).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        expect(await lowerRows(activeFrame)).toEqual(activeIdle);
        if (variant === "editable-card") {
          const close = activeFrame.getByRole("button", {name:"Close Icon tab", exact:true});
          await close.hover();
          await expect(close).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
          await expect(activeTab).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
          expect(await lowerRows(activeFrame)).toEqual(activeIdle);
        }
        const inactiveTab = inactiveFrame.getByRole("tab");
        await inactiveTab.hover();
        const [inactiveEdge, inactiveFill] = await lowerRows(inactiveFrame);
        const [border, fill] = await inactiveTab.evaluate((tab) => [
          getComputedStyle(tab.parentElement).borderBottomColor,
          getComputedStyle(tab).backgroundColor,
        ].map(color => color.match(/\d+/g).map(Number)));
        // Gray hover reaches the unchanged stroke without a white seam.
        expect(inactiveEdge).toEqual([...border, 255]);
        expect(inactiveFill).toEqual([...fill, 255]);
        expect(inactiveFill).not.toEqual(activeIdle[1]);
        await expect(inactiveFrame).toHaveCSS("border-bottom-width", "1px");
        await region.screenshot({path:`artifacts/tabs-browser/${name}-${variant}-hover.png`});
        await region.evaluate((node) => {
          for (const prop of ["position", "top", "left", "width", "z-index"]) node.style.removeProperty(prop);
        });
      }
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

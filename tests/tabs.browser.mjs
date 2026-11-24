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
const only = process.env.MTONE_TABS_BROWSER;
if (only && !["chromium", "firefox", "webkit"].includes(only)) throw new Error(`Unknown Tabs browser: ${only}`);
try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
    ["webkit", webkit],
  ]) {
    if (only && name !== only) continue;
    let browser, page;
    try {
      browser = await engine.launch({
        headless: true,
        executablePath: name === "chromium" ? process.env.CHROMIUM_PATH : undefined,
      });
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
      await page.goto("http://127.0.0.1:5212/tests/fixtures/tabs.html?sizes");
      for (const [size, height] of [["sm", 28], ["md", 32], ["lg", 36]]) {
        for (const variant of ["line", "card", "editable-card", "attached"]) {
          for (const placement of ["top", "bottom", "start", "end"]) {
            const tabs = page.getByTestId(`preset-${variant}-${size}-${placement}`);
            const list = tabs.getByRole("tablist");
            const frames = list.locator(".mt-tab-item");
            await expect(frames).toHaveCount(2);
            const heights = await frames.evaluateAll(nodes =>
              nodes.map(node => node.getBoundingClientRect().height));
            expect(heights, `${variant} ${size} ${placement}`).toEqual([height, height]);
            const first = list.getByRole("tab", { name: "First", exact: true });
            const [frame, hit] = await Promise.all([frames.first().boundingBox(), first.boundingBox()]);
            expect(hit.height).toBeCloseTo(height - (["card", "editable-card"].includes(variant) ? 2 : 0));
            expect(hit.y).toBeGreaterThanOrEqual(frame.y);
            if (variant === "attached" && placement === "top") {
              await expect(list).toHaveCSS("min-block-size", `${height}px`);
              const body = await tabs.getByRole("tabpanel").boundingBox();
              expect(frame.y + frame.height).toBeCloseTo(body.y, 0);
            }
          }
        }
      }
      await expect(page.getByRole("tablist", { name: "Inner default", exact: true }).locator(".mt-tab-item")).toHaveCSS("height", "32px");
      await page.goto("http://127.0.0.1:5212/tests/fixtures/tabs-compact.html");
      await expect(page.getByRole("tablist", { name: "Unchanged line", exact: true }).locator(".mt-tab-item")).toHaveCSS("height", "32px");
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
            const secondOffset = await frames.evaluateAll(([a, b]) =>
              b.getBoundingClientRect().top - a.getBoundingClientRect().top);
            if (!vertical) expect(secondOffset).toBeCloseTo(0);
            if (placement === "top") {
              const selectedOffset = await frames.first().evaluate(frame =>
                frame.getBoundingClientRect().top - frame.parentElement.getBoundingClientRect().top);
              expect(selectedOffset).toBeCloseTo(variant === "line" ? 0 : 1);
            }
            await expect(region.getByRole("tablist")).toHaveCSS(
              "overflow-y", variant !== "line" && placement === "top" ? "hidden" : "auto",
            );


            for (const frame of await frames.all()) {
              await expect(frame).toHaveCSS("height", "32px");
              await expect(frame).toHaveCSS("border-bottom-left-radius", "0px");
              await expect(frame).toHaveCSS("border-bottom-right-radius", "0px");
            }
            const tab = region.getByRole("tab", {name:"Icon tab", exact:true});
            await expect(tab).toHaveCSS("font-size", `${font}px`);
            await expect(tab).toHaveCSS("line-height", "20px");
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
      await expect(page.getByRole("tablist", {name:"Nested medium card", exact:true}).locator(".mt-tab-item")).toHaveCSS("height", "32px");
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
      await expect(page.getByLabel("Unchanged input", {exact:true})).toHaveCSS("height", "32px");
      await expect(page.getByRole("tablist", {name:"Explicit zero gap", exact:true})).toHaveCSS("gap", "0px");
      async function lowerRows(frame, offset = 20, count = 2) {
        const rect = await frame.boundingBox();
        // Locator screenshots can capture a neighboring row because of
        // clip rounding. Sample the frame’s last two rows directly from
        // the viewport, including the divider when it shares that edge.
        const data = (await page.screenshot({ scale: "css" })).toString("base64");
        return page.evaluate(async ({ data, x, bottom, count }) => {
          const image = await createImageBitmap(await (await fetch("data:image/png;base64," + data)).blob());
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0);
          const pixel = (y) => [...context.getImageData(x, y, 1, 1).data];
          return Array.from({length:count}, (_, i) => pixel(bottom - i - 1));
        }, { data, x: Math.floor(rect.x + offset), bottom: Math.round(rect.y + rect.height), count });
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
        const list = region.getByRole("tablist");
        // A horizontal scroller must never pick up a one-pixel vertical range.
        // WebKit scrolls that extra pixel into view on hover, exposing a seam.
        expect(await list.evaluate(node => ({
          position: node.scrollTop,
          range: node.scrollHeight - node.clientHeight,
        }))).toEqual({ position: 0, range: 0 });
        const [inactiveEdge, inactiveFill] = await lowerRows(inactiveFrame);
        const fill = await inactiveTab.evaluate(tab => getComputedStyle(tab).backgroundColor.match(/\d+/g).map(Number));
        // The frame bottom now lands on the uninterrupted list divider.
        // Its own border is transparent; gray reaches the only visible stroke.
        await expect(inactiveFrame).toHaveCSS("border-bottom-color", "rgba(0, 0, 0, 0)");
        const divider = await inactiveFrame.evaluate(frame =>
          getComputedStyle(frame.parentElement).borderBottomColor.match(/\d+/g).map(Number));
        expect(inactiveEdge).toEqual([...divider, 255]);
        const [gapEdge] = await lowerRows(inactiveFrame, -2);
        expect(gapEdge).toEqual(inactiveEdge);
        expect(await inactiveFrame.evaluate(frame =>
          frame.getBoundingClientRect().bottom - frame.parentElement.getBoundingClientRect().bottom
        )).toBeCloseTo(0);
        expect(inactiveFill).toEqual([...fill, 255]);
        expect(inactiveFill).not.toEqual(activeIdle[1]);
        await expect(inactiveFrame).toHaveCSS("border-bottom-width", "1px");
        await region.screenshot({path:`artifacts/tabs-browser/${name}-${variant}-hover.png`});
        await region.evaluate(node => { node.style.width = "145px"; });
        await expect.poll(() => list.evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);
        await activeTab.focus();
        await page.keyboard.press("ArrowRight");
        await expect(inactiveTab).toBeFocused();
        await expect.poll(() => list.evaluate(el => el.scrollTop)).toBe(0);

        await region.evaluate((node) => {
          for (const prop of ["position", "top", "left", "width", "z-index"]) node.style.removeProperty(prop);
        });
      }
      const line = page.getByTestId("line-medium-top");
      await line.evaluate(node => Object.assign(node.style, {
        position: "fixed", top: "24px", left: "24px", width: "380px", zIndex: "10",
      }));
      const topList = line.getByRole("tablist");
      const selected = topList.getByRole("tab", {name:"Icon tab", exact:true});
      const adjacent = topList.getByRole("tab", {name:"Plain tab", exact:true});
      await expect(topList).toHaveCSS("height", "33px");
      await expect(selected).toHaveCSS("height", "32px");
      const firstBox = await selected.boundingBox();
      const nextBox = await adjacent.boundingBox();
      const barBox = await topList.boundingBox();
      const selectedX = firstBox.x - barBox.x + 20;
      const adjacentX = nextBox.x - barBox.x + 20;
      const [baseline, adjacentSecond] = await lowerRows(topList, adjacentX);
      const [lineEdge, lineSecond, lineThird] = await lowerRows(topList, selectedX, 3);
      expect(lineEdge).toEqual(lineSecond);
      expect(lineThird).not.toEqual(lineSecond);
      expect(lineEdge).not.toEqual(baseline);
      expect(baseline).not.toEqual(adjacentSecond);
      const label = selected.locator(".mt-tab-label");
      const beforeY = (await label.boundingBox()).y;
      await selected.hover();
      expect((await label.boundingBox()).y).toBe(beforeY);
      expect((await lowerRows(topList, selectedX, 3)).slice(0, 2)).toEqual([lineEdge,lineEdge]);
      expect(await topList.evaluate(node => node.scrollHeight === node.clientHeight && node.scrollTop === 0)).toBe(true);
      await line.screenshot({path:`artifacts/tabs-browser/${name}-line-indicator.png`});
      if (name === "chromium") {
        await page.emulateMedia({forcedColors:"active"});
        await expect(topList).toHaveCSS("border-bottom-width", "1px");
        await expect(topList).toHaveCSS("height", "33px");
        await expect(selected).toHaveCSS("border-bottom-width", "2px");
        expect(await selected.evaluate(el => getComputedStyle(el, "::after").content)).toBe("none");
        await page.emulateMedia({forcedColors:"none"});
      }
      const colored = (name) => page.getByRole("tablist", {name, exact:true});
      const topAccent = async (name) => colored(name).getByRole("tab").evaluate(tab => ({
        indicator: getComputedStyle(tab, "::after").backgroundColor,
        text: getComputedStyle(tab).color,
      }));
      const defaultBlue = "rgb(37, 99, 173)";
      for (const [placement, property] of [["bottom","border-top-color"],["start","border-inline-end-color"],["end","border-inline-start-color"]]) {
        const list = colored(`Color ${placement}`);
        await expect(list.getByRole("tab")).toHaveCSS(property, defaultBlue);
        await expect(list.getByRole("tab")).not.toHaveCSS("color", defaultBlue);
      }
      expect((await topAccent("Color top")).indicator).toBe(defaultBlue);
      expect((await topAccent("Color top")).text).not.toBe(defaultBlue);
      expect((await topAccent("Custom indicator")).indicator).toBe("rgb(191, 57, 116)");
      expect((await topAccent("Dark indicator")).indicator).toBe("rgb(134, 181, 237)");
      expect((await topAccent("Override indicator")).indicator).toBe("rgb(23, 51, 68)");
      const nestedColor = await topAccent("Nested default indicator");
      expect(nestedColor.indicator).toBe(nestedColor.text);
      await page.emulateMedia({colorScheme:"dark"});
      expect((await topAccent("System indicator")).indicator).toBe("rgb(134, 181, 237)");
      expect((await topAccent("Color top")).indicator).toBe(defaultBlue);
      await page.emulateMedia({colorScheme:"light"});
      expect((await topAccent("System indicator")).indicator).toBe(defaultBlue);
      if (name === "chromium") {
        await page.emulateMedia({forcedColors:"active"});
        await expect(colored("Color bottom").getByRole("tab")).not.toHaveCSS("border-top-color", defaultBlue);
        await expect(colored("Color top")).toHaveCSS("border-bottom-width", "1px");
        await page.emulateMedia({forcedColors:"none"});
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

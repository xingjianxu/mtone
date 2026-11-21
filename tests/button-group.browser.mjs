import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const server = await createServer({ root: process.cwd(), server: { host: "127.0.0.1", port: 5219, strictPort: true }, logLevel: "error" });
await server.listen();
await mkdir("artifacts/button-group-browser", { recursive: true });
let failed = false;
try {
  for (const [name, engine] of [["chromium", chromium], ["firefox", firefox], ["webkit", webkit]]) {
    if (process.env.BROWSER && process.env.BROWSER !== name) continue;
    let browser;
    try {
      browser = await engine.launch({
        headless: true,
        executablePath: name === "chromium" ? process.env.CHROMIUM_PATH :
          name === "webkit" ? process.env.WEBKIT_PATH : undefined,
      });
      const page = await browser.newPage({ viewport: { width: 800, height: 650 } });
      await page.goto("http://127.0.0.1:5219/tests/fixtures/button-group.html");
      await expect(page.getByTestId("default")).toHaveCSS("gap", "4px");
      for (const dir of ["ltr", "rtl"]) {
        const group = page.getByTestId(dir);
        await expect(group).toHaveCSS("gap", "0px");
        const buttons = group.getByRole("button");
        const bounds = await buttons.evaluateAll(nodes => nodes.map(node => {
          const r = node.getBoundingClientRect();
          const s = getComputedStyle(node);
          return { left: r.left, right: r.right, height: r.height, start: s.borderStartStartRadius, end: s.borderStartEndRadius };
        }));
        assert.equal(bounds[0].start, "4px");
        assert.equal(bounds[0].end, "0px");
        assert.equal(bounds[1].start, "0px");
        assert.equal(bounds[1].end, "0px");
        assert.equal(bounds[2].end, "4px");
        assert.equal(bounds[0].height, 34);
        assert.equal(dir === "ltr" ? bounds[0].right - bounds[1].left : bounds[1].right - bounds[0].left, 1);
        await buttons.nth(1).focus();
        await expect(buttons.nth(1)).toHaveCSS("z-index", "2");
        await expect(buttons.nth(1)).toHaveCSS("outline-style", "solid");
      }
      for (const dir of ["ltr", "rtl"]) {
        const sections = page.getByTestId("sections-" + dir);
        const button = label => sections.getByRole("button", { name: label, exact: true });
        for (const [label, start, end] of [
          ["Gallery", "7px", "9px"],
          ["Download", "9px", "7px"],
          ["View gallery", "7px", "7px"],
          ["Loading", "7px", "7px"],
          ["Legacy", "9px", "9px"],
          ["Only icon", "0px", "0px"],
        ]) {
          await expect(button(label)).toHaveCSS("height", "34px");
          await expect(button(label)).toHaveCSS("padding-inline-start", start);
          await expect(button(label)).toHaveCSS("padding-inline-end", end);
        }
        const both = button("View gallery");
        const [start, label, end] = await Promise.all(
          ["start", "label", "end"].map(testId => both.getByTestId(testId).boundingBox()),
        );
        const ordered = dir === "ltr" ? [start, label, end] : [end, label, start];
        assert(ordered[0].x + ordered[0].width < ordered[1].x);
        assert(ordered[1].x + ordered[1].width < ordered[2].x);
        // Firefox can report a tiny floating-point residue in DOM geometry.
        assert(Math.abs(start.width - 14) < 0.01, `Expected start icon width of 14px, got ${start.width}px`);
        assert(Math.abs(end.width - 14) < 0.01, `Expected end icon width of 14px, got ${end.width}px`);
        assert(Math.abs(start.y - end.y) < 0.01);
        await expect(button("Loading")).toBeDisabled();
        await expect(button("Loading")).toHaveAttribute("aria-busy", "true");
      }
      await expect(page.getByTestId("single").getByRole("button")).toHaveCSS("border-radius", "4px");
      const danger = page.getByTestId("danger").getByRole("button");
      await expect(danger.first()).toHaveCSS("background-color", "rgb(182, 64, 59)");
      await danger.first().hover();
      await expect(danger.first()).toHaveCSS("background-color", "rgb(158, 54, 50)");
      await expect(danger.first()).toHaveCSS("color", "rgb(255, 255, 255)");
      await expect(danger.first()).toHaveCSS("border-inline-end-color", "rgba(255, 255, 255, 0.3)");
      await danger.first().focus();
      await expect(danger.first()).toHaveCSS("border-inline-end-color", "rgba(255, 255, 255, 0.3)");
      await expect(danger.last()).toBeDisabled();
      await expect(danger.last()).toHaveCSS("background-color", "rgb(182, 64, 59)");
      const menu = page.getByRole("menu");
      const dangerTrigger = danger.nth(1);
      await dangerTrigger.focus();
      await page.keyboard.press("ArrowDown");
      await expect(menu.getByRole("menuitem", { name: "Confirm removal" })).toBeFocused();
      await expect(dangerTrigger).toHaveCSS("margin-inline-start", "-1px");
      await expect(dangerTrigger).toHaveCSS("border-radius", "0px");
      await expect(dangerTrigger).toHaveCSS("border-inline-start-color", "rgba(255, 255, 255, 0.3)");
      await expect(dangerTrigger).toHaveCSS("border-inline-end-color", "rgba(255, 255, 255, 0.3)");
      await page.keyboard.press("Escape");
      await expect(menu).toHaveCount(0);
      await expect(dangerTrigger).toBeFocused();

      for (const dir of ["ltr", "rtl"]) {
        const docs = page.getByTestId("docs-" + dir);
        const split = docs.getByRole("group", { name: "导出文档" });
        const primary = split.getByRole("button", { name: "导出 PDF" });
        const trigger = split.getByRole("button", { name: "更多导出格式" });
        const assertSeam = async () => {
          const [first, last] = await split.getByRole("button").evaluateAll(nodes => nodes.map(n => {
            const rect = n.getBoundingClientRect();
            const css = getComputedStyle(n);
            return {
              left: rect.left, right: rect.right, top: rect.top, height: rect.height,
              radii: [css.borderStartStartRadius, css.borderEndStartRadius, css.borderStartEndRadius, css.borderEndEndRadius],
              margin: css.marginInlineStart,
            };
          }));
          const overlap = dir === "ltr" ? first.right - last.left : last.right - first.left;
          assert(Math.abs(overlap - 1) < 0.01, dir + " expected 1px overlap, got " + overlap);
          assert.equal(first.height, last.height);
          assert.equal(first.top, last.top);
          assert.deepEqual(first.radii, ["4px", "4px", "0px", "0px"]);
          assert.deepEqual(last.radii, ["0px", "0px", "4px", "4px"]);
          assert.equal(last.margin, "-1px");
        };
        await assertSeam();
        await primary.click();
        await expect(docs.getByRole("status")).toHaveText("已选择导出 PDF");
        await trigger.focus();
        await page.keyboard.press("ArrowDown");
        await expect(menu.getByRole("menuitem", { name: "导出 Markdown" })).toBeFocused();
        await assertSeam();
        await page.keyboard.press("Escape");
        await expect(trigger).toBeFocused();
        await expect(menu).toHaveCount(0);
        await assertSeam();
        await trigger.click();
        await expect(menu).toBeVisible();
        await assertSeam();
        await menu.getByRole("menuitem", { name: "导出 Markdown" }).click();
        await expect(docs.getByRole("status")).toHaveText("已选择导出 Markdown");
        await assertSeam();
        await trigger.focus();
        await page.keyboard.press("ArrowDown");
        await expect(menu.getByRole("menuitem", { name: "导出 Markdown" })).toBeFocused();
        await page.keyboard.press("End");
        await page.keyboard.press("Enter");
        await expect(docs.getByRole("status")).toHaveText("已选择导出 HTML");
        await assertSeam();
      }
      await page.getByTestId("docs-ltr").getByRole("button", { name: "更多导出格式" }).click();
      await expect(menu).toBeVisible();
      await page.screenshot({ path: "artifacts/button-group-browser/" + name + ".png", fullPage: true });
      console.log(name + " passed");
    } catch (error) { failed = true; console.error(name, error); }
    finally { await browser?.close(); }
  }
} finally { await server.close(); }
if (failed) process.exitCode = 1;

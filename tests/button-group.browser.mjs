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
        executablePath: name === "chromium" ? process.env.CHROMIUM_PATH : undefined,
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
      const docs = page.getByTestId("docs");
      const split = docs.getByRole("group", { name: "导出文档" });
      const primary = split.getByRole("button", { name: "导出 PDF" });
      const trigger = split.getByRole("button", { name: "更多导出格式" });
      const splitBounds = await split.getByRole("button").evaluateAll(nodes => nodes.map(n => { const r = n.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, height: r.height }; }));
      assert.equal(splitBounds[0].right - splitBounds[1].left, 1);
      assert.equal(splitBounds[0].height, splitBounds[1].height);
      assert.equal(splitBounds[0].top, splitBounds[1].top);
      await primary.click();
      await expect(docs.getByRole("status")).toHaveText("已选择导出 PDF");
      await trigger.focus();
      await page.keyboard.press("ArrowDown");
      await expect(page.getByRole("menu")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(trigger).toBeFocused();
      await trigger.click();
      await page.getByRole("menuitem", { name: "导出 Markdown" }).click();
      await expect(docs.getByRole("status")).toHaveText("已选择导出 Markdown");
      await trigger.focus();
      await page.keyboard.press("ArrowDown");
      await expect(page.getByRole("menuitem", { name: "导出 Markdown" })).toBeFocused();
      await page.keyboard.press("End");
      await page.keyboard.press("Enter");
      await expect(docs.getByRole("status")).toHaveText("已选择导出 HTML");
      await trigger.click();
      await expect(page.getByRole("menu")).toBeVisible();
      await page.screenshot({ path: "artifacts/button-group-browser/" + name + ".png", fullPage: true });
      console.log(name + " passed");
    } catch (error) { failed = true; console.error(name, error); }
    finally { await browser?.close(); }
  }
} finally { await server.close(); }
if (failed) process.exitCode = 1;

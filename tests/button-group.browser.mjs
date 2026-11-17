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
    let browser;
    try {
      browser = await engine.launch({ headless: true });
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
        assert.equal(bounds[0].height, 28);
        assert.equal(dir === "ltr" ? bounds[0].right - bounds[1].left : bounds[1].right - bounds[0].left, 1);
        await buttons.nth(1).focus();
        await expect(buttons.nth(1)).toHaveCSS("z-index", "2");
        await expect(buttons.nth(1)).toHaveCSS("outline-style", "solid");
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
      await page.screenshot({ path: "artifacts/button-group-browser/" + name + ".png", fullPage: true });
      console.log(name + " passed");
    } catch (error) { failed = true; console.error(name, error); }
    finally { await browser?.close(); }
  }
} finally { await server.close(); }
if (failed) process.exitCode = 1;

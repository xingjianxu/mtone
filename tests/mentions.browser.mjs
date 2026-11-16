import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 5198, strictPort: true },
  logLevel: "error",
});
await server.listen();
await mkdir("artifacts/mentions-browser", { recursive: true });
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
      page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
      page.setDefaultTimeout(10000);
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("http://127.0.0.1:5198/tests/fixtures/mentions.html");
      const basic = page.getByRole("combobox", { name: "Basic", exact: true }),
        popup = page.locator(".mt-mentions-popup");
      assert(
        (await basic.boundingBox()).height > 65,
        "rows=3 is a real multiline textarea",
      );
      await basic.fill("@");
      await expect(
        page.getByRole("option", { name: "Alice", exact: true }),
      ).toBeVisible();
      const firstId = await basic.getAttribute("aria-controls");
      await expect(basic).toHaveAttribute(
        "aria-activedescendant",
        await page
          .getByRole("option", { name: "Alice", exact: true })
          .getAttribute("id"),
      );
      await basic.press("ArrowDown");
      await expect(
        page.getByRole("option", { name: "Bob", exact: true }),
      ).toHaveAttribute("aria-selected", "true");
      const highlight = await page
        .getByRole("option", { name: "Bob", exact: true })
        .evaluate((el) => {
          const s = getComputedStyle(el);
          return {
            background: s.backgroundColor,
            outline: s.outlineStyle,
            shadow: s.boxShadow,
            border: s.borderWidth,
          };
        });
      assert.deepEqual(highlight, {
        background: "rgb(241, 241, 239)",
        outline: "none",
        shadow: "none",
        border: "0px",
      });
      // Deliberately attempt pointer input on an aria-disabled option; normal
      // Playwright click correctly refuses disabled targets.
      await page.getByRole("option", { name: "Locked", exact: true }).click({ force: true });
      await expect(basic).toHaveValue("@");
      await basic.press("Enter");
      await expect(basic).toHaveValue("@bob ");
      await expect(page.getByTestId("selected")).toHaveText("1");
      await expect(popup).toHaveCount(0);
      await basic.fill("Hi @al and bye");
      await basic.press("Control+Home");
      for (let i = 0; i < 6; i++) await basic.press("ArrowRight");
      await expect.poll(() => basic.evaluate(el => el.selectionStart)).toBe(6);
      await basic.press("ArrowDown");
      await page.getByRole("option", { name: "Alice", exact: true }).click();
      await expect(basic).toHaveValue("Hi @alice and bye");
      await expect
        .poll(() => basic.evaluate((el) => el.selectionStart))
        .toBe(10);
      await basic.fill("prefix @al suffix\nsecond line");
      await basic.press("Control+Home");
      for (let i = 0; i < 10; i++) await basic.press("ArrowRight");
      await expect.poll(() => basic.evaluate(el => el.selectionStart)).toBe(10);
      await basic.press("ArrowDown");
      await expect(popup).toBeVisible();
      const middleBox = await basic.boundingBox(),
        middlePopup = await popup.boundingBox();
      assert(
        middlePopup.x > middleBox.x + 30,
        "suffix on later lines must not move caret popup to line start",
      );
      await basic.press("Escape");
      await page.getByRole("button", { name: "Clear", exact: true }).click();
      await expect(basic).toHaveValue("");
      await expect(basic).toBeFocused();
      await basic.fill("@");
      await basic.press("Escape");
      await expect(popup).toHaveCount(0);
      await basic.press("ArrowDown");
      await expect(popup).toBeVisible();
      await basic.press("Tab");
      await expect(popup).toHaveCount(0);
      await expect(basic).toHaveValue("@");
      await basic.fill("@");
      await basic.dispatchEvent("compositionstart", { data: "" });
      await basic.dispatchEvent("keydown", {
        key: "Enter",
        code: "Enter",
        isComposing: true,
        keyCode: 229,
      });
      await expect(basic).toHaveValue("@");
      await expect(page.getByTestId("selected")).toHaveText("2");
      await basic.dispatchEvent("compositionend", { data: "" });
      const second = page.getByRole("combobox", {
        name: "Second",
        exact: true,
      });
      await second.fill("#al");
      await expect(
        page.getByRole("option", { name: "Alice", exact: true }),
      ).toBeVisible();
      assert.notEqual(await second.getAttribute("aria-controls"), firstId);
      await second.press("Enter");
      await expect(second).toHaveValue("#alice ");
      await expect(
        page.getByRole("combobox", { name: "Disabled", exact: true }),
      ).toBeDisabled();
      await page
        .getByRole("combobox", { name: "Read only", exact: true })
        .click();
      await expect(popup).toHaveCount(0);
      const loading = page.getByRole("combobox", {
        name: "Loading",
        exact: true,
      });
      await loading.fill("@");
      await expect(page.getByRole("status")).toHaveText("Loading…");
      await expect(loading).not.toHaveAttribute("aria-activedescendant");
      await page
        .getByRole("button", { name: "Load options", exact: true })
        .click();
      await loading.click();
      await loading.press("ArrowDown");
      await expect(
        page.getByRole("option", { name: "Alice", exact: true }),
      ).toBeVisible();
      const auto = page.getByRole("combobox", {
        name: "Auto size",
        exact: true,
      });
      const initial = (await auto.boundingBox()).height;
      assert(
        initial < 55,
        "autoSize minRows=1 shrinks below three-row default",
      );
      await auto.fill("one\ntwo\nthree\nfour\nfive\nsix");
      await expect
        .poll(async () => (await auto.boundingBox()).height)
        .toBeGreaterThan(initial);
      const tall = (await auto.boundingBox()).height;
      await auto.fill("one\ntwo\nthree\nfour\nfive\nsix\nseven\neight");
      assert(
        Math.abs((await auto.boundingBox()).height - tall) < 2,
        "autoSize obeys maxRows",
      );
      await auto.fill("one");
      await expect
        .poll(async () => (await auto.boundingBox()).height)
        .toBe(initial);
      const top = page.getByRole("combobox", {
        name: "Top portal",
        exact: true,
      });
      await top.scrollIntoViewIfNeeded();
      await top.fill("@");
      await expect(
        page.getByTestId("portal").getByRole("listbox"),
      ).toBeVisible();
      const topBox = await top.boundingBox();
      assert(
        (await popup.boundingBox()).y < topBox.y,
        "top placement is above the input",
      );
      const scroll = page.getByRole("combobox", {
        name: "Scroll",
        exact: true,
      });
      await scroll.scrollIntoViewIfNeeded();
      await scroll.fill("@");
      const oneLine = (await popup.boundingBox()).y;
      await scroll.fill("first\nsecond\n@");
      await expect
        .poll(async () => (await popup.boundingBox()).y)
        .toBeGreaterThan(oneLine + 25);
      await scroll.fill("first\nsecond\nthird\nfourth\nfifth\n@");
      await scroll.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
        el.dispatchEvent(new Event("scroll", { bubbles: true }));
      });
      await expect(popup).toBeVisible();
      let inputBox = await scroll.boundingBox(),
        popupBox = await popup.boundingBox();
      assert(
        popupBox.y >= inputBox.y &&
          popupBox.y <= inputBox.y + inputBox.height + 30,
        "scrolled caret popup follows visible text",
      );
      const before = popupBox.y;
      await page.evaluate(() => window.scrollBy(0, 25));
      await expect
        .poll(async () =>
          Math.abs((await popup.boundingBox()).y - (before - 25)),
        )
        .toBeLessThan(3);
      const horizontal = page.getByRole("combobox", {
        name: "Horizontal",
        exact: true,
      });
      await horizontal.scrollIntoViewIfNeeded();
      await horizontal.fill("long text ".repeat(15) + "@");
      await horizontal.evaluate((el) => {
        el.scrollLeft = el.scrollWidth;
        el.dispatchEvent(new Event("scroll", { bubbles: true }));
      });
      await expect(popup).toBeVisible();
      inputBox = await horizontal.boundingBox();
      popupBox = await popup.boundingBox();
      assert(
        popupBox.y < inputBox.y + 45,
        "horizontal scrolling does not create phantom wrapped lines",
      );
      await page.setViewportSize({ width: 320, height: 800 });
      const narrow = page.getByRole("combobox", {
        name: "Narrow",
        exact: true,
      });
      await narrow.scrollIntoViewIfNeeded();
      await narrow.fill("text text text @");
      await expect(popup).toBeVisible();
      popupBox = await popup.boundingBox();
      assert(
        popupBox.x >= 0 && popupBox.x + popupBox.width <= 321,
        "popup stays in narrow viewport",
      );
      await page.screenshot({
        path: `artifacts/mentions-browser/${name}-narrow.png`,
      });
      assert.deepEqual(errors, [], `${name}: no page errors`);
      console.log(
        `${name}: Mentions keyboard, IME, selection, states, autosize, caret/scroll/portal, styles and narrow viewport passed`,
      );
    } catch (error) {
      failed = true;
      console.error(`${name}: ${error.stack ?? error}`);
      if (page)
        await page
          .screenshot({
            path: `artifacts/mentions-browser/${name}-failure.png`,
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

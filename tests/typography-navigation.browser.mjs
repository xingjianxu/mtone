import { createServer } from "vite";
import { chromium, firefox, webkit } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const server = await createServer({
  root: "apps/docs",
  server: { host: "127.0.0.1", port: 5203, strictPort: true },
  logLevel: "error",
});
await server.listen();
let browser;
try {
  browser = await { chromium, firefox, webkit }[
    process.env.BROWSER || "chromium"
  ].launch({ headless: true, executablePath: process.env.CHROMIUM_PATH });
  const page = await browser.newPage();
  await mkdir("artifacts/typography-navigation", { recursive: true });
  const names = ["Title", "Text", "Paragraph", "Link", "Blockquote"];
  for (const width of [1440, 768, 360]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("http://127.0.0.1:5203/#/components/Typography");
    await page
      .getByRole("heading", { name: "Typography", exact: true })
      .waitFor();
    assert.equal(
      await page
        .locator('.docs-sidebar a[href="#/components/Typography"]')
        .count(),
      1,
    );
    await page.screenshot({ path: `artifacts/typography-navigation/${process.env.BROWSER || "chromium"}-${width}.png` });
    for (const name of names) {
      assert.equal(
        await page
          .locator(`.docs-sidebar a[href="#/components/${name}"]`)
          .count(),
        0,
      );
      await page
        .getByRole("navigation", { name: "Typography 子组件", exact: true })
        .getByRole("link", { name, exact: true })
        .click();
      await page.waitForURL(`**/#/components/Typography?section=${name}`);
      await page.waitForFunction(
        (id) => document.activeElement?.id === id,
        `typography-${name.toLowerCase()}`,
      );
      const top = await page
        .locator(`#typography-${name.toLowerCase()}`)
        .evaluate((el) => el.getBoundingClientRect().top);
      assert(top >= 48 && top <= 90, `${name} scroll target at ${top}`);
    }
    await page.reload();
    await page.waitForFunction(
      () => document.activeElement?.id === "typography-blockquote",
    );
    await page.goBack();
    await page.waitForFunction(
      () => document.activeElement?.id === "typography-link",
    );
    await page.goForward();
    await page.waitForFunction(
      () => document.activeElement?.id === "typography-blockquote",
    );
    await page
      .getByRole("navigation", { name: "Typography 子组件", exact: true })
      .getByRole("link", { name: "Blockquote", exact: true })
      .click();
    assert.equal(
      await page.evaluate(() => document.activeElement.id),
      "typography-blockquote",
    );
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.goto("http://127.0.0.1:5203/#/components/Blockquote");
    await page.waitForFunction(
      () => document.activeElement?.id === "typography-blockquote",
    );
    assert.equal(
      await page
        .getByRole("heading", { name: "Typography", exact: true })
        .count(),
      1,
    );
  }
  console.log(
    "Typography consolidated navigation, deep links, history and responsive checks passed",
  );
} finally {
  await browser?.close();
  await server.close();
}

import { createServer } from "vite";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const server = await createServer({
  root: process.cwd(),
  server: { port: 5187, host: "127.0.0.1", strictPort: true },
  logLevel: "error",
});
await server.listen();
let browser;
try {
  browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}),
    headless: true,
  });
  const page = await browser.newPage({
    viewport: { width: 900, height: 1000 },
  });
  page.on("pageerror", (error) => console.error(error));
  page.on("console", (message) => { if (message.type() === "error") console.error(message.text()); });
  const response = await page.goto("http://127.0.0.1:5187/tests/fixtures/select-layout.html");
  assert.equal(response.status(), 200, "Fixture must be served successfully");
  await page.locator(".mt-select").first().waitFor();
  const check = async () => {
    const results = await page.locator(".mt-select").evaluateAll((nodes) =>
      nodes.map((node) => {
        const icon = node.querySelector(".mt-select-icon");
        const b = node.getBoundingClientRect();
        const i = icon.getBoundingClientRect();
        const svg = icon.querySelector("svg").getBoundingClientRect();
        return {
          label: node.getAttribute("aria-label"),
          width: i.width,
          height: i.height,
          svgWidth: svg.width,
          svgHeight: svg.height,
          contained: i.left >= b.left && i.right <= b.right,
          centerDelta: Math.abs((i.top + i.bottom - b.top - b.bottom) / 2),
        };
      }),
    );
    console.log(JSON.stringify(results));
    assert.equal(
      results.length,
      14,
      "Expected both densities and all width/state cases",
    );
    for (const r of results) {
      assert.equal(r.width, 16, `${r.label} icon width`);
      assert.equal(r.height, 16, `${r.label} icon height`);
      assert.equal(r.svgWidth, 16, `${r.label} SVG width`);
      assert.equal(r.svgHeight, 16, `${r.label} SVG height`);
      assert(r.contained, `${r.label} icon outside trigger`);
      assert(r.centerDelta < 1, `${r.label} not centered`);
    }
  };
  await check();
  assert(
    await page
      .getByRole("combobox", { name: "compact-100", exact: true })
      .locator(".mt-select-value")
      .evaluate((el) => el.scrollWidth > el.clientWidth),
    "Long value should truncate within narrow trigger",
  );
  await page
    .getByRole("combobox", { name: "compact-160", exact: true })
    .click();
  await page.getByRole("listbox").waitFor();
  await check();
  await page.getByRole("option", { name: "Short", exact: true }).click();
  assert.equal(
    await page
      .getByRole("combobox", { name: "compact-160", exact: true })
      .innerText(),
    "Short",
  );
  await check();
  assert.equal(
    await page
      .getByRole("combobox", { name: "compact-disabled", exact: true })
      .isDisabled(),
    true,
  );
  console.log("Select geometry, open, selection and disabled checks passed");
} finally {
  await browser?.close();
  await server.close();
}

import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 5249, strictPort: true },
  logLevel: "error",
});
await server.listen();
await mkdir("artifacts/questionnaire-browser", { recursive: true });
let failed = false;
try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
    ["webkit", webkit],
  ].filter(
    ([name]) =>
      !process.env.MTONE_BROWSER || process.env.MTONE_BROWSER === name,
  )) {
    let browser, page;
    try {
      browser = await engine.launch({
        headless: true,
        ...(name === "chromium" && process.env.CHROMIUM_PATH
          ? { executablePath: process.env.CHROMIUM_PATH }
          : {}),
      });
      page = await browser.newPage({ viewport: { width: 320, height: 720 } });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const url = "http://127.0.0.1:5249/tests/fixtures/questionnaire.html";
      await page.goto(url);
      const button = (name) => page.getByRole("button", { name, exact: true });
      await expect(
        page.getByRole("progressbar", { name: "Question 1 of 3" }),
      ).toBeVisible();
      await button("Next").click();
      await expect(page.getByRole("alert")).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Choose a tool" }),
      ).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(
        page.getByRole("radio", { name: "Documentation" }),
      ).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await expect(
        page.getByRole("radio", { name: "Testing" }),
      ).toHaveAttribute("aria-checked", "true");
      await page.keyboard.press("ArrowDown");
      await expect(
        page.getByRole("radio", { name: "Another tool" }),
      ).toHaveAttribute("aria-checked", "true");
      await page.keyboard.press("Tab");
      const other = page.getByRole("textbox", { name: "Another tool" });
      await expect(other).toBeFocused();
      await other.fill("Design");
      await button("Next").click();
      await expect(
        page.getByRole("heading", { name: "Choose topics" }),
      ).toBeFocused();
      await page.keyboard.press("Tab");
      const review = page.getByRole("checkbox", { name: "Independent review" });
      await expect(review).toBeFocused();
      await page.keyboard.press("Space");
      await expect(review).toBeChecked();
      await button("Previous").click();
      await expect(other).toHaveValue("Design");
      await button("Next").click();
      await expect(review).toBeChecked();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `artifacts/questionnaire-browser/${name}-320.png`,
      });
      await button("Skip").click();
      await page.getByRole("textbox", { name: "Notes" }).fill("Done");
      await button("Submit").click();
      await expect(
        page.getByRole("heading", { name: "Responses submitted" }),
      ).toBeFocused();
      await expect(page.getByTestId("answer")).toHaveText(
        JSON.stringify({
          tool: { type: "text", value: "Design" },
          notes: { type: "text", value: "Done" },
        }),
      );
      await page.goto(url + "?dark");
      const card = page.locator(".mt-questionnaire");
      await expect(card).toBeVisible();
      await page.screenshot({
        path: `artifacts/questionnaire-browser/${name}-dark-320.png`,
      });
      expect(errors).toEqual([]);
    } catch (error) {
      failed = true;
      console.error(name, error);
      if (page)
        await page
          .screenshot({
            path: `artifacts/questionnaire-browser/${name}-failure.png`,
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
if (failed) process.exit(1);

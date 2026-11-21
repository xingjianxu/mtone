import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import assert from "node:assert/strict";

const server = await createServer({
  server: { host: "127.0.0.1", port: 5248, strictPort: true },
  logLevel: "error",
});
await server.listen();

try {
  for (const [name, engine] of [["chromium", chromium], ["firefox", firefox], ["webkit", webkit]]) {
    if (process.env.BROWSER && name !== process.env.BROWSER) continue;
    const browser = await engine.launch({
      headless: true,
      executablePath: name === "chromium" ? process.env.CHROMIUM_PATH : undefined,
    });
    try {
      const page = await browser.newPage({ viewport: { width: 1060, height: 800 } });
      const errors = [];
      page.on("pageerror", error => errors.push(error));
      await page.goto("http://127.0.0.1:5248/tests/fixtures/check-card.html");
      const starter = page.getByRole("radio", { name: "Starter", exact: true });
      const team = page.getByRole("radio", { name: "Team", exact: true });
      await expect(starter).toBeChecked();
      await expect(page.getByRole("radio", { name: "Unavailable" })).toBeDisabled();
      await expect(page.getByRole("radio", { name: "Pending" })).toBeDisabled();
      await page.getByRole("button", { name: "Details 0" }).click();
      const details = page.getByRole("button", { name: "Details 1" });
      await expect(details).toBeVisible();
      await details.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("button", { name: "Details 2" })).toBeVisible();
      await expect(page.getByLabel("Submitted values")).toBeEmpty();
      await expect(starter).toBeChecked();
      await starter.focus();
      await page.keyboard.press("ArrowRight");
      await expect(team).toBeFocused();
      await expect(team).toBeChecked();
      await page.getByText("Reports", { exact: true }).click();
      await expect(page.getByRole("checkbox", { name: "Reports" })).toBeChecked();
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByLabel("Submitted values")).toHaveText('[["plan","team"],["extra","backup"],["extra","reports"]]');
      await page.getByText("Second", { exact: true }).click();
      await expect(page.getByRole("radio", { name: "Second" })).toBeChecked();
      await expect(page.getByRole("radio", { name: "Third" })).toBeChecked();
      await page.getByRole("button", { name: "Cancel reset" }).click();
      await page.getByRole("button", { name: "Reset", exact: true }).click();
      await expect(team).toBeChecked();
      await expect(page.getByRole("checkbox", { name: "Reports" })).toBeChecked();
      await page.getByRole("button", { name: "Allow reset" }).click();
      await page.getByRole("button", { name: "Reset", exact: true }).click();
      await expect(page.getByRole("radio", { name: "Second" })).toBeChecked();
      await expect(starter).toBeChecked();
      await expect(page.getByRole("checkbox", { name: "Backups" })).toBeChecked();
      await expect(page.getByRole("checkbox", { name: "Reports" })).not.toBeChecked();
      const cards = page.getByTestId("layout").locator(":scope > *");
      const desktop = [await cards.nth(0).boundingBox(), await cards.nth(1).boundingBox()];
      assert(Math.abs(desktop[0].y - desktop[1].y) < 1, "desktop cards share a row");
      await page.setViewportSize({ width: 360, height: 800 });
      const mobile = [await cards.nth(0).boundingBox(), await cards.nth(1).boundingBox()];
      assert(mobile[1].y > mobile[0].y, "mobile cards stack");
      assert.deepEqual(errors, []);
      console.log(name + ": CheckCard keyboard, actions, form and responsive composition passed");
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}

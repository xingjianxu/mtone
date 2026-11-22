import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, expect } from "@playwright/test";
import { createServer } from "vite";

const cacheDir = await mkdtemp(join(tmpdir(), "mtone-select-popup-docs-"));
let browser, server;
try {
  server = await createServer({
    root: "apps/docs",
    cacheDir,
    server: { host: "127.0.0.1", port: 0 },
    logLevel: "error",
  });
  await server.listen();
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH });
  const page = await browser.newPage({ viewport: { width: 900, height: 800 } });
  const docs = server.resolvedUrls.local[0];
  await page.goto(new URL("#/components/Select?section=popup-search", docs).href);
  const trigger = page.getByRole("button", { name: "切换仓库", exact: true });
  await expect(trigger).toHaveText("design-system");
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "切换仓库", exact: true });
  const search = dialog.getByRole("combobox");
  await expect(search).toBeFocused();
  await expect(dialog.getByRole("option", { name: "archived", exact: true })).toHaveAttribute("aria-disabled", "true");
  const selectedIcon = dialog.getByRole("option", { name: "design-system", exact: true }).locator("svg.lucide-book");
  const unselectedIcon = dialog.getByRole("option", { name: "web-console", exact: true }).locator("svg.lucide-book");
  await expect(selectedIcon).toBeVisible();
  await expect(unselectedIcon).toBeVisible();
  assert(Math.abs((await selectedIcon.boundingBox()).x - (await unselectedIcon.boundingBox()).x) < 1,
    "Selected and unselected repository icons align in the same column");
  await search.fill("release");
  const row = dialog.getByRole("option", { name: "release-tools", exact: true });
  await expect(row.locator("svg.lucide-lock-keyhole")).toBeVisible();
  await search.press("Enter");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toHaveText("release-tools");
  await expect(trigger).toBeFocused();

  await page.goto(new URL("#/components/Popover", docs).href);
  await expect(page.getByRole("heading", { name: "Popover", exact: true, level: 1 })).toBeVisible();
  await expect(page.locator('a[href$="section=searchable-select"]')).toHaveCount(0);
  console.log("Select popup repository demo works, and Popover no longer lists the old demo");
} finally {
  await browser?.close();
  await server?.close();
  await rm(cacheDir, { recursive: true, force: true });
}

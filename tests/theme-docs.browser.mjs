import { createServer } from "vite";
import { chromium, expect, firefox, webkit } from "@playwright/test";

const server = await createServer({
  root: "apps/docs",
  server: { host: "127.0.0.1", port: 0 },
  logLevel: "error",
});
await server.listen();
const base = server.resolvedUrls.local[0];
let browser;
try {
  const engine = process.env.BROWSER || "chromium";
  browser = await ({ chromium, firefox, webkit })[engine].launch({
    headless: true,
    executablePath: engine === "chromium" ? process.env.CHROMIUM_PATH : undefined,
  });
  const context = await browser.newContext({
    colorScheme: "light",
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  await page.goto(base + "#/start");
  const mode = (target, name) => target.getByRole("group", { name: "颜色主题" })
    .getByRole("button", { name, exact: true });
  const pressed = (target, name) => expect(mode(target, name)).toHaveAttribute("aria-pressed", "true");
  const root = page.locator("html");
  await pressed(page, "跟随系统");
  await expect(root).toHaveAttribute("data-mt-theme", "system");
  const header = page.locator(".topbar");
  const lightBackground = await header.evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(root).toHaveCSS("color-scheme", "dark");
  const darkBackground = await header.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(darkBackground).not.toBe(lightBackground);
  await page.getByRole("button", { name: "搜索组件", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toHaveCSS("color-scheme", "dark");
  await expect(dialog).toHaveCSS("background-color", darkBackground);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  await mode(page, "浅色").press("Enter");
  await expect(root).toHaveCSS("color-scheme", "light");
  await expect(header).toHaveCSS("background-color", lightBackground);
  await page.reload();
  await pressed(page, "浅色");
  await expect(root).toHaveAttribute("data-mt-theme", "light");
  const noScripts = await browser.newContext({ colorScheme: "dark" });
  const firstPaint = await noScripts.newPage();
  await firstPaint.route(/main\.tsx/, (route) => route.abort());
  await firstPaint.addInitScript(() => localStorage.setItem("mtone-docs-theme", "light"));
  await firstPaint.goto(base + "#/start");
  await expect(firstPaint.locator("html")).toHaveAttribute("data-mt-theme", "light");
  await expect(firstPaint.locator("html")).toHaveCSS("color-scheme", "light");
  await noScripts.close();

  const showcase = await context.newPage();
  await showcase.emulateMedia({ colorScheme: "light" });
  await showcase.goto(base + "showcase.html");
  await pressed(showcase, "浅色");
  await mode(showcase, "深色").click();
  await expect(showcase.locator("html")).toHaveCSS("color-scheme", "dark");
  await pressed(page, "深色");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(root).toHaveCSS("color-scheme", "dark");

  await mode(page, "跟随系统").click();
  await expect(root).toHaveCSS("color-scheme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(root).toHaveCSS("color-scheme", "dark");
  await page.reload();
  await pressed(page, "跟随系统");

  await page.goto(base + "#/showcase");
  await expect(page.getByRole("main", { name: "独立应用示例" })).toBeVisible();
  await expect(page.locator(".showcase-page")).toHaveCSS("background-color", darkBackground);
  await pressed(page, "跟随系统");
  await page.goto(base + "#/start");

  await page.setViewportSize({ width: 320, height: 740 });
  await expect(mode(page, "跟随系统")).toBeVisible();
  expect(await header.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.getByRole("button", { name: "打开导航" }).click();
  await expect(page.getByRole("navigation", { name: "文档导航" })).toBeVisible();
  console.log(`Docs theme browser checks passed (${engine})`);
} finally {
  await browser?.close();
  await server.close();
}

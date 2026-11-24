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
  const navigation = page.getByRole("navigation", { name: "文档导航" });
  const paletteLink = navigation.getByRole("link", { name: "颜色预设", exact: true });
  await paletteLink.click();
  await expect(page).toHaveURL(/#\/theme\/color-presets$/);
  await expect(page.getByRole("heading", { level: 1, name: "颜色预设" })).toBeFocused();
  await expect(page.locator('.docs-sidebar a[href="#/theme/color-presets"]')).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("button", { name: "打开导航" })).toHaveAttribute("aria-expanded", "false");
  expect(await page.locator("html").evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);

  const palette = page.getByRole("list", { name: "共享颜色预设" });
  const readPalette = () => palette.getByRole("listitem").evaluateAll((items) => items.map((item) => {
    const swatch = item.firstElementChild;
    const actual = getComputedStyle(swatch).backgroundColor;
    const reference = document.createElement("span");
    reference.style.color = getComputedStyle(item).getPropertyValue(item.querySelector("code").textContent);
    item.append(reference);
    const expected = getComputedStyle(reference).color;
    reference.remove();
    return { token: item.querySelector("code").textContent, actual, expected };
  }));
  const dark = await readPalette();
  await mode(page, "浅色").click();
  await expect(root).toHaveCSS("color-scheme", "light");
  const light = await readPalette();
  expect(light).toHaveLength(8);
  expect(dark).toHaveLength(8);
  light.forEach(({ actual, expected }, index) => {
    expect(actual).toBe(expected);
    expect(dark[index].actual).toBe(dark[index].expected);
    expect(actual).not.toBe(dark[index].actual);
  });

  expect(light.find((color) => color.token === "--mt-accent-coral")?.actual).toBe("rgb(209, 99, 75)");
  expect(dark.find((color) => color.token === "--mt-accent-coral")?.actual).toBe("rgb(253, 140, 115)");

  const readStatus = (name) => page.getByText(name, { exact: true })
    .evaluate((label) => getComputedStyle(label.firstElementChild).backgroundColor);
  expect(await readStatus("局部覆盖")).toBe("rgb(82, 138, 114)");
  expect(await readStatus("绿色点缀")).toBe(light[2].actual);
  expect(await readStatus("默认绿色")).toBe(light[2].actual);

  await page.goto(base + "#/components/Tabs?section=indicator-color");
  const coral = page.getByRole("tablist", { name: "珊瑚色指示线" }).getByRole("tab", { selected: true });
  expect(await coral.evaluate((tab) => getComputedStyle(tab, "::after").backgroundColor)).toBe("rgb(209, 99, 75)");
  await mode(page, "深色").click();
  await expect(root).toHaveCSS("color-scheme", "dark");
  expect(await coral.evaluate((tab) => getComputedStyle(tab, "::after").backgroundColor)).toBe("rgb(253, 140, 115)");
  await page.getByRole("main").getByRole("link", { name: "颜色预设", exact: true }).click();
  await expect(page).toHaveURL(/#\/theme\/color-presets$/);
  console.log(`Docs theme browser checks passed (${engine})`);
} finally {
  await browser?.close();
  await server.close();
}

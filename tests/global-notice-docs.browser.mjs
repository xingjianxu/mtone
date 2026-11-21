import { chromium, expect } from "@playwright/test";
import { createServer } from "vite";

const server = await createServer({
  root: "apps/docs",
  server: { host: "127.0.0.1", port: 0 },
  logLevel: "error",
});
await server.listen();

let browser;
try {
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH,
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const base = server.resolvedUrls.local[0];

  await page.goto(new URL("#/components/GlobalNotice?section=usage", base).href);
  const standalone = page.getByRole("region", { name: "维护提醒", exact: true });
  await standalone.getByRole("button", { name: "关闭通知" }).click();
  await expect(standalone).toHaveCount(0);
  const show = page.getByRole("button", { name: "重新显示通知" });
  await expect(show).toBeFocused();
  await show.press("Enter");
  await expect(standalone).toBeVisible();

  await page.goto(new URL("#/components/AdminLayout?section=global-notice", base).href);
  const example = page.locator(".component-doc-section").filter({
    has: page.getByRole("heading", { name: "管理模式与退出重试", exact: true }),
  }).locator(".component-demo-stage");
  const notice = example.getByRole("region", { name: "管理员模式", exact: true });
  const status = example.getByRole("status");
  await expect(status).toHaveText("管理员身份（演示）");
  await example.getByRole("button", { name: "日志", exact: true }).click();
  await expect(example.getByRole("heading", { name: "日志", exact: true })).toBeVisible();
  const exit = notice.getByRole("button", { name: "退出管理模式", exact: true });
  await exit.click();
  await expect(exit).toBeDisabled();
  await exit.evaluate((button) => button.click());
  await expect(notice.getByRole("alert")).toHaveText("退出失败，请重试");
  await expect(status).toHaveText("管理员身份（演示）");
  const retry = notice.getByRole("button", { name: "重试退出管理模式", exact: true });
  await expect(retry).toBeFocused();
  await retry.press("Enter");
  await expect(status).toHaveText("普通用户身份（演示）");
  await expect(notice).toHaveCount(0);
  await expect(example.getByRole("heading", { name: "日志", exact: true })).toBeVisible();
  await expect(example.getByRole("button", { name: "管理模式设置" })).toBeFocused();

  console.log("GlobalNotice docs: standalone close and controlled admin failure/retry, mode and focus restoration");
} finally {
  await browser?.close();
  await server.close();
}

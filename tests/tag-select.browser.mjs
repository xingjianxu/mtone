import { chromium, firefox, webkit, expect } from "@playwright/test";
import { createServer } from "vite";

const server = await createServer({
  root: "apps/docs",
  server: { host: "127.0.0.1", port: 5196, strictPort: true },
  logLevel: "error",
});
await server.listen();
try {
  for (const engine of [chromium, firefox, webkit]) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage({
        viewport: { width: 390, height: 840 },
      });
      await page.goto(
        "http://127.0.0.1:5196/#/components/TagSelect?section=expandable",
      );
      const group = page.getByRole("group", { name: "项目主题" });
      const expand = group.getByRole("button", { name: "展开" });
      await expect(expand).toBeVisible();
      const tag = group.locator("button").filter({ hasText: "版本管理" });
      await expect(tag).toBeHidden();
      await expand.focus();
      await page.keyboard.press("Enter");
      await expect(tag).toBeVisible();
      await tag.focus();
      await page.keyboard.press("Space");
      await expect(tag).toHaveAttribute("aria-pressed", "true");
      await group.getByRole("button", { name: "收起" }).click();
      await expect(tag).toBeHidden();
      await expand.click();
      await expect(tag).toHaveAttribute("aria-pressed", "true");
      await expect(tag).toBeVisible();
      console.log("TagSelect verified:", engine.name());
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}

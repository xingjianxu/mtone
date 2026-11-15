import { createServer } from "vite";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const server = await createServer({ root: "apps/docs", server: { host: "127.0.0.1", port: 5189, strictPort: true }, logLevel: "error" });
await server.listen();
let browser;
try {
  browser = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const width of [1440, 768, 360]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("http://127.0.0.1:5189/#/showcase");
    await page.getByRole("heading", { name: "团队知识库", exact: true }).waitFor();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Page overflow at ${width}`);
    if (width < 760) {
      assert.equal(await page.locator(".showcase-sidebar").getAttribute("data-collapsed"), "true");
      assert.equal(await page.locator(".showcase-sidebar .mt-sidebar-toggle").isVisible(), false);
    }
    const cardsFit = await page.locator(".showcase-document").evaluateAll(nodes => nodes.every(node => node.scrollWidth <= node.clientWidth));
    assert(cardsFit, `Document cards must not clip controls at ${width}px`);
    await page.getByRole("textbox", { name: "搜索知识库" }).fill("no-match-123");
    assert.equal(await page.getByRole("button", { name: "编辑文档：设计原则" }).count(), 0);
    await page.getByRole("button", { name: "重置筛选" }).click();
    await page.getByRole("button", { name: "列表视图", exact: true }).click();
    await page.getByRole("button", { name: "编辑文档：设计原则" }).click();
    const dialog = page.getByRole("dialog", { name: "编辑文档" });
    await dialog.waitFor();
    const box = await dialog.boundingBox();
    assert(box.x >= 0 && box.x + box.width <= width, "Editor must fit viewport");
    await dialog.getByLabel(/文档标题/).fill("未保存的修改");
    await dialog.getByRole("button", { name: "取消", exact: true }).click();
    await page.getByRole("button", { name: "编辑文档：设计原则" }).waitFor();
    await page.getByRole("button", { name: "新建文档", exact: true }).click();
    await page.getByRole("dialog", { name: "新建文档" }).getByLabel(/文档标题/).fill("浏览器创建");
    await page.getByRole("button", { name: "保存文档", exact: true }).click();
    await page.getByRole("button", { name: "编辑文档：浏览器创建" }).waitFor();
    await page.getByRole("button", { name: "删除文档：浏览器创建" }).click();
    await page.getByRole("button", { name: "确认删除", exact: true }).click();
    assert.equal(await page.getByRole("button", { name: "编辑文档：浏览器创建" }).count(), 0);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Page overflow after actions at ${width}`);
    console.log(`Showcase ${width}px: navigation, filter, cancel, create, delete, containment passed`);
  }
  await page.getByRole("button", { name: "新建文档", exact: true }).click();
  await page.getByRole("dialog", { name: "新建文档" }).getByLabel(/文档标题/).fill("仅本页临时数据");
  await page.getByRole("button", { name: "保存文档", exact: true }).click();
  await page.getByRole("button", { name: "编辑文档：仅本页临时数据" }).waitFor();
  await page.goto("http://127.0.0.1:5189/#/components/Button");
  await page.getByRole("heading", { name: "Button", exact: true }).waitFor();
  await page.goto("http://127.0.0.1:5189/#/gallery");
  await page.getByRole("heading", { name: "为内容留出空间。", exact: true }).waitFor();
  await page.goto("http://127.0.0.1:5189/#/showcase");
  await page.getByRole("heading", { name: "团队知识库", exact: true }).waitFor();
  assert.equal(await page.getByRole("button", { name: "编辑文档：仅本页临时数据" }).count(), 0, "Leaving the example resets local demo state");
  assert.deepEqual(errors, []);
} finally { await browser?.close(); await server.close(); }

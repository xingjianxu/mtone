import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium, firefox, webkit } from "@playwright/test";
import { preview } from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));
const docs = fileURLToPath(new URL("../dist/docs/", import.meta.url));
// Targeted validation builds the exact docs once before running this fixture.
// For local runs: npm run build:docs && node tests/block-editor.browser.mjs.
const editorAssets = (
  await readdir(new URL("../dist/docs/assets/", import.meta.url))
).filter((name) => name.startsWith("block-editor-example-"));
assert(editorAssets.some((name) => name.endsWith(".js")));
assert(editorAssets.some((name) => name.endsWith(".css")));
const base = "http://127.0.0.1:5247/mtone/";
const server = await preview({
  root,
  configFile: false,
  base: "/mtone/",
  build: { outDir: docs },
  preview: { host: "127.0.0.1", port: 5247, strictPort: true },
  logLevel: "error",
});
let browser;
try {
  const engine = process.env.BROWSER || "chromium";
  browser = await { chromium, firefox, webkit }[engine].launch({
    headless: true,
    ...(engine === "chromium" && process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}),
  });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  const requested = [];
  page.on("request", (request) => requested.push(request.url()));
  const botLogs = [];
  page.on("pageerror", (error) => botLogs.push(error.message));
  await page.goto(base + "#/components/Button", { waitUntil: "networkidle" });
  assert(
    !requested.some((url) => editorAssets.some((name) => url.endsWith(name))),
    "ordinary docs never load editor assets",
  );
  await page.goto(base + "#/components/BlockEditor");
  const editor = page.getByRole("textbox", { name: "发布周记正文" });
  await editor.waitFor();
  const usageDemo = page.locator(".mt-block-editor").filter({ has: editor });
  assert.match(
    await page.locator(".component-import code").textContent(),
    /from "@bixlab\/mtone-blocknote"/,
  );
  for (const asset of editorAssets)
    assert(
      requested.some((url) => url.endsWith(asset)),
      asset,
    );
  await editor.press("Control+Home");
  await editor.press("Shift+End");
  await usageDemo.getByRole("button", { name: "粗体", exact: true }).click();
  assert.equal(await editor.locator("h1 strong").textContent(), "产品发布周记");
  await usageDemo.getByRole("button", { name: "链接", exact: true }).click();
  await page
    .getByRole("textbox", { name: "链接地址" })
    .fill("https://example.com");
  await page.getByRole("button", { name: "应用链接" }).click();
  assert.equal(
    await editor
      .getByRole("link", { name: "产品发布周记" })
      .getAttribute("href"),
    "https://example.com/",
  );
  assert.equal(
    await editor.locator("h1 strong").textContent(),
    "产品发布周记",
    "link preserves prior inline formatting",
  );
  await page.getByRole("button", { name: "保留当前草稿" }).click();
  await page.getByRole("switch", { name: "只读预览" }).click();
  assert.equal(await editor.getAttribute("contenteditable"), "false");
  assert.equal(
    await usageDemo.getByRole("button", { name: "粗体", exact: true }).count(),
    0,
  );
  await page.getByRole("button", { name: "打开草稿快照" }).click();
  const dialog = page.getByRole("dialog", { name: "草稿快照" });
  const draft = dialog.getByRole("textbox", { name: "草稿正文" });
  assert.equal(
    await draft.getByRole("link", { name: "产品发布周记" }).count(),
    1,
    "saved JSON remounts with the link",
  );
  await draft.press("Control+End");
  await draft.press("Enter");
  await draft.press("/");
  const suggestions = dialog.getByRole("listbox", { name: "插入块" });
  await suggestions.waitFor();
  const active = await draft.getAttribute("aria-activedescendant");
  assert(
    active && (await suggestions.locator(`[id="${active}"]`).count()) === 1,
    "active option references rendered DOM",
  );
  await draft.press("Escape");
  await suggestions.waitFor({ state: "hidden" });
  assert(await dialog.isVisible(), "Escape closes suggestions first");
  await draft.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  const formats = page.getByRole("textbox", { name: "格式示例正文" });
  const formatDemo = page.locator(".mt-block-editor").filter({ has: formats });
  await formats.waitFor();
  const table = formats.getByRole("table");
  await table.getByRole("cell", { name: "文档" }).click();
  await formatDemo.getByRole("button", { name: "添加行", exact: true }).click();
  assert.equal(await table.getByRole("row").count(), 3);
  await formatDemo.getByRole("button", { name: "添加列", exact: true }).click();
  assert.equal(await table.getByRole("row").first().locator("th").count(), 3);
  await formats.locator(".mt-block-editor-code-source code").click();
  await formatDemo
    .getByRole("button", { name: "高亮预览", exact: true })
    .click();
  const preview = formats.locator(
    ".mt-block-editor-code-preview .mt-typography-code-block",
  );
  assert.equal(
    await formatDemo
      .getByRole("button", { name: "高亮预览", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  assert.equal(
    await formats.locator(".mt-block-editor-code[data-preview]").count(),
    1,
    "the selected code node retains its preview state",
  );
  await preview.waitFor({ state: "visible", timeout: 8_000 });
  assert.match(await preview.textContent(), /const release/);
  await preview.locator(".mt-code-token").first().waitFor();
  await formatDemo
    .getByRole("button", { name: "高亮预览", exact: true })
    .click();
  await preview.waitFor({ state: "hidden" });
  const fold = formats.locator(".bn-toggle-button");
  assert.equal(await fold.getAttribute("aria-expanded"), "false");
  await fold.click();
  assert.equal(await fold.getAttribute("aria-expanded"), "true");
  await formats
    .getByText("文档与构建产物已经核对。")
    .waitFor({ state: "visible" });
  await formats
    .getByRole("img", { name: "草稿、审核、发布的流程图" })
    .waitFor();
  await formats.press("Control+Home");
  await formatDemo.getByRole("button", { name: "添加块", exact: true }).click();
  await page.getByRole("option", { name: "图片", exact: true }).click();
  await formatDemo
    .getByRole("textbox", { name: "图片地址" })
    .fill("javascript:alert(1)");
  await formatDemo.getByRole("button", { name: "应用图片" }).click();
  await formatDemo.getByRole("alert").getByText(/HTTP/).waitFor();
  await formatDemo.getByRole("button", { name: "取消", exact: true }).click();
  await page.getByRole("switch", { name: "仅阅读" }).click();
  await preview.waitFor({ state: "visible" });
  await formats
    .locator(".mt-block-editor-code-source")
    .waitFor({ state: "hidden" });
  assert.deepEqual(botLogs, []);
  console.log(`Passed BlockEditor targeted browser demo on ${engine}`);
} finally {
  await browser?.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}

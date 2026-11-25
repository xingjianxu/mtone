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
    /from "@bixlab\/mtone-blockeditor"/,
  );
  for (const asset of editorAssets)
    assert(
      requested.some((url) => url.endsWith(asset)),
      asset,
    );
  const formatting = usageDemo.locator(".mt-block-editor-toolbar");
  await editor.press("Control+Home");
  await formatting.waitFor({ state: "hidden", timeout: 3000 });
  const bodyBefore = await editor.boundingBox();
  await editor.press("Shift+ArrowRight");
  await formatting.waitFor({ state: "visible" });
  async function toolbarRow(expected) {
    const metrics = await formatting
      .getByRole("button")
      .evaluateAll((buttons) =>
        buttons.map((button) => {
          const rect = button.getBoundingClientRect();
          return {
            label: button.getAttribute("aria-label"),
            x: rect.x,
            y: rect.y,
            right: rect.right,
          };
        }),
      );
    assert.deepEqual(
      metrics.map(({ label }) => label),
      expected,
    );
    assert(
      metrics.every(({ y }) => Math.abs(y - metrics[0].y) < 1),
      "format buttons must stay on a single row",
    );
    assert(
      metrics.every(
        ({ x, right }, i) =>
          x >= 0 &&
          right <= page.viewportSize().width &&
          (i === 0 || x >= metrics[i - 1].right),
      ),
      "buttons remain inside the viewport and do not overlap",
    );
  }
  await toolbarRow([
    "粗体",
    "斜体",
    "下划线",
    "删除线",
    "行内代码",
    "链接",
    "更多格式",
  ]);
  await page.setViewportSize({ width: 360, height: 800 });
  await toolbarRow(["粗体", "斜体", "链接", "更多格式"]);
  await formatting.getByRole("button", { name: "更多格式" }).click();
  await usageDemo
    .getByRole("button", { name: "下划线", exact: true })
    .waitFor();
  await formatting.getByRole("button", { name: "更多格式" }).click();
  await page.setViewportSize({ width: 1280, height: 800 });
  await editor.press("Control+Home");
  await editor.press("Shift+End");
  await formatting.waitFor({ state: "visible" });
  const selection = await editor.evaluate((element) => {
    const range = element.ownerDocument.getSelection().getRangeAt(0);
    const { x, y, width, height } = range.getBoundingClientRect();
    return { x, y, width, height };
  });
  const toolbar = await formatting.boundingBox();
  const bodyAfter = await editor.boundingBox();
  assert(
    selection.width > 0 &&
      toolbar.x < selection.x + selection.width &&
      toolbar.x + toolbar.width > selection.x &&
      (Math.abs(toolbar.y + toolbar.height - selection.y) < 28 ||
        Math.abs(toolbar.y - (selection.y + selection.height)) < 28),
    "toolbar floats next to the selected text",
  );
  assert.equal(
    bodyAfter.y,
    bodyBefore.y,
    "selection does not shift editor content",
  );
  await formatting.getByRole("button", { name: "粗体", exact: true }).click();
  assert.equal(await editor.locator("h1 strong").textContent(), "产品发布周记");
  await formatting
    .getByRole("button", { name: "更多格式", exact: true })
    .click();
  await page.getByRole("button", { name: "文字色", exact: true }).click();
  await page.getByRole("button", { name: "蓝色", exact: true }).click();
  assert.equal(
    await editor
      .locator('h1 [data-style-type="textColor"][data-value="blue"]')
      .textContent(),
    "产品发布周记",
    "nested formatting menu preserves the selected range",
  );
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
  await editor.press("ArrowRight");
  await formatting.waitFor({ state: "hidden", timeout: 3000 });
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
  const tableTools = formatDemo.getByRole("group", { name: "表格操作" });
  await tableTools.waitFor({ state: "hidden", timeout: 3000 });
  assert.equal(
    await formatDemo.locator(".mt-block-editor-insert").count(),
    0,
    "no persistent insert footer",
  );
  await table.getByRole("cell", { name: "文档" }).click();
  const tableBox = await table.boundingBox();
  await tableTools.waitFor({ state: "visible" });
  const toolsBox = await tableTools.boundingBox();
  assert(
    toolsBox &&
      (Math.abs(toolsBox.y + toolsBox.height - tableBox.y) < 25 ||
        Math.abs(toolsBox.y - (tableBox.y + tableBox.height)) < 25),
    "table actions float next to the selected table",
  );
  await formatDemo.getByRole("button", { name: "添加行", exact: true }).click();
  assert.equal(await table.getByRole("row").count(), 3);
  await formatDemo.getByRole("button", { name: "添加列", exact: true }).click();
  assert.equal(await table.getByRole("row").first().locator("th").count(), 3);
  const codeSource = formats.locator(".mt-block-editor-code-source code");
  const keyword = codeSource.locator(".shiki").filter({ hasText: /^const$/ });
  await keyword.waitFor({ state: "visible", timeout: 5000 });
  assert.match(
    await codeSource.evaluate((code) => getComputedStyle(code).fontFamily),
    /monospace/,
    "editable source uses the same monospace family as the code preview",
  );
  const keywordColors = [];
  const sourceSurfaces = [];
  for (const colorScheme of ["light", "dark"]) {
    await page.emulateMedia({ colorScheme });
    const colors = await codeSource.evaluate((code) => {
      const pre = code.closest("pre");
      const frame = code.closest('[data-content-type="codeBlock"]');
      const luminance = (color) => {
        const channels = color
          .match(/\d+(?:\.\d+)?/g)
          .slice(0, 3)
          .map((value) => {
            const s = Number(value) / 255;
            return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
          });
        return (
          channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
        );
      };
      const text = getComputedStyle(code).color;
      const surface = getComputedStyle(pre).backgroundColor;
      const frameSurface = getComputedStyle(frame).backgroundColor;
      const levels = [luminance(text), luminance(surface)].sort(
        (a, b) => b - a,
      );
      return {
        text,
        surface,
        frameSurface,
        contrast: (levels[0] + 0.05) / (levels[1] + 0.05),
      };
    });
    assert(
      colors.contrast >= 4.5,
      `${colorScheme} editable code needs readable text: ${JSON.stringify(colors)}`,
    );
    assert.equal(
      colors.frameSurface,
      "rgba(0, 0, 0, 0)",
      `${colorScheme} editable code must not show BlockNote's outer dark bands`,
    );
    sourceSurfaces.push(colors.surface);
    const tokenColor = await keyword.evaluate(
      (token) => getComputedStyle(token).color,
    );
    assert.notEqual(
      tokenColor,
      colors.text,
      `${colorScheme} keywords have distinct syntax color`,
    );
    keywordColors.push(tokenColor);
  }
  assert.notEqual(...sourceSurfaces, "editable code follows the current theme");
  assert.notEqual(...keywordColors, "syntax color follows the current theme");
  await page.emulateMedia({ colorScheme: "light" });
  const previousCode = await codeSource.textContent();
  await codeSource.click();
  await page.keyboard.press("End");
  await page.keyboard.insertText(" // test edit");
  assert.match(await codeSource.textContent(), /test edit/);
  await page.keyboard.press("Control+z");
  assert.equal(await codeSource.textContent(), previousCode);
  await keyword.waitFor({ state: "visible" });
  const languageSelect = formatDemo.getByRole("combobox", { name: "代码语言" });
  await languageSelect.click();
  await page.getByRole("option", { name: "纯文本", exact: true }).click();
  await keyword.waitFor({ state: "hidden" });
  await codeSource.click();
  await languageSelect.click();
  await page.getByRole("option", { name: "JavaScript", exact: true }).click();
  await keyword.waitFor({ state: "visible" });
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
  const image = formats.getByRole("img", { name: "草稿、审核、发布的流程图" });
  await image.waitFor();
  await image.click();
  const editImage = formatDemo.getByRole("button", {
    name: "编辑图片",
    exact: true,
  });
  await editImage.waitFor({ state: "visible", timeout: 3000 });
  await editImage.click();
  await formatDemo.getByRole("textbox", { name: "图片说明" }).waitFor();
  await formatDemo.getByRole("button", { name: "取消", exact: true }).click();
  const heading = formats.getByRole("heading", { name: "提交前检查" });
  await heading.hover();
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

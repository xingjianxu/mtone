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
const port = Number(process.env.BLOCK_EDITOR_TEST_PORT || 5247);
const base = `http://127.0.0.1:${port}/mtone/`;
const server = await preview({
  root,
  configFile: false,
  base: "/mtone/",
  build: { outDir: docs },
  preview: { host: "127.0.0.1", port, strictPort: true },
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
  // Viewport resizing can move the document scroll position without moving the
  // editor within its demo. Measure layout relative to the demo frame instead.
  const bodyOffset = () => editor.evaluate((node) =>
    node.getBoundingClientRect().top -
    node.closest(".mt-block-editor").getBoundingClientRect().top
  );
  const bodyBefore = await bodyOffset();
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
    "块类型",
    "粗体",
    "斜体",
    "下划线",
    "删除线",
    "行内代码",
    "左对齐",
    "居中",
    "右对齐",
    "颜色",
    "增加缩进",
    "减少缩进",
    "链接",
    "更多格式",
  ]);
  const typeButton = formatting.getByRole("button", { name: "块类型" });
  assert.match(await typeButton.textContent(), /一级标题/);
  await typeButton.click();
  await usageDemo
    .getByRole("button", { name: "二级标题", exact: true })
    .click();
  await editor
    .getByRole("heading", { level: 2, name: "产品发布周记" })
    .waitFor();
  await editor.press("Control+Home");
  await editor.press("Shift+ArrowRight");
  await typeButton.click();
  await usageDemo
    .getByRole("button", { name: "一级标题", exact: true })
    .click();
  await editor
    .getByRole("heading", { level: 1, name: "产品发布周记" })
    .waitFor();
  await editor.press("Control+Home");
  await editor.press("Shift+ArrowRight");
  const center = formatting.getByRole("button", { name: "居中" });
  await center.click();
  assert.equal(await center.getAttribute("aria-pressed"), "true");
  await formatting.getByRole("button", { name: "左对齐" }).click();
  await formatting.getByRole("button", { name: "颜色", exact: true }).click();
  await usageDemo
    .getByRole("button", { name: "文字色", exact: true })
    .waitFor();
  await formatting.getByRole("button", { name: "颜色", exact: true }).click();
  await page.setViewportSize({ width: 360, height: 800 });
  // The ResizeObserver can commit its React update after setViewportSize resolves.
  await formatting
    .getByRole("button", { name: "下划线", exact: true })
    .waitFor({ state: "hidden" });
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
  const bodyAfter = await bodyOffset();
  assert(
    selection.width > 0 &&
      toolbar.x < selection.x + selection.width &&
      toolbar.x + toolbar.width > selection.x &&
      (Math.abs(toolbar.y + toolbar.height - selection.y) < 28 ||
        Math.abs(toolbar.y - (selection.y + selection.height)) < 28),
    "toolbar floats next to the selected text",
  );
  assert.equal(
    bodyAfter,
    bodyBefore,
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
  const linkAddress = page.getByRole("textbox", { name: "链接地址" });
  await linkAddress.fill("javascript:alert(1)");
  await page.getByRole("button", { name: "应用链接" }).click();
  await usageDemo.getByRole("alert").getByText(/https/).waitFor();
  await linkAddress.fill("https://example.com");
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
  await page.getByRole("switch", { name: "只读预览", exact: true }).click();
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
      (Math.abs(toolsBox.y + toolsBox.height - tableBox.y) < 36 ||
        Math.abs(toolsBox.y - (tableBox.y + tableBox.height)) < 36),
    "table actions float next to the selected table",
  );
  await formatDemo.getByRole("button", { name: "添加行", exact: true }).click();
  assert.equal(await table.getByRole("row").count(), 3);
  await formatDemo.getByRole("button", { name: "添加列", exact: true }).click();
  assert.equal(await table.getByRole("row").first().locator("th").count(), 3);
  await tableTools.getByRole("button", { name: "表头行", exact: true }).click();
  assert.equal(await table.getByRole("row").first().locator("th").count(), 0);
  await tableTools.getByRole("button", { name: "表头行", exact: true }).click();
  assert.equal(await table.getByRole("row").first().locator("th").count(), 3);
  await table.getByRole("cell", { name: "文档" }).hover();
  const columnHandle = formatDemo.getByRole("button", {
    name: "列操作",
    exact: true,
  });
  const rowHandle = formatDemo.getByRole("button", {
    name: "行操作",
    exact: true,
  });
  await columnHandle.waitFor({ state: "visible", timeout: 3000 });
  assert.equal(await columnHandle.getAttribute("draggable"), "true");
  assert.equal(await rowHandle.getAttribute("draggable"), "true");
  const columnBox = await columnHandle.boundingBox();
  const rowBox = await rowHandle.boundingBox();
  const gripTableBox = await table.boundingBox();
  assert(
    columnBox.y < gripTableBox.y && rowBox.x < gripTableBox.x,
    "column grip sits above the table and row grip sits to its left",
  );
  await columnHandle.click();
  await page.getByRole("menuitem", { name: "向左添加列" }).click();
  assert.equal(await table.getByRole("row").first().locator("th").count(), 4);
  await table.getByRole("cell", { name: "文档" }).hover();
  await rowHandle.click();
  await page.getByRole("menuitem", { name: "删除行", exact: true }).click();
  assert.equal(await table.getByRole("row").count(), 2);

  const bottomRight = table.getByRole("row").last().getByRole("cell").last();
  await bottomRight.hover();
  const appendRow = formatDemo.getByRole("button", {
    name: "在表格底部添加行",
  });
  const appendColumn = formatDemo.getByRole("button", {
    name: "在表格右侧添加列",
  });
  const currentTableBox = await table.boundingBox();
  const bottomStripBox = await appendRow.boundingBox();
  const rightStripBox = await appendColumn.boundingBox();
  assert(bottomStripBox && bottomStripBox.width >= currentTableBox.width - 2);
  assert(rightStripBox && rightStripBox.height >= currentTableBox.height - 2);
  await appendRow.click();
  assert.equal(await table.getByRole("row").count(), 3);
  await bottomRight.hover();
  await appendColumn.click();
  assert.equal(await table.getByRole("row").first().locator("th").count(), 5);

  const firstHeader = table.getByRole("columnheader", { name: "检查项" });
  await firstHeader.hover();
  const source = await columnHandle.boundingBox();
  const destination = await table
    .getByRole("row")
    .first()
    .getByRole("columnheader")
    .last()
    .boundingBox();
  await page.mouse.move(
    source.x + source.width / 2,
    source.y + source.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    destination.x + destination.width / 2,
    destination.y + destination.height / 2,
    { steps: 10 },
  );
  await page.mouse.move(
    destination.x + destination.width / 2 + 2,
    destination.y + destination.height / 2,
  );
  await page.mouse.up();
  assert.equal(
    await table
      .getByRole("row")
      .first()
      .getByRole("columnheader")
      .last()
      .innerText(),
    "检查项",
  );

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
  const imageFigure = image.locator("xpath=ancestor::figure[1]");
  assert.equal(await imageFigure.locator("figcaption").count(), 0);
  await image.hover();
  await page.getByRole("tooltip").filter({ hasText: "发布流程" }).waitFor();
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
  await formatDemo
    .getByRole("button", { name: "此块的操作", exact: true })
    .waitFor({ state: "visible" });
  assert.equal(
    await formatDemo
      .getByRole("button", { name: "添加块", exact: true })
      .count(),
    0,
    "hovering a block must not show a left-side add button",
  );
  await heading.click();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await page.keyboard.press("/");
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
  const media = page.getByRole("textbox", { name: "媒体块示例正文" });
  const mediaDemo = page.locator(".mt-block-editor").filter({ has: media });
  const video = media.locator("video");
  const audio = media.locator("audio");
  const sampleFile = media.getByRole("link", { name: "发布清单.txt" });
  await video.waitFor();
  assert.equal(await video.getAttribute("controls"), "");
  for (const url of [
    await video.getAttribute("src"),
    await audio.getAttribute("src"),
    await sampleFile.getAttribute("href"),
  ]) {
    assert(url?.startsWith(base + "block-editor-media/"));
    assert((await page.request.get(url)).ok());
  }
  const fileRow = await sampleFile.evaluate((node) => {
    const style = getComputedStyle(node);
    const block = node.closest(".bn-block-content");
    return {
      width: node.getBoundingClientRect().width,
      blockWidth: block.getBoundingClientRect().width,
      minHeight: style.minHeight,
      background: style.backgroundColor,
      display: style.display,
      name: node.querySelector("span")?.textContent,
    };
  });
  assert(
    Math.abs(fileRow.blockWidth - fileRow.width) <= 2,
    "attachment uses the available width",
  );
  assert.equal(fileRow.minHeight, "32px");
  assert.notEqual(fileRow.background, "rgba(0, 0, 0, 0)");
  assert.equal(fileRow.display, "flex");
  assert.equal(fileRow.name, "发布清单.txt");
  assert.equal(await media.locator("figcaption").count(), 0);
  const fileFigure = media.locator('figure[data-kind="file"]').first();
  await sampleFile.hover();
  await page.getByRole("tooltip").filter({ hasText: "文本附件" }).waitFor();
  await fileFigure.press("Enter");
  const selectedFile = media
    .locator(".ProseMirror-selectednode")
    .locator('figure[data-kind="file"]');
  await selectedFile.waitFor({ timeout: 3000 });
  const selectionRing = await selectedFile.evaluate((node) => {
    const style = getComputedStyle(node, "::after");
    const probe = document.createElement("span");
    probe.style.color = style.getPropertyValue("--mt-focus");
    document.body.append(probe);
    const token = getComputedStyle(probe).color;
    probe.remove();
    return {
      outline: style.outlineWidth,
      outlineStyle: style.outlineStyle,
      outlineColor: style.outlineColor,
      token,
      shadow: style.boxShadow,
    };
  });
  assert.equal(selectionRing.shadow, "none", "no thick BlockNote focus shadow");
  assert.equal(selectionRing.outline, "1px");
  assert.equal(selectionRing.outlineStyle, "solid");
  assert.equal(selectionRing.outlineColor, selectionRing.token);
  await sampleFile.focus();
  await sampleFile.press("Shift+Tab");
  await page.keyboard.press("Tab");
  assert(await sampleFile.evaluate((node) => node.matches(":focus-visible")));
  await page.getByRole("tooltip").filter({ hasText: "文本附件" }).waitFor();
  const linkRing = await sampleFile.evaluate((node) => {
    const style = getComputedStyle(node);
    return [style.outlineWidth, style.outlineStyle];
  });
  assert.deepEqual(
    linkRing,
    ["1px", "solid"],
    "the focused file link remains visible",
  );
  const videoFigure = media.locator('figure[data-kind="video"]').first();
  await videoFigure.hover();
  await page.getByRole("tooltip").filter({ hasText: "两秒测试画面" }).waitFor();
  await videoFigure.press("Enter");
  await mediaDemo.getByRole("button", { name: "编辑媒体" }).click();
  await mediaDemo.getByRole("spinbutton", { name: "视频宽度（%）" }).fill("50");
  await mediaDemo.getByRole("button", { name: "应用视频" }).click();
  assert.equal(
    await video.evaluate((node) => node.closest("figure").style.width),
    "50%",
  );

  await media.getByText("在此输入 / 插入更多内容。", { exact: true }).click();
  await media.press("End");
  await media.press("Enter");
  await media.press("/");
  await page.getByRole("option", { name: "附件", exact: true }).click();
  const fileURL = mediaDemo.getByRole("textbox", { name: "附件地址" });
  await fileURL.fill("data:text/html,invalid");
  await fileURL.press("Enter");
  await mediaDemo.getByRole("alert").getByText(/HTTP/).waitFor();
  await fileURL.fill(base + "block-editor-media/release-notes.txt");
  await mediaDemo.getByRole("textbox", { name: "附件名称" }).fill("新增附件");
  await mediaDemo.getByRole("button", { name: "应用附件" }).click();
  const insertedFile = media.getByRole("link", { name: "新增附件" });
  await insertedFile.waitFor();
  await page.getByRole("switch", { name: "媒体只读预览" }).click();
  assert.equal(await media.getAttribute("contenteditable"), "false");
  await insertedFile.waitFor();
  assert.equal(
    await mediaDemo.getByRole("button", { name: "编辑媒体" }).count(),
    0,
  );
  await media.locator('figure[data-kind="audio"]').first().hover();
  await page.getByRole("tooltip").filter({ hasText: "发布提示音" }).waitFor();
  const play = media.getByRole("button", { name: "播放音频", exact: true });
  await play.waitFor({ timeout: 3000 });
  assert.equal(await audio.getAttribute("controls"), null);
  const seek = media.getByRole("slider", { name: "播放进度", exact: true });
  await seek.waitFor();
  await media.getByRole("button", { name: "播放倍速", exact: true }).click();
  await page.getByRole("button", { name: "0.5×", exact: true }).click();
  assert.equal(await audio.evaluate((el) => el.playbackRate), 0.5);
  await page.keyboard.press("Escape");
  await seek.press("End");
  assert(await audio.evaluate((el) => el.currentTime > el.duration * 0.9));
  await seek.press("Home");
  const timeline = await seek.boundingBox();
  assert(timeline && timeline.width > 100);
  await page.mouse.move(timeline.x + 6, timeline.y + timeline.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    timeline.x + timeline.width / 2,
    timeline.y + timeline.height / 2,
    { steps: 8 },
  );
  await page.mouse.up();
  assert(
    await audio.evaluate(
      (el) =>
        el.currentTime > el.duration * 0.35 &&
        el.currentTime < el.duration * 0.65,
    ),
  );
  await seek.press("Home");
  await play.click();
  const pause = media.getByRole("button", { name: "暂停音频", exact: true });
  await pause.waitFor();
  await pause.click();
  assert(await audio.evaluate((el) => el.paused));
  const player = media.locator(".mt-block-editor-audio");
  await player.evaluate((el) => {
    el.style.inlineSize = "300px";
  });
  await media.getByRole("button", { name: "更多音频选项" }).click();
  await page.getByRole("button", { name: "静音", exact: true }).click();
  assert(await audio.evaluate((el) => el.muted));
  const volume = page.getByRole("slider", { name: "音量", exact: true });
  await volume.and(page.locator('[aria-valuetext="0%"]')).waitFor();
  await volume.press("End");
  assert.deepEqual(await audio.evaluate((el) => [el.volume, el.muted]), [
    1,
    false,
  ]);
  await page.keyboard.press("Escape");
  await player.evaluate((el) => {
    el.style.inlineSize = "";
  });
  assert.deepEqual(botLogs, []);
  console.log(`Passed BlockEditor targeted browser demo on ${engine}`);
} finally {
  await browser?.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}

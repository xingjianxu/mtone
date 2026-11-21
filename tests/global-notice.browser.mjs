import assert from "node:assert/strict";
import { chromium, expect, firefox, webkit } from "@playwright/test";
import { createServer } from "vite";

const name = process.env.BROWSER ?? "chromium";
const engine = { chromium, firefox, webkit }[name];
assert(engine, "A supported Playwright browser is required");
const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 0 },
  logLevel: "error",
});
await server.listen();
const fixture = server.resolvedUrls.local[0] + "tests/fixtures/global-notice.html";
let browser;
try {
  browser = await engine.launch({
    headless: true,
    executablePath: name === "chromium" ? process.env.CHROMIUM_PATH : undefined,
  });

  const controls = await browser.newPage({ viewport: { width: 390, height: 720 } });
  const errors = [];
  controls.on("pageerror", (error) => errors.push(error.message));
  await controls.goto(fixture + "?standalone");
  const actionNotice = controls.getByTestId("action-notice");
  const action = actionNotice.getByRole("button", { name: "Review account" });
  await expect(controls.getByRole("region", { name: "Account verification" })).toHaveAttribute("data-testid", "action-notice");
  await expect(actionNotice).toContainText("Review the account details before continuing.");
  await controls.getByRole("button", { name: "Focus action" }).click();
  await expect(action).toBeFocused();
  await action.press("Enter");
  await expect(controls.getByTestId("action-count")).toHaveText("1");
  const toggle = controls.getByRole("button", { name: "Toggle loading" });
  await toggle.click();
  await expect(action).toBeDisabled();
  // A real native button click cannot invoke the callback while loading.
  await action.evaluate((button) => button.click());
  await expect(controls.getByTestId("action-count")).toHaveText("1");
  await toggle.click();
  await expect(action).toBeEnabled();

  const errorNotice = controls.getByTestId("error-notice");
  await expect(errorNotice.getByRole("alert")).toHaveText("The change was not saved.");
  await expect(errorNotice.getByRole("button")).toHaveCount(0);
  const dismiss = controls.getByTestId("dismiss-notice");
  await dismiss.getByRole("button", { name: /close|dismiss/i }).click();
  await expect(dismiss).toHaveCount(0);
  await controls.goto(fixture + "?standalone&locale=zh");
  await expect(controls.getByTestId("dismiss-notice").getByRole("button", { name: /关闭|取消/i })).toBeVisible();
  assert.deepEqual(errors, []);
  await controls.close();

  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 630 }, colorScheme: "light" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(fixture + "?theme=system");
    const shell = page.getByTestId("shell");
    const notice = page.getByTestId("workspace-notice");
    const content = page.getByTestId("workspace-content");
    const header = page.getByTestId("workspace-header");
    const sider = page.getByLabel("Workspace navigation", { exact: true });
    const action = notice.getByRole("button", { name: "Review workspace" });
    await expect(notice).toBeVisible();
    await expect(content.getByRole("heading", { name: "Overview content" })).toBeVisible();

    const positions = async () => ({
      shell: await shell.boundingBox(),
      notice: await notice.boundingBox(),
      content: await content.boundingBox(),
      header: await header.boundingBox(),
      sider: await sider.boundingBox(),
      action: await action.boundingBox(),
    });
    const original = await positions();
    assert(Math.abs(original.notice.x - original.shell.x) <= 1);
    assert(Math.abs(original.notice.width - original.shell.width) <= 1);
    assert(original.notice.y + original.notice.height <= original.header.y + 1);
    assert(original.notice.y + original.notice.height <= original.sider.y + 1);
    assert(original.action.x >= original.notice.x && original.action.x + original.action.width <= original.notice.x + original.notice.width + 1);
    assert(original.action.y + original.action.height <= original.notice.y + original.notice.height + 1);
    assert(await notice.evaluate((node) => node.scrollWidth <= node.clientWidth + 1));
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

    await content.evaluate((node) => { node.scrollTop = 380; });
    assert(await content.evaluate((node) => node.scrollTop >= 300));
    const afterScroll = await positions();
    assert.deepEqual(afterScroll.notice, original.notice);
    assert.deepEqual(afterScroll.header, original.header);
    assert.deepEqual(afterScroll.sider, original.sider);

    const noticeNode = await notice.elementHandle();
    await page.getByRole("button", { name: "Activity", exact: true }).click();
    await expect(content.getByRole("heading", { name: "Activity content" })).toBeAttached();
    assert(await notice.evaluate((node, previous) => node === previous, noticeNode));
    await action.click();
    await expect(page.getByTestId("workspace-action-count")).toHaveText("1");
    await expect(notice).toBeVisible();

    const paint = () => notice.evaluate((node) => {
      const style = getComputedStyle(node);
      return [style.color, style.backgroundColor];
    });
    const light = await paint();
    await page.emulateMedia({ colorScheme: "dark" });
    await expect.poll(paint).not.toEqual(light);
    const systemDark = await paint();
    await page.goto(fixture + "?theme=dark");
    await expect.poll(paint).toEqual(systemDark);
    await page.goto(fixture + "?theme=light");
    await expect.poll(paint).toEqual(light);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(`${name}: GlobalNotice accessible actions, themes, narrow shell placement, navigation and scrolling passed`);
} finally {
  await browser?.close();
  await server.close();
}

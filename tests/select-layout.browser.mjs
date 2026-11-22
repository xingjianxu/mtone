import { createServer } from "vite";
import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
const server = await createServer({
  root: process.cwd(),
  server: { port: 5187, host: "127.0.0.1", strictPort: true },
  logLevel: "error",
});
await server.listen();
let browser;
try {
  browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}),
    headless: true,
  });
  const page = await browser.newPage({
    viewport: { width: 900, height: 1000 },
  });
  page.on("pageerror", (error) => console.error(error));
  page.on("console", (message) => {
    if (message.type() === "error") console.error(message.text());
  });
  const response = await page.goto(
    "http://127.0.0.1:5187/tests/fixtures/select-layout.html",
  );
  assert.equal(response.status(), 200, "Fixture must be served successfully");
  await page.locator(".mt-select").first().waitFor();
  const check = async () => {
    const results = await page.locator(".mt-select").evaluateAll((nodes) =>
      nodes.map((node) => {
        const icon = node.querySelector(".mt-select-icon");
        const b = node.getBoundingClientRect();
        const i = icon.getBoundingClientRect();
        const svg = icon.querySelector("svg").getBoundingClientRect();
        return {
          label: node.getAttribute("aria-label"),
          width: i.width,
          height: i.height,
          svgWidth: svg.width,
          svgHeight: svg.height,
          contained: i.left >= b.left && i.right <= b.right,
          centerDelta: Math.abs((i.top + i.bottom - b.top - b.bottom) / 2),
        };
      }),
    );
    console.log(JSON.stringify(results));
    assert.equal(
      results.length,
      14,
      "Expected both themes and all width/state cases",
    );
    for (const r of results) {
      assert.equal(r.width, 16, `${r.label} icon width`);
      assert.equal(r.height, 16, `${r.label} icon height`);
      assert.equal(r.svgWidth, 16, `${r.label} SVG width`);
      assert.equal(r.svgHeight, 16, `${r.label} SVG height`);
      assert(r.contained, `${r.label} icon outside trigger`);
      assert(r.centerDelta < 1, `${r.label} not centered`);
    }
  };
  await check();
  assert(
    await page
      .getByRole("combobox", { name: "light-100", exact: true })
      .locator(".mt-select-value")
      .evaluate((el) => el.scrollWidth > el.clientWidth),
    "Long value should truncate within narrow trigger",
  );
  await page
    .getByRole("combobox", { name: "light-160", exact: true })
    .click();
  await page.getByRole("listbox").waitFor();
  const checkSelection = async () => {
    // Base UI may retain an aria-hidden exiting popup during its lifecycle.
    // Selection uniqueness applies to the active accessible listbox, not all DOM portals.
    const activeListbox = page.getByRole("listbox");
    assert.equal(await activeListbox.count(), 1, "Exactly one active listbox");
    const selected = activeListbox.getByRole("option", { selected: true });
    assert.equal(
      await selected.count(),
      1,
      "Exactly one option must be selected",
    );
    assert.equal(await activeListbox.locator(".mt-select-item-indicator").count(), 1);
    const result = await selected.evaluate((option) => {
      const marker = option.querySelector(".mt-select-item-indicator");
      const svg = marker.querySelector("svg");
      const row = option.getBoundingClientRect();
      const box = marker.getBoundingClientRect();
      const vector = svg.getBoundingClientRect();
      return {
        width: box.width,
        height: box.height,
        svgWidth: vector.width,
        svgHeight: vector.height,
        centered:
          Math.abs((box.top + box.bottom - row.top - row.bottom) / 2) < 1,
        contained: box.left >= row.left && box.right <= row.right,
        hidden: marker.getAttribute("aria-hidden"),
        stroke: svg.getAttribute("stroke-width"),
        checkShape: svg.classList.contains("lucide-check"),
      };
    });
    assert.deepEqual(result, {
      width: 16,
      height: 16,
      svgWidth: 16,
      svgHeight: 16,
      centered: true,
      contained: true,
      hidden: "true",
      stroke: "1.5",
      checkShape: true,
    });
    console.log("Selected item marker:", result);
  };
  await checkSelection();
  await check();
  await page.getByRole("option", { name: "Short", exact: true }).click();
  assert.equal(
    await page
      .getByRole("combobox", { name: "light-160", exact: true })
      .innerText(),
    "Short",
  );
  await check();
  await page
    .getByRole("combobox", { name: "light-160", exact: true })
    .click();
  await page.getByRole("listbox").waitFor();
  await checkSelection();
  await page.keyboard.press("Escape");
  await page.getByRole("listbox").waitFor({state:"hidden"});
  await page.getByRole("combobox", {name:"dark-160", exact:true}).click();
  await page.getByRole("listbox").waitFor();
  await checkSelection();
  await page.keyboard.press("Escape");
  await page.getByRole("listbox").waitFor({state:"hidden"});
  assert.equal(
    await page
      .getByRole("combobox", { name: "light-disabled", exact: true })
      .isDisabled(),
    true,
  );
  for (const theme of ["light", "dark"]) {
    const field = page.locator(`.multi-${theme}`);
    const trigger = field.getByRole("button", { name: "展开选项" });
    const arrow = await trigger.evaluate(el => {
      const b=el.getBoundingClientRect(), svg=el.querySelector("svg"), s=svg.getBoundingClientRect();
      return {w:s.width,h:s.height,delta:Math.abs((s.top+s.bottom-b.top-b.bottom)/2),hidden:svg.getAttribute("aria-hidden"),kind:svg.classList.contains("lucide-chevron-down")};
    });
    assert.deepEqual(arrow, {w:16,h:16,delta:0,hidden:"true",kind:true});
    await trigger.click();
    const list = page.getByRole("listbox").filter({visible:true});
    await list.waitFor();
    const alpha = list.getByRole("option", {name:"Alpha",exact:true});
    const marker = await alpha.locator(".mt-select-item-indicator").evaluate(el => {
      const svg=el.querySelector("svg"), r=svg.getBoundingClientRect();
      return {w:r.width,h:r.height,stroke:svg.getAttribute("stroke-width"),hidden:el.getAttribute("aria-hidden"),kind:svg.classList.contains("lucide-check")};
    });
    assert.deepEqual(marker,{w:16,h:16,stroke:"1.5",hidden:"true",kind:true});
    assert.equal(await list.getByRole("option",{name:"Beta",exact:true}).locator(".mt-select-item-indicator").count(),0);
    await list.getByRole("option",{name:"Beta",exact:true}).click();
    await field.getByRole("button",{name:"移除 Beta",exact:true}).waitFor();
    await page.keyboard.press("Escape");
    await field.getByRole("button",{name:"移除 Beta",exact:true}).click();
    assert.equal(await field.getByRole("button",{name:"移除 Beta",exact:true}).count(),0);
    for (const type of ["check","mixed"]) {
      const control = field.getByRole("checkbox",{name:`${theme}-${type}`});
      const geometry = await control.evaluate(el => {
        const b=el.getBoundingClientRect(), svg=el.querySelector("svg"), s=svg.getBoundingClientRect();
        return {w:s.width,h:s.height,delta:Math.abs((s.top+s.bottom-b.top-b.bottom)/2),stroke:svg.getAttribute("stroke-width")};
      });
      assert.deepEqual(geometry,{w:12,h:12,delta:0,stroke:"1.5"});
    }
    assert(await page.getByRole("combobox",{name:`${theme}-multi-disabled`}).isDisabled());
  }
  for (const theme of ["light", "dark"]) {
    const field = page.locator(`.date-${theme}`);
    const input = field.getByLabel(`${theme}-date`, {exact:true});
    await input.scrollIntoViewIfNeeded();
    assert.equal(await field.locator(".mt-date-icon, .mt-date-field svg").count(), 0);
    const box = await input.boundingBox();
    await page.mouse.click(box.x + box.width - 16, box.y + box.height / 2);
    await page.keyboard.press("Escape");
    await input.fill("2026-07-01");
    assert.equal(await input.inputValue(),"2026-07-01");
    await field.getByRole("button",{name:"清除日期",exact:true}).click();
    assert.equal(await input.inputValue(),"");
    assert.equal(await input.getAttribute("type"),"date");
    assert.equal(await input.getAttribute("min"),"2026-01-01");
    assert(await page.getByLabel(`${theme}-date-disabled`,{exact:true}).isDisabled());
  }
  // The unified form fixture has a different route; run it after legacy geometry checks.
  await page.setViewportSize({ width: 390, height: 550 });
  await page.goto("http://127.0.0.1:5187/tests/fixtures/select-layout.html?unified");
  const form = page.getByRole("form", { name: "Select example" });
  const field = form.getByRole("combobox", { name: "Project", exact: true });
  const selectionValue = (name) => form.evaluate((node, name) => new FormData(node).getAll(name), name);
  const options = page.getByRole("listbox", { name: "Project", exact: true });
  const scroller = page.locator(".mt-select-inline-popup");
  const outsideSelect = form.getByRole("button", { name: "Outside select", includeHidden: true });
  const inlineSurface = form.locator(".mt-select-inline-search");
  // Reproduce the docs/consumer focus rule overriding an unqualified input class.
  await page.addStyleTag({ content: "input:focus-visible { outline: 1px solid rgb(147, 180, 220); outline-offset: 4px; }" });
  const idleFocusStyles = await inlineSurface.evaluate((node) => {
    const style = getComputedStyle(node);
    return { border: style.borderInlineStart, background: style.backgroundColor };
  });
  await form.evaluate((node) => node.addEventListener("submit", (event) => {
    event.preventDefault();
    node.dataset.submitted = "true";
  }));
  await expect(field).toHaveValue("Repository 0");
  await expect(field).toHaveAttribute("placeholder", "Choose project");
  await field.press("Enter");
  await expect(options).toBeVisible();
  await expect(field).toBeFocused();
  await expect(field).toHaveValue("");
  await expect(field).toHaveAttribute("placeholder", "Search projects");
  await expect(inlineSurface).toHaveCSS("border-inline-start", idleFocusStyles.border);
  await expect(inlineSurface).toHaveCSS("outline-style", "none");
  await expect(inlineSurface).not.toHaveCSS("background-color", idleFocusStyles.background);
  await expect(field).toHaveCSS("border-inline-start-width", "0px");
  await expect(field).toHaveCSS("outline-style", "none");
  await expect(scroller.locator("input")).toHaveCount(0);
  assert(await scroller.evaluate((node) => node.scrollHeight > node.clientHeight));
  const inputBox = await field.boundingBox(), panelBox = await scroller.boundingBox();
  assert(panelBox.x >= -1 && panelBox.x + panelBox.width <= 391);
  assert(inputBox.y + inputBox.height <= panelBox.y + 1 || panelBox.y + panelBox.height <= inputBox.y + 1,
    "The inline field must not overlap or live inside the options panel");

  await field.fill("missing");
  await expect(scroller.getByRole("status")).toHaveText("No results");
  assert.deepEqual(await selectionValue("project"), ["repo-0"]);
  await field.press("Enter");
  await expect(options).toBeHidden();
  await expect(field).toHaveValue("Repository 0");
  assert.equal(await form.getAttribute("data-submitted"), null);

  await field.click();
  await field.fill("Repository 2");
  await page.keyboard.press("Escape");
  await expect(options).toBeHidden();
  await expect(field).toBeFocused();
  await expect(field).toHaveValue("Repository 0");
  await field.pressSequentially("Repository 3");
  await expect(options.getByRole("option", { name: "Repository 3", exact: true })).toBeVisible();
  await outsideSelect.click();
  await expect(options).toBeHidden();
  await expect(field).toHaveValue("Repository 0");
  assert.deepEqual(await selectionValue("project"), ["repo-0"]);

  await field.press("ArrowDown");
  await expect(options).toBeVisible();
  await field.fill("fallback");
  await expect(options.getByRole("option", { name: "Default project" })).toBeVisible();
  await field.press("Enter");
  await expect(options).toBeHidden();
  await expect(field).toBeFocused();
  const richLabel = form.locator(".mt-select-rich-label");
  await expect(richLabel).toHaveText("Default project");
  await expect(richLabel).toHaveCSS("text-decoration-line", "underline");
  assert.deepEqual(await selectionValue("project"), [""]);
  assert(await form.evaluate((node) => node.checkValidity()));
  assert.equal(await form.getAttribute("data-submitted"), null);
  await field.hover();
  await form.getByRole("button", { name: "Clear selection" }).first().click();
  assert.equal(await form.evaluate((node) => node.checkValidity()), false);

  const multiselect = form.getByRole("combobox", { name: "Projects", exact: true });
  await multiselect.press("Backspace");
  assert.deepEqual(await selectionValue("projects"), ["", "locked"]);
  await multiselect.press("Escape");
  await multiselect.hover();
  await form.getByRole("button", { name: "Clear selection" }).click();
  assert.deepEqual(await selectionValue("projects"), ["locked"]);
  await form.getByRole("button", { name: "Reset selection" }).click();
  await expect(field).toHaveValue("Repository 0");
  assert.deepEqual(await selectionValue("projects"), ["", "locked"]);
  const slotURL = "http://127.0.0.1:5187/tests/fixtures/select-layout.html?clearSlot";
  const slotParts = (host, id) => {
    const wrapper = host.getByTestId(id);
    return {
      wrapper,
      field: wrapper.getByRole("combobox"),
      surface: wrapper.locator(".mt-select, .mt-multiselect"),
      arrow: wrapper.locator(".mt-select-icon, .mt-combobox-trigger > svg"),
      clear: wrapper.getByRole("button", { name: "Clear selection", exact: true }),
    };
  };
  const center = ({ x, y, width, height }) => [x + width / 2, y + height / 2];
  const sameCenter = async (arrow, clear) => {
    const [x, y] = center(await arrow.boundingBox());
    const [clearX, clearY] = center(await clear.locator("svg").boundingBox());
    assert(Math.abs(x - clearX) < 1 && Math.abs(y - clearY) < 1,
      `Clear and chevron use one center: (${x}, ${y}) vs (${clearX}, ${clearY})`);
  };
  await page.goto(slotURL);
  // Measure the entire reserved area, not just whether the two glyphs overlap.
  const compactSearch = slotParts(page, "searchable");
  await compactSearch.surface.evaluate((node) => {
    node.style.width = "104px";
    node.style.minWidth = "0";
  });
  await expect(compactSearch.surface).toHaveCSS("width", "104px");
  for (const direction of ["ltr", "rtl"]) {
    await compactSearch.wrapper.evaluate((node, dir) => { node.dir = dir; }, direction);
    await page.mouse.move(0, 0);
    await expect(compactSearch.arrow).toHaveCSS("opacity", "1");
    const metrics = () => compactSearch.surface.evaluate((node) => {
      const bounds = node.getBoundingClientRect();
      const value = node.querySelector(".mt-select-inline-value").getBoundingClientRect();
      const style = getComputedStyle(node);
      const rtl = style.direction === "rtl";
      return [
        rtl ? (bounds.left + parseFloat(style.borderLeftWidth) + value.left) / 2
          : (value.right + bounds.right - parseFloat(style.borderRightWidth)) / 2,
        (bounds.top + bounds.bottom) / 2,
      ];
    });
    const assertCentered = async (glyph) => {
      const [x, y] = center(await glyph.boundingBox());
      const [midX, midY] = await metrics();
      assert(Math.abs(x - midX) < 0.5 && Math.abs(y - midY) < 0.5,
        `${direction}: glyph center (${x}, ${y}) must match the full action strip center (${midX}, ${midY})`);
    };
    await assertCentered(compactSearch.arrow.locator("svg"));
    await compactSearch.field.click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(compactSearch.clear).toHaveCSS("opacity", "1");
    await assertCentered(compactSearch.clear.locator("svg"));
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);
  }
  await compactSearch.wrapper.evaluate((node) => { node.removeAttribute("dir"); });
  await compactSearch.surface.evaluate((node) => {
    node.style.removeProperty("width");
    node.style.removeProperty("min-width");
  });
  for (const id of ["plain", "searchable", "multiple"]) {
    const { wrapper, field, surface, arrow, clear } = slotParts(page, id);
    await page.mouse.move(0, 0);
    await expect(arrow).toHaveCSS("opacity", "1");
    await expect(clear).toHaveCSS("opacity", "0");
    await expect(clear).toHaveCSS("pointer-events", "none");
    await sameCenter(arrow, clear);
    const initial = await arrow.boundingBox();
    const initialSurface = await surface.boundingBox();

    if (id === "multiple") {
      // The hover action covers the arrow, but the editable field still opens.
      await field.click();
      await expect(page.getByRole("listbox")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("listbox")).toHaveCount(0);
    }
    await field.hover();
    await expect(arrow).toHaveCSS("opacity", "0");
    await expect(clear).toHaveCSS("opacity", "1");
    await expect(clear).toHaveCSS("pointer-events", "auto");
    await sameCenter(arrow, clear);
    const hovered = await arrow.boundingBox();
    assert(Math.abs(hovered.x - initial.x) < 1 && Math.abs(hovered.y - initial.y) < 1,
      `${id}: replacing the chevron with × does not move the slot`);
    assert.deepEqual(await surface.boundingBox(), initialSurface, `${id}: hover does not resize the control`);
    await clear.click();
    await expect(clear).toHaveCount(0);
    await expect(field).toBeFocused();
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect(arrow).toHaveCSS("opacity", "1");
    const after = await arrow.boundingBox();
    if (id === "multiple") {
      // Removing a chip can unwrap the flex rows. The resulting one-line
      // control still has its chevron right-aligned and vertically centered.
      const afterSurface = await surface.boundingBox();
      const [x, y] = center(after);
      assert(Math.abs(afterSurface.x + afterSurface.width - x - 17) < 1 &&
        Math.abs(y - center(afterSurface)[1]) < 1,
        `multiple: the reflowed chevron stays trailing and centered: (${x}, ${y}) in ${JSON.stringify(afterSurface)}`);
      await expect(wrapper.getByText("Locked", { exact: true })).toBeVisible();
    } else {
      assert(Math.abs(after.x - initial.x) < 1 && Math.abs(after.y - initial.y) < 1,
        `${id}: clearing does not move the chevron slot`);
    }
  }
  for (const id of ["empty", "disabled", "non-clearable", "locked"]) {
    const { wrapper, arrow, clear } = slotParts(page, id);
    await wrapper.hover();
    await expect(arrow).toHaveCSS("opacity", "1");
    await expect(clear).toHaveCount(0);
  }
  await page.reload();
  const keyboard = slotParts(page, "plain");
  await page.mouse.move(0, 0);
  await keyboard.field.focus();
  await page.keyboard.press("Tab");
  await expect(keyboard.clear).toBeFocused();
  await expect(keyboard.clear).toHaveCSS("opacity", "1");
  await expect(keyboard.arrow).toHaveCSS("opacity", "0");
  await page.keyboard.press("Enter");
  await expect(keyboard.field).toBeFocused();
  await expect(page.getByRole("listbox")).toHaveCount(0);

  const touch = await browser.newPage({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 550 } });
  try {
    await touch.goto(slotURL);
    const target = slotParts(touch, "plain");
    await expect(target.clear).toHaveCSS("opacity", "1");
    await expect(target.arrow).toHaveCSS("opacity", "0");
    await target.clear.tap();
    await expect(target.clear).toHaveCount(0);
    await expect(target.arrow).toHaveCSS("opacity", "1");
    await target.field.tap();
    await expect(touch.getByRole("listbox")).toBeVisible();
  } finally {
    await touch.close();
  }
  await page.goto("http://127.0.0.1:5187/tests/fixtures/select-layout.html?tags");
  const tagsForm = page.getByRole("form", { name: "Tags example" });
  const tags = tagsForm.getByRole("combobox", { name: "Topics" });
  const tagsValues = () => tagsForm.evaluate((node) => new FormData(node).getAll("topic"));
  const create = (name) => page.getByRole("option", { name: `Create “${name}”` });

  await tags.click();
  await tags.fill("  plan, notes  ");
  await expect(create("plan, notes")).toBeVisible();
  await tags.press("Enter");
  await expect(tags).toHaveValue("");
  await expect(tags).toBeFocused();
  assert.deepEqual(await tagsValues(), ["plan, notes"]);

  await tags.fill("Repository 1");
  await expect(create("Repository 1")).toHaveCount(0);
  await page.getByRole("option", { name: "Repository 1", exact: true }).click();
  await tags.fill("quick idea");
  await create("quick idea").click();
  assert.deepEqual(await tagsValues(), ["plan, notes", "repo-1", "quick idea"]);
  await tags.fill("Locked repository");
  await expect(page.getByRole("option", { name: "Locked repository" })).toHaveAttribute("aria-disabled", "true");
  await tags.press("Enter");
  await tags.fill("not committed");
  await tagsForm.getByRole("button", { name: "Outside tags", includeHidden: true }).click();
  assert.deepEqual(await tagsValues(), ["plan, notes", "repo-1", "quick idea"]);
  await tagsForm.getByRole("button", { name: "Reset tags" }).click();
  assert.deepEqual(await tagsValues(), []);

  console.log("Select geometry, shared clear slot, keyboard, touch, tags and unified form checks passed");
} finally {
  await browser?.close();
  await server.close();
}

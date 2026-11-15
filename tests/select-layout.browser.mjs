import { createServer } from "vite";
import { chromium } from "@playwright/test";
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
      "Expected both densities and all width/state cases",
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
      .getByRole("combobox", { name: "compact-100", exact: true })
      .locator(".mt-select-value")
      .evaluate((el) => el.scrollWidth > el.clientWidth),
    "Long value should truncate within narrow trigger",
  );
  await page
    .getByRole("combobox", { name: "compact-160", exact: true })
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
      .getByRole("combobox", { name: "compact-160", exact: true })
      .innerText(),
    "Short",
  );
  await check();
  await page
    .getByRole("combobox", { name: "compact-160", exact: true })
    .click();
  await page.getByRole("listbox").waitFor();
  await checkSelection();
  await page.keyboard.press("Escape");
  await page.getByRole("listbox").waitFor({state:"hidden"});
  await page.getByRole("combobox", {name:"comfortable-160", exact:true}).click();
  await page.getByRole("listbox").waitFor();
  await checkSelection();
  await page.keyboard.press("Escape");
  await page.getByRole("listbox").waitFor({state:"hidden"});
  assert.equal(
    await page
      .getByRole("combobox", { name: "compact-disabled", exact: true })
      .isDisabled(),
    true,
  );
  for (const density of ["compact", "comfortable"]) {
    const field = page.locator(`.multi-${density}`);
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
      const control = field.getByRole("checkbox",{name:`${density}-${type}`});
      const geometry = await control.evaluate(el => {
        const b=el.getBoundingClientRect(), svg=el.querySelector("svg"), s=svg.getBoundingClientRect();
        return {w:s.width,h:s.height,delta:Math.abs((s.top+s.bottom-b.top-b.bottom)/2),stroke:svg.getAttribute("stroke-width")};
      });
      assert.deepEqual(geometry,{w:12,h:12,delta:0,stroke:"1.5"});
    }
    assert(await page.getByRole("combobox",{name:`${density}-multi-disabled`}).isDisabled());
  }
  for (const density of ["compact", "comfortable"]) {
    const field = page.locator(`.date-${density}`);
    const input = field.getByLabel(`${density}-date`, {exact:true});
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
    assert(await page.getByLabel(`${density}-date-disabled`,{exact:true}).isDisabled());
  }
  console.log("Select geometry, open, selection and disabled checks passed");
} finally {
  await browser?.close();
  await server.close();
}

import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import postcss from "postcss";

const css = postcss.parse(readFileSync("packages/mtone/src/tabs.css", "utf8"));
const root = '.mt-tabs:is([data-variant="card"], [data-variant="editable-card"])';
function declarations(selector: string) {
  const values: Record<string, string> = {};
  css.walkRules(selector, rule => { rule.walkDecls(d => { values[d.prop] = d.value; }); });
  return values;
}
it("defines compact card size tokens without changing line tabs", () => {
  expect(declarations(root)["--mt-tabs-card-height"]).toBe("28px");
  expect(declarations(root + '[data-size="small"]')["--mt-tabs-card-height"]).toBe("24px");
  expect(declarations(root + '[data-size="large"]')["--mt-tabs-card-height"]).toBe("32px");
  expect(declarations(".mt-tabs")["--mt-tabs-card-height"]).toBeUndefined();
});
it("includes card borders in the requested height and keeps square bottom corners", () => {
  const item = declarations(root + " > .mt-tab-bar > .mt-tab-list > .mt-tab-item");
  expect(item["box-sizing"]).toBe("border-box");
  expect(item.height).toBe("var(--mt-tabs-card-height)");
  expect(item["border-radius"]).toBe("5px 5px 0 0");
  const tab = declarations(root + " > .mt-tab-bar > .mt-tab-list > .mt-tab-item > .mt-tab");
  expect(tab["padding-block"]).toBe("0");
  expect(tab["border-radius"]).toBe("4px 4px 0 0");
  expect(tab["font-size"]).toBe("var(--mt-tabs-card-font-size)");
  expect(tab["line-height"]).toBe("20px");
});

it("moves 3px of existing editable trigger padding onto the text label", () => {
  const editable = '.mt-tabs[data-variant="editable-card"] > .mt-tab-bar > .mt-tab-list > .mt-tab-item';
  expect(declarations(editable)["margin-inline"]).toBeUndefined();
  expect(declarations(editable + " > .mt-tab")["padding-inline"]).toBe("7px");
  expect(declarations(editable + " > .mt-tab > .mt-tab-label")["margin-inline"]).toBe("3px");
});

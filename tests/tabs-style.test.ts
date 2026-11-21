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
it("uses a single 34px border-box item height and preserves size typography", () => {
  const item = declarations(".mt-tab-item");
  expect(item["box-sizing"]).toBe("border-box");
  expect(item.height).toBe("34px");
  expect(declarations(root)["--mt-tabs-card-height"]).toBeUndefined();
  expect(declarations(root)["--mt-tabs-card-font-size"]).toBe("14px");
  expect(declarations(root + '[data-size="small"]')["--mt-tabs-card-font-size"]).toBe("12px");
  expect(declarations(root + '[data-size="large"]')["--mt-tabs-card-font-size"]).toBe("15px");
});
it("keeps square card bottom corners", () => {
  const item = declarations(root + " > .mt-tab-bar > .mt-tab-list > .mt-tab-item");
  expect(item.height).toBeUndefined();
  expect(item["border-radius"]).toBe("5px 5px 0 0");
  const tab = declarations(root + " > .mt-tab-bar > .mt-tab-list > .mt-tab-item > .mt-tab");
  expect(declarations(".mt-tab")["padding-block"]).toBe("0");
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

it("sets line label margin and default list gap without adding item margins", () => {
  const list = '.mt-tabs[data-variant="line"] > .mt-tab-bar > .mt-tab-list';
  const item = list + " > .mt-tab-item";
  const tab = item + " > .mt-tab";
  expect(declarations(tab + " > span.mt-tab-label")).toEqual({ "margin-inline": "6px" });
  expect(declarations(tab)["padding-inline"]).toBeUndefined();
  expect(declarations(item)["margin-inline"]).toBeUndefined();
  expect(declarations(list).gap).toBe("var(--mt-tabs-gap, 6px)");
});

it("keeps the tab trigger transparent on active card hover", () => {
  const active = root + " > .mt-tab-bar > .mt-tab-list > .mt-tab-item[data-active]";
  expect(declarations(active + " > .mt-tab:hover")).toEqual({"background-color": "transparent"});
});

it("moves only inactive top cards down 1px without painting a second bottom edge", () => {
  const list = root + '[data-placement="top"] > .mt-tab-bar > .mt-tab-list';
  expect(declarations(list)["overflow-y"]).toBe("hidden");
  const inactive = list + " > .mt-tab-item:not([data-active])";
  const rule = declarations(inactive);
  expect(rule["border-bottom-color"]).toBe("transparent");
  expect(rule["background-clip"]).toBe("padding-box");
  expect(rule.position).toBe("relative");
  expect(rule.top).toBe("1px");
  expect(rule.height).toBeUndefined();
});

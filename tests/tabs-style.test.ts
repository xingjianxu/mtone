import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import postcss from "postcss";

const css = postcss.parse(readFileSync("packages/mtone/src/tabs.css", "utf8"));
const root = '.mt-tabs:is([data-variant="card"], [data-variant="editable-card"])';
function declarations(selector: string, media?: string) {
  const values: Record<string, string> = {};
  css.walkRules(selector, rule => {
    const parent = rule.parent;
    if (media ? parent?.type !== "atrule" || parent.params !== media : parent?.type !== "root") return;
    rule.walkDecls(d => { values[d.prop] = d.value; });
  });
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

it("aligns both top card states without adding to the scrollable height", () => {
  const list = root + '[data-placement="top"] > .mt-tab-bar > .mt-tab-list';
  const divider = declarations(list);
  expect(divider["overflow-y"]).toBe("hidden");
  expect(divider["padding-block-end"]).toBe("1px");
  expect(divider["border-bottom-width"]).toBe("0");
  expect(divider["border-image"]).toMatch(/ 1 \/ 0 0 1px$/);
  expect(divider["--mt-tabs-card-divider"]).toBe("var(--mt-border, #e9e9e7)");
  expect(declarations(list, "(forced-colors: active)")["--mt-tabs-card-divider"]).toBe("CanvasText");
  expect(declarations(list + " > .mt-tab-item")).toEqual({
    position: "relative",
    top: "1px",
    "border-bottom-color": "transparent",
    "background-clip": "padding-box",
  });
});

it("moves only the top line indicator down while preserving the baseline row", () => {
  const list = '.mt-tabs[data-variant="line"][data-placement="top"] > .mt-tab-bar > .mt-tab-list';
  const active = list + " > .mt-tab-item > .mt-tab[data-active]";
  expect(declarations(list)).toEqual({
    "border-bottom": "0",
    "padding-bottom": "1px",
    "box-shadow": "inset 0 -1px var(--mt-border, #e9e9e7)",
  });
  expect(declarations(active)).toEqual({position:"relative","border-bottom-color":"transparent"});
  expect(declarations(active + "::after")).toEqual({
    content: '""', position: "absolute", "inset-inline": "0", bottom: "-3px",
    height: "2px", background: "currentColor", "pointer-events": "none",
  });
});

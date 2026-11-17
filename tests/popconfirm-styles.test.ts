import { readFileSync } from "node:fs";
import { test, expect } from "vitest";
test("specific popup rules beat generic popup padding, width and overflow regardless of import order", () => {
  const css = readFileSync("packages/mtone/src/popconfirm.css", "utf8");
  const root = css
    .slice(css.indexOf(".mt-popup.mt-popconfirm {"))
    .split("}")[0];
  expect(root).toContain("min-width: 0");
  expect(root).toContain("overflow: visible");
  expect(root).toContain("padding: 12px");
  const body = css.slice(css.indexOf(".mt-popconfirm-body {")).split("}")[0];
  expect(body).toContain("overflow: auto");
  expect(body).toContain("--available-height");
});

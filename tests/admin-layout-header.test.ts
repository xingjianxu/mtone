import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("keeps the AdminLayout brand and topbar at the same fixed height without vertical padding", () => {
  const css = readFileSync("packages/mtone/src/layout.css", "utf8");
  for (const selector of [
    ".mt-layout-sider .mt-sidebar-heading",
    ".mt-layout-header",
  ]) {
    const rule = css.split(`${selector} {`)[1]?.split("}")[0];
    expect(rule, selector).toMatch(
      /^\s+height: var\(--mt-layout-header-height, 48px\);/m,
    );
    expect(rule, selector).toMatch(/box-sizing: border-box;/);
    expect(rule, selector).toMatch(/padding: 0 \d+px;/);
  }
});

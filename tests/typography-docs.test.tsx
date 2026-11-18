import React from "react";
import { render, screen, within } from "@testing-library/react";
import { it, expect } from "vitest";
import { TypographyExample } from "../apps/docs/typography-example";
it("gives every Typography subcomponent a separate named demo", () => {
  render(<TypographyExample />);
  for (const name of [
    "Title 标题",
    "Text 文本",
    "Paragraph 段落",
    "Link 链接",
    "Blockquote 引用",
  ]) {
    const section = screen.getByRole("region", { name });
    expect(section).toHaveStyle({ margin: 0 });
    expect(within(section).getByRole("heading", { name })).toBeVisible();
  }
  expect(screen.getByRole("button", { name: "复制" })).toBeVisible();
  expect(screen.getByRole("button", { name: "编辑" })).toBeVisible();
  expect(screen.getByRole("button", { name: "展开" })).toBeVisible();
});

it("does not apply the site's page footer layout to quotation attributions", async () => {
  const { readFileSync } = await import("node:fs");
  const css = readFileSync("apps/docs/site.css", "utf8");
  expect(css).not.toMatch(/(?:^|\n)\s*footer\s*\{/);
  expect(css).toContain(".docs-footer {");
});

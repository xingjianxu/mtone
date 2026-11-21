import React from "react";
import { render, screen, within } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import { ComponentExample } from "../apps/docs/examples";
import { DocsApp, parseRoute } from "../apps/docs/docs-app";
import { TypographyExample } from "../apps/docs/typography-example";
it("gives every Typography subcomponent a separate named demo", () => {
  render(<TypographyExample />);
  for (const name of [
    "Title 标题",
    "Text 文本",
    "Paragraph 段落",
    "Link 链接",
    "Blockquote 引用",
    "Code 代码",
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

it("offers an in-page navigation link for each Typography demo", () => {
  render(<TypographyExample />);
  const nav = screen.getByRole("navigation", { name: "Typography 子组件" });
  for (const name of ["Title", "Text", "Paragraph", "Link", "Blockquote", "Code"]) {
    const link = within(nav).getByRole("link", { name });
    expect(link).toHaveAttribute(
      "href",
      `#/components/Typography?section=${name}`,
    );
    expect(
      document.getElementById(`typography-${name.toLowerCase()}`),
    ).not.toBeNull();
  }
});

it("keeps old subcomponent URLs working on the consolidated Typography page", () => {
  for (const name of ["Title", "Text", "Paragraph", "Link", "Blockquote"]) {
    for (const hash of [
      `#/components/${name}`,
      `#/components/Typography?section=${name}`,
    ]) {
      expect(parseRoute(hash)).toEqual({
        kind: "component",
        name: "Typography",
        section: name,
      });
    }
  }
  expect(parseRoute("#/components/Typography?section=Unknown").kind).toBe(
    "not-found",
  );
});

it("includes all subcomponent API references on the Typography page", () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  window.location.hash = "#/components/Typography";
  render(<DocsApp />);
  for (const name of ["Title", "Text", "Paragraph", "Link", "Blockquote"]) {
    expect(
      screen.getByRole("region", { name: `${name} 属性与接口` }),
    ).toBeVisible();
  }
  const sidebar = screen.getByRole("navigation", { name: "文档导航" });
  expect(
    within(sidebar).getByRole("link", { name: "Typography" }),
  ).toHaveAttribute("aria-current", "page");
});

it("keeps compact gallery previews free of duplicate page anchors", () => {
  const { container } = render(
    <>
      {["Typography", "Title", "Text", "Paragraph", "Link"].map((name) => (
        <ComponentExample key={name} name={name} compact />
      ))}
    </>,
  );
  expect(container.querySelectorAll('[id^="typography-"]')).toHaveLength(0);
  expect(
    screen.queryByRole("navigation", { name: "Typography 子组件" }),
  ).not.toBeInTheDocument();
});

it("documents Code within Typography without registering a standalone Code component", () => {
  expect(parseRoute("#/components/Code")).toEqual({ kind: "not-found" });
  expect(parseRoute("#/components/Typography?section=Code")).toEqual({
    kind: "component", name: "Typography", section: "Code",
  });
  window.location.hash = "#/components/Typography?section=Code";
  render(<DocsApp />);
  expect(screen.getByRole("heading", { name: /^Code$/ })).toHaveFocus();
  expect(screen.getByLabelText("配置示例").tagName).toBe("PRE");
  expect(screen.getByText("Code.block")).toBeVisible();
  expect(within(screen.getByRole("navigation", { name: "文档导航" })).queryByRole("link", { name: /^Code$/ })).not.toBeInTheDocument();
});

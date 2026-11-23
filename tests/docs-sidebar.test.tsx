import React from "react";
import { render } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { DocsApp } from "../apps/docs/docs-app";
import { componentCategories, componentDocs } from "../apps/docs/catalog";

test("sidebar keeps semantic neighbors together and renders each component and guide as a link", () => {
  window.location.hash = "#/start";
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const { container } = render(<DocsApp />);
  const sidebar = container.querySelector(".docs-sidebar")!;
  const groups = Array.from(sidebar.querySelectorAll("nav > .mt-nav-group"));
  expect(groups).toHaveLength(componentCategories.length + 1);
  expect(groups[0].querySelector(".mt-nav-label")).toHaveTextContent("开始使用");
  const headings = groups.slice(1).map((group) => group.querySelector(".mt-nav-label")!);
  expect(headings.map((heading) => heading.textContent)).toEqual([...componentCategories]);
  const sectionOnly = new Set(["Title", "Text", "Paragraph", "Link", "Blockquote"]);
  const sidebarDocs = componentDocs.filter((doc) => !doc.sidebarParent && !sectionOnly.has(doc.name));
  const namesByGroup = new Map<string, string[]>();
  for (const heading of headings) {
    const category = heading.textContent!;
    const links = Array.from(heading.parentElement!.querySelectorAll("a"));
    const names = links.map((link) => link.textContent!);
    const expected = sidebarDocs.filter((doc) => doc.category === category).map((doc) => doc.name);
    expect(names).toHaveLength(expected.length);
    expect(new Set(names)).toEqual(new Set(expected));
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      names.map((name) => `#/components/${name}`),
    );
    namesByGroup.set(category, names);
  }
  expect(namesByGroup.get("基础组件")?.slice(0, 2)).toEqual(["Button", "ButtonGroup"]);
  expect(namesByGroup.get("弹层与菜单")?.slice(0, 3)).toEqual(["Popover", "Menu", "ContextMenu"]);
  const formNames = namesByGroup.get("表单输入")!;
  expect(formNames.slice(formNames.indexOf("Select"), formNames.indexOf("Select") + 2)).toEqual([
    "Select", "TreeSelect",
  ]);
  expect(Array.from(sidebar.querySelectorAll('a:not([href^="#/components/"])'), (link) => link.getAttribute("href")))
    .toEqual(["#/start", "#/gallery", "./showcase.html", "#/theme", "#/theme/color-presets", "/llms.txt"]);
  expect(sidebar.querySelector('a[href="#/start"]')).toHaveAttribute("aria-current", "page");
  expect(sidebar.querySelectorAll("nav a:not(.mt-nav-item)")).toHaveLength(0);
  expect(sidebar.querySelector('a[href="./showcase.html"]')).toHaveAttribute("target", "_blank");
  expect(sidebar.querySelectorAll('a[href^="#/components/"]')).toHaveLength(sidebarDocs.length);
});

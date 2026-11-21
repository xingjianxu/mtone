import React from "react";
import { render } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { DocsApp } from "../apps/docs/docs-app";
import { componentCategories, componentDocs } from "../apps/docs/catalog";

test("sidebar preserves semantic groups and guide order while sorting component names A–Z", () => {
  window.location.hash = "#/start";
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const { container } = render(<DocsApp />);
  const sidebar = container.querySelector(".docs-sidebar")!;
  const groups = Array.from(sidebar.querySelectorAll("nav > .mt-nav-group"));
  expect(groups).toHaveLength(componentCategories.length + 1);
  expect(groups[0].querySelector(".mt-nav-label")).toHaveTextContent("开始使用");
  const headings = groups.slice(1).map((group) => group.querySelector(".mt-nav-label")!);
  expect(headings.map((heading) => heading.textContent)).toEqual([...componentCategories]);
  for (const heading of headings) {
    const names = Array.from(heading.parentElement!.querySelectorAll("a"), (link) => link.textContent);
    const expected = componentDocs
      .filter((doc) => doc.category === heading.textContent && !doc.sidebarParent && !["Title", "Text", "Paragraph", "Link", "Blockquote", "SearchInput", "Textarea"].includes(doc.name))
      .map((doc) => doc.name)
      .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
    expect(names).toEqual(expected);
  }
  expect(Array.from(sidebar.querySelectorAll('a:not([href^="#/components/"])'), (link) => link.getAttribute("href")))
    .toEqual(["#/start", "#/gallery", "./showcase.html", "#/theme"]);
  expect(sidebar.querySelector('a[href="#/start"]')).toHaveAttribute("aria-current", "page");
  expect(sidebar.querySelectorAll("nav a:not(.mt-nav-item)")).toHaveLength(0);
  expect(sidebar.querySelector('a[href="./showcase.html"]')).toHaveAttribute("target", "_blank");
  expect(sidebar.querySelectorAll('a[href^="#/components/"]')).toHaveLength(componentDocs.filter((doc) => !doc.sidebarParent).length - 7);
});

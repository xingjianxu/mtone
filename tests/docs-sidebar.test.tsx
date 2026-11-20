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
  const headings = Array.from(sidebar.querySelectorAll(".nav-heading")).slice(1);
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
  expect(sidebar.querySelectorAll('a[href^="#/components/"]')).toHaveLength(componentDocs.filter((doc) => !doc.sidebarParent).length - 7);
});

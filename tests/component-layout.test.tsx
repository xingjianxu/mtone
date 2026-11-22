import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { DocsApp, parseRoute, docSections, componentDocHref } from "../apps/docs/docs-app";

import type { DocSection } from "../apps/docs/doc-section";
import { componentDocs } from "../apps/docs/catalog";
import { typographySectionId } from "../apps/docs/typography-navigation";
test("accepts directly linked demo and API anchors", () => {
  expect(parseRoute("#/components/Table?section=row-selection")).toEqual(
    { kind: "component", name: "Table", section: "row-selection" }
  );
});

test("component page gives access to a shareable API anchor", () => {
  window.location.hash = "#/components/Button";
  render(<DocsApp />);
  const outline = screen.getAllByRole("navigation", { name: "本页目录" })[0];
  expect(within(outline).getByRole("link", { name: "API" }).getAttribute("href")).toBe("#/components/Button?section=props");
});

test("every canonical doc link lands on a labeled page or nested section with source for each preview", () => {
  const sectionIds = new Map<string, Set<string>>();
  for (const doc of componentDocs) {
    const href = componentDocHref(doc.name);
    const route = parseRoute(href);
    expect(route.kind, `${doc.name} → ${href}`).toBe("component");
    if (route.kind !== "component") continue;
    const sections = docSections[route.name];
    expect(sections?.length, route.name).toBeGreaterThan(0);
    const ids = sectionIds.get(route.name) ?? new Set<string>();
    const visit = (items: readonly DocSection[]) => {
      for (const item of items) {
        expect(ids.has(item.id), `${route.name} #${item.id}`).toBe(false);
        ids.add(item.id);
        expect(item.title).not.toBe("");
        if (item.Demo) expect(item.source).toContain("@bixlab/mtone");
        else expect(item.children?.length).toBeGreaterThan(0);
        if (item.children) visit(item.children);
      }
    };
    if (!sectionIds.has(route.name)) {
      visit(sections);
      sectionIds.set(route.name, ids);
    }
    if (route.section) {
      const target = route.name === "Typography"
        ? typographySectionId(route.section)
        : route.section;
      expect(ids.has(target), href).toBe(true);
    }
    if (doc.sidebarSection) {
      expect(route).toEqual({
        kind: "component", name: doc.sidebarParent, section: doc.sidebarSection,
      });
      expect(parseRoute(`#/components/${doc.name}`)).toEqual({ kind: "not-found" });
    }
  }
});

test("docs use one library TOC with nested links and refocus the same routed section", async () => {
  window.location.hash = "#/components/Input?section=input-search-submit";
  render(<DocsApp />);
  const outline = screen.getByRole("navigation", { name: "本页目录" });
  expect(outline).toHaveAttribute("data-mt-toc");
  const target = document.getElementById("input-search-submit")!;
  expect(document.activeElement).toBe(target);
  const searchLink = outline.querySelector('a[href="#/components/Input?section=input-search-submit"]')!;
  expect(searchLink.closest("li")?.parentElement?.closest("li")).not.toBeNull();

  screen.getByRole("link", { name: "快速开始" }).focus();
  fireEvent.click(searchLink, { ctrlKey: true });
  expect(document.activeElement).not.toBe(target);
  fireEvent.click(searchLink);
  await waitFor(() => expect(document.activeElement).toBe(target));
  expect(window.location.hash).toBe("#/components/Input?section=input-search-submit");
});

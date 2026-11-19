import React from "react";
import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { DocsApp, parseRoute, docSections } from "../apps/docs/docs-app";

import type { DocSection } from "../apps/docs/doc-section";
import { componentDocs } from "../apps/docs/catalog";
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

test("every route has labeled docs with standalone source for every preview", () => {
  for (const doc of componentDocs) {
    const route = parseRoute(`#/components/${doc.name}`);
    expect(route.kind).toBe("component");
    if (route.kind !== "component") continue;
    const sections = docSections[route.name];
    expect(sections?.length, route.name).toBeGreaterThan(0);
    const ids = new Set();
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
    visit(sections);
  }
});

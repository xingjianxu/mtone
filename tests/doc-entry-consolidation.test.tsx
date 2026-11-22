import React from "react";
import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { DocsApp, docSections, parseRoute, searchDocs } from "../apps/docs/docs-app";

const removed = ["Toast", "DirectoryTree", "AiChainOfThought", "Modal", "DropdownMenu", "Mention", "SearchInput", "Textarea", "FormField"];

test("removed components have no reference, standalone demo or legacy route", () => {
  for (const name of removed) {
    expect(searchDocs(name).map((entry) => entry.name)).not.toContain(name);
    expect(docSections).not.toHaveProperty(name);
    expect(parseRoute(`#/components/${name}`)).toEqual({ kind: "not-found" });
  }
});

test.each([
  ["Image", "groups", "ImageGroup"],
  ["Image", "controlled", "ImagePreview"],
  ["Cascader", "panel", "CascaderPanel"],
  ["Avatar", "groups", "AvatarGroup"],
  ["DocumentList", "cards", "DocumentCard"],
])("%s keeps the %s demo and groups %s API in its main page", (parent, section, child) => {
  window.location.hash = `#/components/${parent}?section=${section}`;
  render(<DocsApp />);
  expect(screen.getByRole("heading", { name: parent, level: 1 })).toBeInTheDocument();
  expect(docSections[parent].find((entry) => entry.id === section)?.Demo).toBeTruthy();
  expect(screen.getByRole("region", { name: `${child} 属性与接口` })).toBeInTheDocument();
  const sidebar = document.querySelector<HTMLElement>(".docs-sidebar")!;
  expect(within(sidebar).queryByRole("link", { name: child })).not.toBeInTheDocument();
});

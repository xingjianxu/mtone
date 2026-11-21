import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect } from "vitest";
import { componentDocs } from "../apps/docs/catalog";
import { docSections } from "../apps/docs/docs-app";

it("documents Popover and Menu width and alignment without a standalone Dropdown", () => {
  expect(componentDocs.some((doc) => doc.name === "Dropdown")).toBe(false);
  for (const name of ["Popover", "Menu"]) {
    const props = componentDocs.find((doc) => doc.name === name)!.props.map((prop) => prop.name);
    expect(props).toEqual(expect.arrayContaining(["width", "align"]));
  }
});

it("the Popover card demo opens a named dialog containing an editable form", async () => {
  const Demo = docSections.Popover.find((section) => section.id === "card")!.Demo!;
  render(<Demo />);
  await userEvent.click(screen.getByRole("button", { name: "打开设置卡片" }));
  expect(await screen.findByRole("dialog", { name: "项目设置" })).toBeVisible();
  expect(screen.getByRole("textbox", { name: "项目名称" })).toBeVisible();
});

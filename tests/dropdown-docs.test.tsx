import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect } from "vitest";
import { componentDocs } from "../apps/docs/catalog";
import { docSections } from "../apps/docs/docs-app";

it("documents width and alignment on the Popover hosts, not on inline Menu", () => {
  expect(componentDocs.some((doc) => doc.name === "Dropdown")).toBe(false);
  const propNames = (name: string) =>
    componentDocs.find((doc) => doc.name === name)!.props.map((prop) => prop.name);
  expect(propNames("Popover")).toEqual(
    expect.arrayContaining(["width", "align", "Popover.Menu.width / align"]),
  );
  expect(propNames("Menu")).toContain("items");
  for (const name of ["width", "align", "trigger"]) expect(propNames("Menu")).not.toContain(name);
});

it("the Popover card demo opens a named dialog containing an editable form", async () => {
  const Demo = docSections.Popover.find((section) => section.id === "card")!.Demo!;
  render(<Demo />);
  await userEvent.click(screen.getByRole("button", { name: "打开设置卡片" }));
  expect(await screen.findByRole("dialog", { name: "项目设置" })).toBeVisible();
  expect(screen.getByRole("textbox", { name: "项目名称" })).toBeVisible();
});

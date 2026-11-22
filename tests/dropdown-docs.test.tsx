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

it("the Popover card demo keeps the default frame and editable form", async () => {
  const card = docSections.Popover.find((section) => section.id === "card")!;
  const Demo = card.Demo!;
  const user = userEvent.setup();
  render(<Demo />);
  const trigger = screen.getByRole("button", { name: "打开设置卡片" });
  await user.click(trigger);
  const popup = await screen.findByRole("dialog", { name: "项目设置" });
  expect(popup).toBeVisible();
  expect(popup).toHaveClass("mt-popover");
  expect(popup).not.toHaveClass("mt-popover-unstyled");
  const input = screen.getByRole("textbox", { name: "项目名称" });
  await user.clear(input);
  await user.type(input, "研究计划");
  expect(input).toHaveValue("研究计划");
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog", { name: "项目设置" })).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

import React from "react";
import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import { componentDocs } from "../apps/docs/catalog";
import { ComponentExample } from "../apps/docs/examples";
it("documents independent Dropdown and shared Menu width/alignment", () => {
  const dropdown = componentDocs.find((d) => d.name === "Dropdown");
  expect(dropdown).toBeDefined();
  expect(dropdown?.code).toContain("content=");
  for (const name of ["Dropdown", "Menu"]) {
    const props = componentDocs
      .find((d) => d.name === name)!
      .props.map((p) => p.name);
    expect(props).toEqual(expect.arrayContaining(["width", "align"]));
  }
});
it("shows left/right alignment examples independently of the wide trigger", () => {
  render(<ComponentExample name="Dropdown" />);
  expect(screen.getByRole("button", { name: "左侧对齐" })).toBeVisible();
  expect(
    screen.getByRole("button", { name: "右侧对齐，固定宽度" }),
  ).toBeVisible();
});

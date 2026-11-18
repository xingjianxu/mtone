import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { it, expect } from "vitest";
import { componentDocs } from "../apps/docs/catalog";
import { ComponentExample } from "../apps/docs/examples";
it("documents the overlay's public API and keyboard limitation", () => {
  const doc = componentDocs.find((d) => d.name === "LoadingOverlay");
  expect(doc).toBeDefined();
  expect(doc?.props.map((p) => p.name)).toEqual(
    expect.arrayContaining([
      "visible",
      "label",
      "loader",
      "opacity",
      "blur",
      "radius",
      "zIndex",
      "overlayColor",
    ]),
  );
  expect(doc?.notes.join(" ")).toContain("键盘");
  expect(doc?.code).toContain('position: "relative"');
});
it("shows a repeatable form demo without resetting its value", () => {
  render(<ComponentExample name="LoadingOverlay" />);
  const input = screen.getByRole("textbox", { name: "项目名称" });
  fireEvent.change(input, { target: { value: "研究项目" } });
  fireEvent.click(screen.getByRole("button", { name: "显示遮罩" }));
  expect(input).toBeDisabled();
  expect(screen.getByRole("status", { name: "正在保存" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "隐藏遮罩" }));
  expect(input).not.toBeDisabled();
  expect(input).toHaveValue("研究项目");
  expect(screen.queryByRole("status", { name: "正在保存" })).toBeNull();
});

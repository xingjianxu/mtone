import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { test, expect } from "vitest";
import { ComponentExample } from "../apps/docs/examples";
import { componentDocs } from "../apps/docs/catalog";
test("Avatar demo demonstrates fitting, responsive sizes and group overflow", () => {
  render(<ComponentExample name="Avatar" />);
  expect(screen.getByText("RESEARCH")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "显示另外 2 位成员" }),
  ).toBeInTheDocument();
  expect(
    componentDocs
      .find((d) => d.name === "Avatar")
      ?.props.some((p) => p.name === "gap"),
  ).toBe(true);
});
test("Popconfirm demo is interactive and has complete reference", async () => {
  render(<ComponentExample name="Popconfirm" compact />);
  fireEvent.click(screen.getByRole("button", { name: "移除记录" }));
  fireEvent.click(await screen.findByRole("button", { name: "确定" }));
  expect(screen.getByText("已确认移除（本地示例）")).toBeInTheDocument();
  const doc = componentDocs.find((d) => d.name === "Popconfirm");
  expect(doc?.category).toBe("浮层对话");
  expect(doc?.props.some((p) => p.name === "onConfirm")).toBe(true);
});

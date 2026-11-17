import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { ComponentExample } from "../apps/docs/examples";
import { componentDocs } from "../apps/docs/catalog";
it("demonstrates independent primary and dropdown actions in a connected group", async () => {
  const user = userEvent.setup();
  render(<ComponentExample name="ButtonGroup" />);
  const group = screen.getByRole("group", { name: "导出文档" });
  expect(group).toHaveClass("mt-button-group-connected");
  expect(group.querySelectorAll(":scope > button")).toHaveLength(2);
  await user.click(within(group).getByRole("button", { name: "导出 PDF" }));
  expect(screen.getByRole("status")).toHaveTextContent("已选择导出 PDF");
  await user.click(within(group).getByRole("button", { name: "更多导出格式" }));
  await user.click(await screen.findByRole("menuitem", { name: "导出 Markdown" }));
  expect(screen.getByRole("status")).toHaveTextContent("已选择导出 Markdown");
});
it("publishes a complete copyable split-button example", () => {
  const doc = componentDocs.find(d => d.name === "ButtonGroup")!;
  expect(doc.importNames).toContain("Menu");
  expect(doc.code).toContain("<Menu");
  expect(doc.code).toContain('aria-label="更多导出格式"');
  expect(doc.code).toContain("onSelect");
});

import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { docSections, parseRoute, searchDocs } from "../apps/docs/docs-app";

test("replaces standalone filter docs with an interactive Tag section", () => {
  for (const name of ["FilterChip", "FilterBar"]) {
    expect(parseRoute(`#/components/${name}`)).toEqual({ kind: "not-found" });
    expect(searchDocs(name).map((doc) => doc.name)).not.toContain(name);
    expect(docSections[name]).toBeUndefined();
  }
  expect(parseRoute("#/components/Tag?section=filter")).toEqual({
    kind: "component", name: "Tag", section: "filter",
  });
  const section = docSections.Tag.find(({ id }) => id === "filter")!;
  expect(section.title).toBe("筛选标签");
  expect(section.source).toContain('variant="filter"');
  expect(section.source).toContain('gap: 8');
  const Demo = section.Demo!;
  render(<Demo />);
  const results = within(screen.getByRole("list", { name: "筛选结果" }));
  expect(results.getByText("图标规范")).toBeInTheDocument();
  expect(results.queryByText("接口清单")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "添加筛选" }));
  expect(screen.getByText("状态：进行中")).toBeInTheDocument();
  expect(results.queryByText("图标规范")).not.toBeInTheDocument();

  fireEvent.click(screen.getAllByRole("button", { name: "移除筛选" })[0]);
  expect(screen.queryByText("分类：设计")).not.toBeInTheDocument();
  expect(results.getByText("接口清单")).toBeInTheDocument();
});

import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { DocsApp, searchDocs } from "../apps/docs/docs-app";
import { componentDocs } from "../apps/docs/catalog";

beforeEach(() => {
  window.location.hash = "#/start";
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

test("topbar Spotlight replaces sidebar search and retains every searchable component", async () => {
  const { container } = render(<DocsApp />);
  const topbar = within(screen.getByRole("banner"));
  expect(container.querySelector(".docs-sidebar input")).toBeNull();
  fireEvent.click(topbar.getByRole("button", { name: "搜索组件" }));
  const input = await screen.findByRole("combobox");
  expect(screen.getAllByRole("option")).toHaveLength(componentDocs.length);
  for (const query of ["button", "表单输入", "布局", "zzzzzz"]) {
    fireEvent.change(input, { target: { value: query } });
    expect(screen.queryAllByRole("option")).toHaveLength(searchDocs(query).length);
  }
  expect(screen.getByRole("status")).toHaveTextContent("没有匹配的组件");
  expect(container.querySelector('.docs-sidebar a[href="#/components/Button"]')).toBeInTheDocument();
});

test("shortcut, keyboard selection and pointer selection navigate and reset search", async () => {
  render(<DocsApp />);
  fireEvent.keyDown(document, { key: "k", ctrlKey: true });
  let input = await screen.findByRole("combobox");
  fireEvent.change(input, { target: { value: "ButtonGroup" } });
  fireEvent.keyDown(input, { key: "Enter" });
  await waitFor(() => expect(window.location.hash).toBe("#/components/ButtonGroup"));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  fireEvent.keyDown(document, { key: "k", metaKey: true });
  input = await screen.findByRole("combobox");
  expect(input).toHaveValue("");
  fireEvent.change(input, { target: { value: "Spotlight" } });
  fireEvent.click(screen.getByRole("option"));
  await waitFor(() => expect(window.location.hash).toBe("#/components/Spotlight"));
});

test("opening search closes mobile navigation and Escape closes the palette", async () => {
  const { container } = render(<DocsApp />);
  fireEvent.click(screen.getByRole("button", { name: "打开导航" }));
  expect(container.querySelector(".docs-sidebar")).toHaveClass("is-open");
  fireEvent.click(screen.getByRole("button", { name: "搜索组件" }));
  const input = await screen.findByRole("combobox");
  expect(container.querySelector(".docs-sidebar")).not.toHaveClass("is-open");
  fireEvent.keyDown(input, { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
});

test("the docs search keeps one stable keyboard registration across rerenders", () => {
  const add = vi.spyOn(document, "addEventListener");
  try {
    const { rerender, unmount } = render(<DocsApp />);
    const documentKeyListeners = () => add.mock.calls.filter(([type]) => type === "keydown").length;
    const mounted = documentKeyListeners();
    expect(mounted).toBeGreaterThan(0);
    rerender(<DocsApp />);
    expect(documentKeyListeners()).toBe(mounted);
    unmount();
  } finally {
    add.mockRestore();
  }
});

test("Spotlight centers only a newly selected component in the left navigation", async () => {
  const { container } = render(<DocsApp />);
  const sidebar = container.querySelector<HTMLElement>(".docs-sidebar")!;
  const nav = within(sidebar);
  const treeSelect = nav.getByRole("link", { name: "TreeSelect" });
  const cascader = nav.getByRole("link", { name: "Cascader" });
  vi.spyOn(sidebar, "clientHeight", "get").mockReturnValue(600);
  vi.spyOn(sidebar, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 68, 200, 600));
  vi.spyOn(treeSelect, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 1500, 180, 32));
  vi.spyOn(cascader, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 1540, 180, 32));
  const search = async (query: string) => {
    fireEvent.click(screen.getByRole("button", { name: "搜索组件" }));
    const input = await within(screen.getByRole("dialog")).findByRole("combobox");
    fireEvent.change(input, { target: { value: query } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  };

  await search("TreeSelect");
  await waitFor(() => expect(treeSelect).toHaveAttribute("aria-current", "page"));
  expect(sidebar.scrollTop).toBe(1148);

  sidebar.scrollTop = 900;
  await search("TreeSelect");
  expect(sidebar.scrollTop).toBe(900);

  fireEvent.click(cascader);
  await waitFor(() => expect(cascader).toHaveAttribute("aria-current", "page"));
  expect(sidebar.scrollTop).toBe(900);
});

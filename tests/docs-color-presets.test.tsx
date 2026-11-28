import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { DocsApp } from "../apps/docs/docs-app";

const paletteRoute = "#/theme/color-presets";

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("the direct color presets route exposes all eight tokens and is the current navigation item", () => {
  window.location.hash = paletteRoute;
  render(<DocsApp />);

  expect(screen.getByRole("heading", { level: 1, name: "颜色预设" })).toBeVisible();
  expect(document.title).toBe("颜色预设 · mtone");
  const navigation = screen.getByRole("navigation", { name: "文档导航" });
  expect(within(navigation).getByRole("link", { name: "颜色预设" })).toHaveAttribute("aria-current", "page");
  expect(within(navigation).getByRole("link", { name: "主题与样式" })).not.toHaveAttribute("aria-current");

  const palette = within(screen.getByRole("list", { name: "共享颜色预设" }));
  expect(palette.getAllByRole("listitem")).toHaveLength(8);
  for (const key of ["neutral", "blue", "green", "orange", "red", "purple", "teal", "coral"]) {
    expect(palette.getByText(`--mt-accent-${key}`)).toBeVisible();
  }
});

test.each(["#/theme", "#/components/Tabs?section=indicator-color"])(
  "the %s guide links to the central color presets page",
  async (hash) => {
    window.location.hash = hash;
    render(<DocsApp />);
    const link = within(screen.getByRole("main")).getByRole("link", { name: "颜色预设" });
    expect(link).toHaveAttribute("href", paletteRoute);

    window.location.hash = paletteRoute;
    fireEvent(window, new HashChangeEvent("hashchange"));
    const heading = await screen.findByRole("heading", { name: "颜色预设", level: 1 });
    expect(heading).toBeVisible();
    expect(heading).toHaveFocus();
  },
);

test("lists the pale blue selection surface separately from the accent colors", () => {
  window.location.hash = paletteRoute;
  render(<DocsApp />);
  const surfaces = within(screen.getByRole("region", { name: "语义颜色" }));
  expect(surfaces.getByText("浅蓝选中背景")).toBeVisible();
  expect(surfaces.getByText("--mt-select-surface")).toBeVisible();
  expect(surfaces.getByText("#E9F2FF")).toBeVisible();
  expect(surfaces.getByText("#24384F")).toBeVisible();
});

test("lists the three navigation selection roles together in the semantic colors table", () => {
  window.location.hash = paletteRoute;
  render(<DocsApp />);
  const table = within(screen.getByRole("table", { name: "常用语义颜色" }));
  const roles = [
    ["导航选中背景", "--mt-nav-selected"],
    ["导航选中文字", "--mt-nav-current-text"],
    ["侧栏当前项标记", "--mt-nav-current-indicator"],
  ];
  const rows = table.getAllByRole("row");
  const first = rows.indexOf(table.getByText(roles[0][1]).closest("tr")!);
  expect(first).toBeGreaterThan(0);
  roles.forEach(([label, token], offset) => {
    const row = within(rows[first + offset]);
    expect(row.getByRole("cell", { name: label })).toBeVisible();
    expect(row.getByRole("cell", { name: token })).toBeVisible();
  });
});

test("documents role overrides without treating them as public palette choices", () => {
  window.location.hash = paletteRoute;
  render(<DocsApp />);
  const semantic = within(screen.getByRole("region", { name: "语义颜色" }));
  expect(semantic.getByRole("table", { name: "常用语义颜色" })).toBeVisible();
  expect(semantic.getByText("--mt-toast-default-icon-ink")).toBeVisible();
  expect(semantic.getByText("--mt-focus")).toBeVisible();
  const palette = within(screen.getByRole("list", { name: "共享颜色预设" }));
  expect(palette.queryByText("--mt-toast-default-icon-ink")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "局部主操作" })).toBeVisible();
});


test("switches only the demo's named design and mode", () => {
  window.location.hash = "#/theme";
  render(<DocsApp />);
  const preview = screen.getByRole("region", { name: "主题预览" });
  const presetGroup = within(screen.getByRole("group", { name: "主题方案" }));
  const modeGroup = within(screen.getByRole("group", { name: "预览模式" }));
  expect(preview).toHaveAttribute("data-mt-theme-preset", "azure");
  fireEvent.click(presetGroup.getByRole("button", { name: "苔绿（自定义示例）" }));
  expect(preview.style.getPropertyValue("--mt-height")).toBe("36px");
  fireEvent.click(modeGroup.getByRole("button", { name: "深色" }));
  expect(preview.style.getPropertyValue("--mt-nav-selected")).toBe("#31463a");
  expect(document.documentElement.getAttribute("data-mt-theme-preset")).toBeNull();
  fireEvent.click(presetGroup.getByRole("button", { name: "原调（Original）" }));
  expect(preview).toHaveAttribute("data-mt-theme-preset", "original");
  expect(preview.style.getPropertyValue("--mt-height")).toBe("");
  expect(preview).toHaveAttribute("data-mt-theme", "dark");
});

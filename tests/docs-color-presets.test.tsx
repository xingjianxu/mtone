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
  const surfaces = within(screen.getByRole("region", { name: "语义背景" }));
  expect(surfaces.getByText("浅蓝选中背景")).toBeVisible();
  expect(surfaces.getByText("--mt-select-surface")).toBeVisible();
  expect(surfaces.getByText("#E9EEF4")).toBeVisible();
  expect(surfaces.getByText("#293746")).toBeVisible();
});

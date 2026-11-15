import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import { Layout, NavItem } from "../packages/mtone/src";
it("composes semantic layout regions and detects a direct sider", () => {
  render(
    <Layout data-testid="layout">
      <Layout.Sider logo="mtone" aria-label="Navigation">
        <NavItem>Home</NavItem>
      </Layout.Sider>
      <Layout>
        <Layout.Header
          breadcrumb="Breadcrumb"
          extra={<button>Account</button>}
        />
        <Layout.Content>Content</Layout.Content>
        <Layout.Footer>Footer</Layout.Footer>
      </Layout>
    </Layout>,
  );
  expect(screen.getByTestId("layout")).toHaveClass("mt-layout-has-sider");
  expect(
    screen.getByRole("complementary", { name: "Navigation" }),
  ).toHaveTextContent("mtone");
  expect(screen.getByRole("banner")).toHaveTextContent("Breadcrumb");
  expect(screen.getByRole("main")).toHaveTextContent("Content");
  expect(screen.getByRole("contentinfo")).toHaveTextContent("Footer");
});
it("reuses Sidebar collapse behavior and swaps the logo", () => {
  render(
    <Layout>
      <Layout.Sider collapsible logo="mtone" collapsedLogo="m">
        <NavItem>Home</NavItem>
      </Layout.Sider>
    </Layout>,
  );
  fireEvent.click(screen.getByRole("button", { name: "收起侧边栏" }));
  expect(screen.getByRole("complementary")).toHaveAttribute(
    "data-collapsed",
    "true",
  );
  expect(screen.getByRole("complementary")).toHaveTextContent("m");
  expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "展开侧边栏" }));
  expect(screen.getByRole("complementary")).toHaveTextContent("mtone");
});
it("does not override controlled collapse state", () => {
  const change = vi.fn();
  render(
    <Layout.Sider collapsible collapsed={false} onCollapsedChange={change}>
      <NavItem>Home</NavItem>
    </Layout.Sider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "收起侧边栏" }));
  expect(change).toHaveBeenCalledWith(true);
  expect(screen.getByRole("complementary")).toHaveAttribute(
    "data-collapsed",
    "false",
  );
});
it("responds to breakpoint changes and removes its listener", () => {
  let listener: (e: { matches: boolean }) => void = () => {};
  const remove = vi.fn();
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: true,
      addEventListener: (_: string, fn: typeof listener) => {
        listener = fn;
      },
      removeEventListener: remove,
    })),
  );
  const breakpoint = vi.fn();
  const { unmount } = render(
    <Layout.Sider collapsible breakpoint={768} onBreakpoint={breakpoint}>
      Navigation
    </Layout.Sider>,
  );
  expect(screen.getByRole("complementary")).toHaveAttribute(
    "data-collapsed",
    "true",
  );
  act(() => listener({ matches: false }));
  expect(screen.getByRole("complementary")).toHaveAttribute(
    "data-collapsed",
    "false",
  );
  expect(breakpoint).toHaveBeenLastCalledWith(false);
  unmount();
  expect(remove).toHaveBeenCalled();
  vi.unstubAllGlobals();
});
it("supports finite height, explicit row layout, and custom content semantics", () => {
  render(
    <Layout fullHeight hasSider style={{ height: 400 }} data-testid="frame">
      <Layout.Content as="section" aria-label="Preview">
        Body
      </Layout.Content>
    </Layout>,
  );
  expect(screen.getByTestId("frame")).toHaveClass(
    "mt-layout-full-height",
    "mt-layout-has-sider",
  );
  expect(screen.getByTestId("frame")).toHaveStyle({ height: "400px" });
  expect(screen.getByRole("region", { name: "Preview" })).toHaveTextContent(
    "Body",
  );
});
it("retains default collapsed state on a wide initial breakpoint and supports custom widths", () => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  render(
    <Layout.Sider
      collapsible
      defaultCollapsed
      breakpoint={768}
      width={280}
      collapsedWidth={64}
      logo="brand"
    >
      Menu
    </Layout.Sider>,
  );
  const sider = screen.getByRole("complementary");
  expect(sider).toHaveAttribute("data-collapsed", "true");
  expect(sider).toHaveStyle({
    "--mt-layout-sider-width": "280px",
    "--mt-layout-sider-collapsed-width": "64px",
  });
  expect(sider.querySelector(".mt-sidebar-content")).toHaveTextContent("Menu");
  vi.unstubAllGlobals();
});
it("gives non-collapsible sider content its own scroll container", () => {
  render(<Layout.Sider>Menu</Layout.Sider>);
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  expect(
    screen.getByRole("complementary").querySelector(".mt-sidebar-content"),
  ).toHaveTextContent("Menu");
});
it("re-evaluates collapse when the configured breakpoint changes", () => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("767.98"),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  const { rerender } = render(
    <Layout.Sider collapsible breakpoint={768}>
      Menu
    </Layout.Sider>,
  );
  expect(screen.getByRole("complementary")).toHaveAttribute(
    "data-collapsed",
    "true",
  );
  rerender(
    <Layout.Sider collapsible breakpoint={480}>
      Menu
    </Layout.Sider>,
  );
  expect(screen.getByRole("complementary")).toHaveAttribute(
    "data-collapsed",
    "false",
  );
  vi.unstubAllGlobals();
});
it("places version and collapse control in a persistent bottom row", () => {
  render(
    <Layout.Sider collapsible version="v2.4.0" logo="brand">
      <NavItem>Home</NavItem>
    </Layout.Sider>,
  );
  const sider = screen.getByRole("complementary");
  const footer = sider.querySelector(".mt-sidebar-footer");
  const toggle = screen.getByRole("button", { name: "收起侧边栏" });
  expect(footer).toContainElement(toggle);
  expect(footer).toHaveTextContent("v2.4.0");
  expect(sider.querySelector(".mt-sidebar-heading")).not.toContainElement(
    toggle,
  );
  expect(sider.lastElementChild).toBe(footer);
  fireEvent.click(toggle);
  expect(screen.queryByText("v2.4.0")).not.toBeInTheDocument();
  expect(footer).toContainElement(
    screen.getByRole("button", { name: "展开侧边栏" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "展开侧边栏" }));
  expect(screen.getByText("v2.4.0")).toBeInTheDocument();
});
it("does not hardcode a host application version", () => {
  render(<Layout.Sider collapsible>Menu</Layout.Sider>);
  expect(
    screen
      .getByRole("complementary")
      .querySelector(".mt-sidebar-footer-content"),
  ).toBeNull();
});

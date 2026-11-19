import userEvent from "@testing-library/user-event";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import { AdminLayout, NavItem } from "../packages/mtone/src";
it("composes semantic layout regions and detects a direct sider", () => {
  render(
    <AdminLayout data-testid="layout">
      <AdminLayout.Sider logo="mtone" aria-label="Navigation">
        <NavItem>Home</NavItem>
      </AdminLayout.Sider>
      <AdminLayout>
        <AdminLayout.Header
          breadcrumb="Breadcrumb"
          extra={<button>Account</button>}
        />
        <AdminLayout.Content>Content</AdminLayout.Content>
        <AdminLayout.Footer>Footer</AdminLayout.Footer>
      </AdminLayout>
    </AdminLayout>,
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
    <AdminLayout>
      <AdminLayout.Sider collapsible logo="mtone" collapsedLogo="m">
        <NavItem>Home</NavItem>
      </AdminLayout.Sider>
    </AdminLayout>,
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
    <AdminLayout.Sider collapsible collapsed={false} onCollapsedChange={change}>
      <NavItem>Home</NavItem>
    </AdminLayout.Sider>,
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
    <AdminLayout.Sider collapsible breakpoint={768} onBreakpoint={breakpoint}>
      Navigation
    </AdminLayout.Sider>,
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
    <AdminLayout fullHeight hasSider style={{ height: 400 }} data-testid="frame">
      <AdminLayout.Content as="section" aria-label="Preview">
        Body
      </AdminLayout.Content>
    </AdminLayout>,
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
    <AdminLayout.Sider
      collapsible
      defaultCollapsed
      breakpoint={768}
      width={280}
      collapsedWidth={64}
      logo="brand"
    >
      Menu
    </AdminLayout.Sider>,
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
  render(<AdminLayout.Sider>Menu</AdminLayout.Sider>);
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
    <AdminLayout.Sider collapsible breakpoint={768}>
      Menu
    </AdminLayout.Sider>,
  );
  expect(screen.getByRole("complementary")).toHaveAttribute(
    "data-collapsed",
    "true",
  );
  rerender(
    <AdminLayout.Sider collapsible breakpoint={480}>
      Menu
    </AdminLayout.Sider>,
  );
  expect(screen.getByRole("complementary")).toHaveAttribute(
    "data-collapsed",
    "false",
  );
  vi.unstubAllGlobals();
});
it("places version and collapse control in a persistent bottom row", () => {
  render(
    <AdminLayout.Sider collapsible version="v2.4.0" logo="brand">
      <NavItem>Home</NavItem>
    </AdminLayout.Sider>,
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
  render(<AdminLayout.Sider collapsible>Menu</AdminLayout.Sider>);
  expect(
    screen
      .getByRole("complementary")
      .querySelector(".mt-sidebar-footer-content"),
  ).toBeNull();
});
it("does not create a main footer unless explicitly composed", () => {
  const { rerender } = render(
    <AdminLayout>
      <AdminLayout.Header>Header</AdminLayout.Header>
      <AdminLayout.Content>Body</AdminLayout.Content>
    </AdminLayout>,
  );
  expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  rerender(
    <AdminLayout>
      <AdminLayout.Content>Body</AdminLayout.Content>
      <AdminLayout.Footer style={{ height: 64 }}>Footer</AdminLayout.Footer>
    </AdminLayout>,
  );
  expect(screen.getByRole("contentinfo")).toHaveStyle({ height: "64px" });
});
it('keeps the example main footer hidden until opted in',async()=>{
 const {AdminLayoutExample}=await import('../apps/docs/admin-layout-example');
 render(<AdminLayoutExample/>);
 expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
 await userEvent.click(screen.getByRole('button',{name:/主体 Footer/}));
 expect(screen.getByRole('contentinfo')).toBeInTheDocument();
 await userEvent.click(screen.getByRole('button',{name:/主体 Footer/}));
 expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
});

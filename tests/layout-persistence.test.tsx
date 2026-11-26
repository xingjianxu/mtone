import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { AdminLayout, FloatingWindow, Panel, Sidebar, Tabs } from "../packages/mtone/src";

afterEach(() => localStorage.clear());
const items = [
  { value: "a", label: "Alpha", content: "Alpha body" },
  { value: "b", label: "Beta", content: "Beta body" },
];

test("Panel remembers selection and disclosure while rejecting removed tabs", () => {
  const mount = (current = items) => render(<Panel storageKey="workbench" items={current} />);
  const first = mount();
  fireEvent.click(screen.getByRole("tab", { name: "Beta" }));
  fireEvent.click(screen.getByRole("button", { name: "收起面板" }));
  first.unmount();
  const second = mount();
  expect(screen.getByRole("tab", { name: "Beta" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("button", { name: "展开面板" })).toBeVisible();
  second.unmount();
  mount([items[0]]);
  expect(screen.getByRole("tab", { name: "Alpha" })).toHaveAttribute("aria-selected", "true");
});

test("standalone Tabs overrides storage with controlled value and does not replace the saved choice", () => {
  const mount = (value?: string) => render(<Tabs storageKey="views" items={items} value={value} />);
  const first = mount();
  fireEvent.click(screen.getByRole("tab", { name: "Beta" }));
  first.unmount();
  const controlled = mount("a");
  expect(screen.getByRole("tab", { name: "Alpha" })).toHaveAttribute("aria-selected", "true");
  fireEvent.click(screen.getByRole("tab", { name: "Alpha" }));
  controlled.unmount();
  mount();
  expect(screen.getByRole("tab", { name: "Beta" })).toHaveAttribute("aria-selected", "true");
});

test("Sidebar persists disclosure and tab choice, scoped to its key", () => {
  const mount = (storageKey?: string) => render(<Sidebar collapsible storageKey={storageKey} tabs={{ items }} />);
  const first = mount("navigation");
  fireEvent.click(screen.getByRole("tab", { name: "Beta" }));
  fireEvent.click(screen.getByRole("button", { name: "收起侧边栏" }));
  first.unmount();
  const second = mount("navigation");
  expect(screen.getByRole("button", { name: "展开侧边栏" })).toBeVisible();
  expect(screen.getByRole("tab", { name: "Beta" })).toHaveAttribute("aria-selected", "true");
  second.unmount();
  mount();
  expect(screen.getByRole("button", { name: "收起侧边栏" })).toBeVisible();
});

test("AdminLayout.Sider remembers its own collapse state", () => {
  const mount = () => render(<AdminLayout><AdminLayout.Sider collapsible storageKey="admin" /></AdminLayout>);
  const first = mount();
  fireEvent.click(screen.getByRole("button", { name: "收起侧边栏" }));
  first.unmount();
  mount();
  expect(screen.getByRole("button", { name: "展开侧边栏" })).toBeVisible();
});

test("FloatingWindow remembers keyboard geometry but not whether it was open", () => {
  const mount = () => render(<FloatingWindow trigger="打开" title="工具" storageKey="tool" initialPosition={{ left: 100, top: 100 }} />);
  const first = mount();
  fireEvent.click(screen.getByRole("button", { name: "打开" }));
  const dialog = screen.getByRole("dialog");
  fireEvent.keyDown(dialog.querySelector(".mt-floating-window-move")!, { key: "ArrowRight" });
  const savedLeft = dialog.style.left;
  expect(savedLeft).toBe("108px");
  first.unmount();
  mount();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "打开" }));
  expect(screen.getByRole("dialog")).toHaveStyle({ left: savedLeft });
});

test("malformed and unavailable storage leave controls usable and do not emit restore callbacks", () => {
  localStorage.setItem("mtone:layout:v1:panel-collapse:invalid", "{");
  const result = render(<Panel storageKey="invalid" items={items} defaultCollapsed />);
  expect(screen.getByRole("button", { name: "展开面板" })).toBeVisible();
  result.unmount();
  const onCollapsedChange = vi.fn();
  const blocked = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("denied", "SecurityError");
  });
  try {
    render(<Panel storageKey="invalid" items={items} onCollapsedChange={onCollapsedChange} />);
    expect(onCollapsedChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "收起面板" }));
    expect(onCollapsedChange).toHaveBeenCalledExactlyOnceWith(true);
  } finally {
    blocked.mockRestore();
  }
});

test("restores each new Sidebar key independently and does not save default state", () => {
  const component = (storageKey: string) => (
    <Sidebar storageKey={storageKey} collapsible>Navigation</Sidebar>
  );
  const view = render(component("first"));
  expect(localStorage.length).toBe(0);
  fireEvent.click(screen.getByRole("button", { name: "收起侧边栏" }));
  view.rerender(component("second"));
  expect(screen.getByRole("button", { name: "收起侧边栏" })).toBeVisible();
  view.rerender(component("first"));
  expect(screen.getByRole("button", { name: "展开侧边栏" })).toBeVisible();
});

test("responsive collapse does not overwrite the saved AdminLayout preference", () => {
  const media = new EventTarget() as MediaQueryList;
  Object.defineProperty(media, "matches", { value: true });
  const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue(media);
  const mount = (breakpoint?: number) => render(
    <AdminLayout><AdminLayout.Sider collapsible storageKey="responsive" breakpoint={breakpoint} /></AdminLayout>,
  );
  try {
    const first = mount();
    fireEvent.click(screen.getByRole("button", { name: "收起侧边栏" }));
    fireEvent.click(screen.getByRole("button", { name: "展开侧边栏" }));
    first.unmount();
    const narrow = mount(720);
    expect(screen.getByRole("button", { name: "展开侧边栏" })).toBeVisible();
    narrow.unmount();
    mount();
    expect(screen.getByRole("button", { name: "收起侧边栏" })).toBeVisible();
  } finally {
    matchMedia.mockRestore();
  }
});

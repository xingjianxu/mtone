import React from "react";
import { fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import * as M from "../packages/mtone/src";

test("discloses inline child navigation with an independent current leaf", async () => {
  const user = userEvent.setup();
  render(<M.Sidebar><M.NavGroup label="Account"><M.NavSubmenu label="Billing">
    <M.NavItem active>Usage</M.NavItem>
  </M.NavSubmenu><M.NavItem>Email</M.NavItem></M.NavGroup></M.Sidebar>);
  const trigger = screen.getByRole("button", { name: "Billing" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(trigger).not.toHaveAttribute("aria-current");
  expect(screen.queryByRole("button", { name: "Usage" })).toBeNull();
  trigger.focus();
  await user.keyboard("{Enter}");
  const child = screen.getByRole("button", { name: "Usage" });
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(document.getElementById(trigger.getAttribute("aria-controls")!)).toContainElement(child);
  expect(trigger).not.toContainElement(child);
  expect(child).toHaveAttribute("aria-current", "page");
  await user.keyboard(" ");
  expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("controlled inline state and disabled submenus do not drift", () => {
  const change = vi.fn();
  const view = (props: { expanded: boolean; disabled?: boolean }) => <M.NavSubmenu label="Billing" onExpandedChange={change} {...props}><M.NavItem>Usage</M.NavItem></M.NavSubmenu>;
  const { rerender } = render(view({ expanded: false }));
  const trigger = screen.getByRole("button", { name: "Billing" });
  fireEvent.click(trigger);
  expect(change).toHaveBeenCalledWith(true);
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  rerender(view({ expanded: true, disabled: true }));
  expect(trigger).toBeDisabled();
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("button", { name: "Usage" })).toBeVisible();
});

test("compact popup provides full leaf buttons, closes on selection, and preserves inline state", async () => {
  const user = userEvent.setup();
  const selected = vi.fn();
  const view = (collapsed: boolean) => <M.Sidebar collapsible collapsed={collapsed}>
    <M.NavSubmenu label="Billing" defaultExpanded>
      <M.NavItem active onClick={selected}>Usage</M.NavItem>
      <M.NavItem disabled>Disabled</M.NavItem>
    </M.NavSubmenu>
  </M.Sidebar>;
  const { rerender } = render(view(false));
  expect(screen.getByRole("button", { name: "Usage" })).toBeVisible();
  rerender(view(true));
  const trigger = screen.getByRole("button", { name: "Billing" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  trigger.focus();
  await user.keyboard("{Enter}");
  const popup = await screen.findByRole("dialog", { name: "Billing" });
  const usage = within(popup).getByRole("button", { name: "Usage" });
  expect(usage).not.toHaveClass("mt-nav-item-collapsed");
  expect(usage).toHaveAttribute("aria-current", "page");
  await waitFor(() => expect(usage).toHaveFocus());
  await user.click(usage);
  expect(selected).toHaveBeenCalledOnce();
  await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
  rerender(view(false));
  expect(screen.getByRole("button", { name: "Usage" })).toBeVisible();
  rerender(view(true));
  expect(screen.getByRole("button", { name: "Billing" })).toHaveAttribute("aria-expanded", "false");
});

test("marks only the parent label when a child NavItem is current", () => {
  const view = (active: boolean) => (
    <M.NavSubmenu label="Billing">
      <>
        <M.NavItem active={active}>Usage</M.NavItem>
        <M.NavItem>History</M.NavItem>
      </>
    </M.NavSubmenu>
  );
  const { rerender } = render(view(true));
  const parent = screen.getByRole("button", { name: "Billing" });
  const label = screen.getByText("Billing");
  expect(label).toHaveClass("mt-nav-submenu-label-active");
  expect(parent).not.toHaveClass("mt-active");
  expect(parent).not.toHaveAttribute("aria-current");
  expect(parent).toHaveAttribute("aria-expanded", "false");

  rerender(view(false));
  expect(label).not.toHaveClass("mt-nav-submenu-label-active");
});

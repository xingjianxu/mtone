import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { Menu, Popover, type MenuEntry } from "../packages/mtone/src";

// jsdom lacks the PointerEvent used by Base UI keyboard command activation.
if (!window.PointerEvent)
  window.PointerEvent = class extends MouseEvent {
    pointerType;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerType = init.pointerType ?? "";
    }
  } as typeof PointerEvent;

const entries: MenuEntry[] = [
  { key: "open", label: "Open document" },
  { type: "checkbox", key: "favorite", label: "Favorite" },
  { key: "unavailable", label: "Unavailable", disabled: true },
  {
    key: "export",
    label: "Export",
    children: [{ key: "pdf", label: "PDF" }],
  },
];

it("renders an inline triggerless menu in normal DOM flow and supports keyboard commands", async () => {
  const user = userEvent.setup();
  const select = vi.fn();
  render(
    <>
      <button>Before</button>
      <Menu label="Document actions" items={entries} onSelect={select} />
      <button>After</button>
    </>,
  );
  const menu = screen.getByRole("menu", { name: "Document actions" });
  expect(menu.parentElement).not.toBe(document.body);
  expect(
    screen.getAllByRole("button").map((button) => button.textContent),
  ).toEqual(["Before", "After"]);
  await user.tab();
  expect(screen.getByRole("button", { name: "Before" })).toHaveFocus();
  await user.tab();
  expect(menu).toHaveFocus();
  await user.keyboard("{ArrowDown}");
  await waitFor(() =>
    expect(
      within(menu).getByRole("menuitem", { name: "Open document" }),
    ).toHaveFocus(),
  );
  await user.keyboard("{Enter}");
  expect(select).toHaveBeenCalledExactlyOnceWith("open");
  expect(menu).toBeVisible();
  await user.tab();
  expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
  await user.tab({ shift: true });
  expect(menu.contains(document.activeElement)).toBe(true);
  await user.tab({ shift: true });
  expect(screen.getByRole("button", { name: "Before" })).toHaveFocus();
});

it("server-renders inline rows and gives RTL submenus the corresponding arrow key", async () => {
  const markup = renderToStaticMarkup(
    <Menu label="Inline actions" items={entries} />,
  );
  expect(markup).toMatch(/role="menu" aria-label="Inline actions"/);
  expect(markup).toContain("Open document");
  expect(markup).not.toContain('aria-haspopup="dialog"');

  const user = userEvent.setup();
  render(
    <DirectionProvider direction="rtl">
      <Menu label="RTL actions" items={entries} />
    </DirectionProvider>,
  );
  const menu = screen.getByRole("menu", { name: "RTL actions" });
  menu.focus();
  await user.keyboard("{End}");
  const expand = within(menu).getByRole("menuitem", { name: "Export" });
  expect(expand).toHaveFocus();
  await user.keyboard("{ArrowLeft}");
  const pdf = await screen.findByRole("menuitem", { name: "PDF" });
  await waitFor(() => expect(pdf).toHaveFocus());
  await user.keyboard("{ArrowRight}");
  await waitFor(() =>
    expect(
      screen.queryByRole("menuitem", { name: "PDF" }),
    ).not.toBeInTheDocument(),
  );
  expect(expand).toHaveFocus();
});

it("navigates inline check and radio commands without losing focus or firing a leaf callback", async () => {
  const user = userEvent.setup();
  const select = vi.fn();
  const checked = vi.fn();
  const change = vi.fn();
  render(
    <Menu
      label="View options"
      onSelect={select}
      items={[
        {
          type: "checkbox",
          key: "p",
          label: "Preview",
          defaultChecked: true,
          onCheckedChange: checked,
        },
        { key: "disabled", label: "Unavailable", disabled: true },
        {
          type: "radio-group",
          key: "density",
          label: "Density",
          defaultValue: "normal",
          onValueChange: change,
          children: [
            { key: "normal", label: "Normal" },
            { key: "dense", label: "Dense" },
          ],
        },
      ]}
    />,
  );
  await user.tab();
  await user.keyboard("{ArrowDown} ");
  const preview = screen.getByRole("menuitemcheckbox", { name: "Preview" });
  expect(preview).toHaveFocus();
  expect(preview).toHaveAttribute("aria-checked", "false");
  expect(checked).toHaveBeenCalledWith(false);
  await user.keyboard("{ArrowDown}");
  expect(screen.getByRole("menuitemradio", { name: "Normal" })).toHaveFocus();
  await user.keyboard("{End}{Enter}");
  const dense = screen.getByRole("menuitemradio", { name: "Dense" });
  expect(dense).toHaveFocus();
  expect(dense).toHaveAttribute("aria-checked", "true");
  expect(change).toHaveBeenCalledExactlyOnceWith("dense");
  expect(select).not.toHaveBeenCalled();
});

it("mounts one menu popup through Popover.Menu, preserving checkbox and command dismissal", async () => {
  const user = userEvent.setup();
  const select = vi.fn();
  render(<Popover.Menu trigger="Actions" items={entries} onSelect={select} />);
  const trigger = screen.getByRole("button", { name: "Actions" });
  await user.tab();
  expect(trigger).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(trigger).toHaveAttribute("aria-haspopup", "menu");
  await screen.findByRole("menu");
  expect(screen.getAllByRole("menu")).toHaveLength(1);
  const favorite = screen.getByRole("menuitemcheckbox", { name: "Favorite" });
  await user.click(favorite);
  expect(favorite).toHaveAttribute("aria-checked", "true");
  expect(screen.getByRole("menu")).toBeVisible();
  await user.click(screen.getByRole("menuitem", { name: "Open document" }));
  expect(select).toHaveBeenCalledExactlyOnceWith("open");
  await waitFor(() =>
    expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
  );
  await waitFor(() => expect(trigger).toHaveFocus());
});

it("allows ordinary Popover content around a Menu; Escape closes its submenu before the host", async () => {
  const user = userEvent.setup();
  const select = vi.fn();
  const footer = vi.fn();
  render(
    <Popover
      trigger="Details"
      title="Document"
      content={
        <>
          <p>Description</p>
          <Menu label="Document actions" onSelect={select} items={entries} />
          <button onClick={footer}>Footer action</button>
        </>
      }
    />,
  );
  const trigger = screen.getByRole("button", { name: "Details" });
  await user.click(trigger);
  const dialog = screen.getByRole("dialog", { name: "Document" });
  const inline = within(dialog).getByRole("menu", { name: "Document actions" });
  await user.click(
    within(dialog).getByRole("button", { name: "Footer action" }),
  );
  expect(footer).toHaveBeenCalledOnce();
  await user.click(
    within(inline).getByRole("menuitem", { name: "Open document" }),
  );
  expect(select).toHaveBeenCalledExactlyOnceWith("open");
  expect(dialog).toBeVisible();
  const expand = within(inline).getByRole("menuitem", { name: "Export" });
  expand.focus();
  await user.keyboard("{ArrowRight}");
  const pdf = await screen.findByRole("menuitem", { name: "PDF" });
  await waitFor(() => expect(pdf).toHaveFocus());
  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(
      screen.queryByRole("menuitem", { name: "PDF" }),
    ).not.toBeInTheDocument(),
  );
  expect(dialog).toBeVisible();
  await waitFor(() => expect(expand).toHaveFocus());
  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  await waitFor(() => expect(trigger).toHaveFocus());
});

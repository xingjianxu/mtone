import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Menubar } from "../packages/mtone/src/interactive";
const menus = [
  {
    key: "file",
    label: "File",
    items: [
      { key: "new", label: "New" },
      {
        key: "recent",
        label: "Recent",
        children: [{ key: "project", label: "Project" }],
      },
    ],
  },
  { key: "edit", label: "Edit", items: [{ key: "copy", label: "Copy" }] },
  {
    key: "locked",
    label: "Locked",
    disabled: true,
    items: [{ key: "hidden", label: "Hidden" }],
  },
];
// jsdom does not implement PointerEvent, used by Base UI keyboard activation.
if (!window.PointerEvent)
  window.PointerEvent = class extends MouseEvent {
    readonly pointerType: string;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerType = init.pointerType ?? "mouse";
    }
  } as typeof PointerEvent;
describe("Menubar", () => {
  it("exports a menubar component", () =>
    expect(Menubar).toBeTypeOf("function"));
  it("has one tab stop and navigates top-level menus", async () => {
    const user = userEvent.setup();
    render(<Menubar aria-label="Editor" menus={menus} />);
    expect(screen.getByRole("menubar", { name: "Editor" })).toBeVisible();
    await user.tab();
    expect(screen.getByRole("menuitem", { name: "File" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(await screen.findByRole("menuitem", { name: "Copy" })).toHaveFocus();
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus(),
    );
  });
  it("selects nested leaves once", async () => {
    const user = userEvent.setup(),
      select = vi.fn();
    render(<Menubar menus={menus} onSelect={select} />);
    await user.tab();
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowRight}");
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "Project" })).toHaveFocus(),
    );
    await user.keyboard("{Enter}");
    expect(select).toHaveBeenCalledExactlyOnceWith("project", "file");
  });
  it("supports controlled open keys without changing them internally", async () => {
    const change = vi.fn();
    render(<Menubar menus={menus} openKey="file" onOpenChange={change} />);
    expect(await screen.findByRole("menuitem", { name: "New" })).toBeVisible();
    await userEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    expect(change).toHaveBeenCalledWith("edit");
    expect(
      screen.queryByRole("menuitem", { name: "Copy" }),
    ).not.toBeInTheDocument();
  });
  it("keeps checkbox and radio choices open", async () => {
    const check = vi.fn(),
      radio = vi.fn();
    const user = userEvent.setup();
    render(
      <Menubar
        menus={[
          {
            key: "view",
            label: "View",
            items: [
              {
                type: "checkbox",
                key: "sidebar",
                label: "Sidebar",
                onCheckedChange: check,
              },
              {
                type: "radio-group",
                key: "density",
                label: "Density",
                defaultValue: "compact",
                onValueChange: radio,
                children: [
                  { key: "compact", label: "Compact" },
                  { key: "roomy", label: "Roomy" },
                ],
              },
            ],
          },
        ]}
      />,
    );
    await user.click(screen.getByRole("menuitem", { name: "View" }));
    await user.click(
      await screen.findByRole("menuitemcheckbox", { name: "Sidebar" }),
    );
    expect(check).toHaveBeenCalledWith(true);
    expect(
      screen.getByRole("menuitemcheckbox", { name: "Sidebar" }),
    ).toBeChecked();
    await user.click(screen.getByRole("menuitemradio", { name: "Roomy" }));
    expect(radio).toHaveBeenCalledWith("roomy");
    expect(screen.getByRole("menu")).toBeVisible();
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
    await user.click(screen.getByRole("menuitem", { name: "View" }));
    expect(
      await screen.findByRole("menuitemcheckbox", { name: "Sidebar" }),
    ).toBeChecked();
    expect(screen.getByRole("menuitemradio", { name: "Roomy" })).toBeChecked();
  });
  it("switches open menus on hover but does not open a closed click bar", async () => {
    const user = userEvent.setup();
    render(<Menubar menus={menus} />);
    await user.hover(screen.getByRole("menuitem", { name: "File" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "File" }));
    await screen.findByRole("menuitem", { name: "New" });
    await user.hover(screen.getByRole("menuitem", { name: "Edit" }));
    expect(await screen.findByRole("menuitem", { name: "Copy" })).toBeVisible();
    expect(
      screen.queryByRole("menuitem", { name: "New" }),
    ).not.toBeInTheDocument();
  });
  it("supports RTL arrows and does not loop when disabled", async () => {
    const user = userEvent.setup();
    render(
      <DirectionProvider direction="rtl">
        <Menubar menus={menus.slice(0, 2)} loop={false} />
      </DirectionProvider>,
    );
    await user.tab();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("menuitem", { name: "File" })).toHaveFocus();
  });
  it("closes on outside click and remains usable after reopening", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Menubar menus={menus} />
        <button>Outside</button>
      </>,
    );
    await user.click(screen.getByRole("menuitem", { name: "File" }));
    await screen.findByRole("menuitem", { name: "New" });
    await user.click(screen.getByRole("button", { name: "Outside" }));
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
    await user.click(screen.getByRole("menuitem", { name: "Edit" }));
    expect(await screen.findByRole("menuitem", { name: "Copy" })).toBeVisible();
  });
  it("opens hover mode without clicking and closes when pointer leaves", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Menubar menus={menus} trigger="hover" />
        <button>Outside</button>
      </>,
    );
    await user.hover(screen.getByRole("menuitem", { name: "File" }));
    expect(await screen.findByRole("menuitem", { name: "New" })).toBeVisible();
    await user.hover(screen.getByRole("button", { name: "Outside" }));
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
  });
  it("allows crossing a hover gap before entering its popup", async () => {
    const user = userEvent.setup();
    render(<Menubar menus={menus} trigger="hover" />);
    await user.hover(screen.getByRole("menuitem", { name: "File" }));
    const leaf = await screen.findByRole("menuitem", { name: "New" });
    await user.hover(document.body);
    await user.hover(leaf);
    await new Promise((resolve) => setTimeout(resolve, 220));
    expect(leaf).toBeVisible();
  });
});

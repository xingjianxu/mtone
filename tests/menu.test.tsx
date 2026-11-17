import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Menu,
  DropdownMenu,
  type MenuEntry,
} from "../packages/mtone/src/interactive";

const items: MenuEntry[] = [
  {
    type: "group",
    key: "files",
    label: "Files",
    children: [
      { key: "new", label: "New" },
      {
        key: "export",
        label: "Export",
        children: [
          { key: "pdf", label: "PDF" },
          { key: "doc", label: "DOC", disabled: true },
        ],
      },
    ],
  },
  { type: "divider", key: "separator" },
  {
    key: "locked",
    label: "Locked",
    disabled: true,
    children: [{ key: "secret", label: "Secret" }],
  },
];

describe("Menu", () => {
  it("keeps DropdownMenu as the same compatibility export", () => {
    expect(Menu).toBeTypeOf("function");
    expect(DropdownMenu).toBe(Menu);
  });
  it("renders named groups and separators without selectable headings", async () => {
    render(<Menu trigger={<button>Actions</button>} items={items} />);
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    expect(await screen.findByRole("group", { name: "Files" })).toBeVisible();
    expect(screen.getByRole("separator")).toBeVisible();
    expect(
      screen.queryByRole("menuitem", { name: "Files" }),
    ).not.toBeInTheDocument();
  });
  it("opens a submenu without selecting the parent and invokes a leaf once", async () => {
    const select = vi.fn();
    const leaf = vi.fn();
    const parent = vi.fn();
    render(
      <Menu
        trigger={<button>Actions</button>}
        onSelect={select}
        items={[
          {
            key: "parent",
            label: "Export",
            onSelect: parent,
            children: [{ key: "pdf", label: "PDF", onSelect: leaf }],
          },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Export" }),
    );
    expect(select).not.toHaveBeenCalled();
    expect(parent).not.toHaveBeenCalled();
    await userEvent.click(await screen.findByRole("menuitem", { name: "PDF" }));
    expect(select).toHaveBeenCalledExactlyOnceWith("pdf");
    expect(leaf).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
  });
  it("navigates right into a submenu and left back, then restores the trigger on Escape", async () => {
    render(<Menu trigger={<button>Actions</button>} items={items} />);
    const trigger = screen.getByRole("button", { name: "Actions" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "New" })).toHaveFocus(),
    );
    await userEvent.keyboard("{ArrowDown}{ArrowRight}");
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "PDF" })).toHaveFocus(),
    );
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "Export" })).toHaveFocus(),
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  });
  it("does not open disabled parents", async () => {
    render(<Menu trigger={<button>Actions</button>} items={items} />);
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Locked" }),
    );
    expect(
      screen.queryByRole("menuitem", { name: "Secret" }),
    ).not.toBeInTheDocument();
  });
});

it("reserves a thin highlight border and removes the legacy thick outline", async () => {
  const { readFileSync } = await import("node:fs");
  const css = readFileSync("packages/mtone/src/interactive.css", "utf8");
  const shared = readFileSync("packages/mtone/src/styles.css", "utf8");
  expect(css).toMatch(/\.mt-menu-item\s*\{[^}]*border: 1px solid transparent/s);
  expect(css).toMatch(
    /\.mt-menu-item\[data-highlighted\]:not\(\[data-disabled\]\)\s*\{[^}]*border-color: #93b4dc/s,
  );
  expect(shared).not.toMatch(
    /\.mt-menu-item\[data-highlighted\][^{]*\{[^}]*outline: 2px/s,
  );
});

it("keeps controlled state and supports repeated open and close cycles", async () => {
  const select = vi.fn();
  function Demo() {
    const [open, setOpen] = React.useState(false);
    return (
      <Menu
        open={open}
        onOpenChange={setOpen}
        trigger={<button>Toggle</button>}
        items={[{ key: "leaf", label: "Leaf" }]}
        onSelect={select}
      />
    );
  }
  render(<Demo />);
  for (let i = 0; i < 2; i++) {
    await userEvent.click(screen.getByRole("button", { name: "Toggle" }));
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Leaf" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
  }
  expect(select).toHaveBeenCalledTimes(2);
});

it("shares groups and submenus with ContextMenu, respecting disabled leaves", async () => {
  const { ContextMenu } = await import("../packages/mtone/src/interactive");
  const { fireEvent } = await import("@testing-library/react");
  const select = vi.fn();
  render(
    <ContextMenu items={items} onSelect={select}>
      <div>Target</div>
    </ContextMenu>,
  );
  fireEvent.contextMenu(screen.getByText("Target"));
  await userEvent.click(
    await screen.findByRole("menuitem", { name: "Export" }),
  );
  await userEvent.click(await screen.findByRole("menuitem", { name: "DOC" }));
  expect(select).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("menuitem", { name: "PDF" }));
  expect(select).toHaveBeenCalledExactlyOnceWith("pdf");
});

it('positions RTL submenus on the logical end side', async () => {
  const {readFileSync}=await import('node:fs');
  expect(readFileSync('packages/mtone/src/interactive.tsx','utf8')).toContain('side="inline-end"');
  const {DirectionProvider}=await import('@base-ui/react/direction-provider');
  render(<DirectionProvider direction="rtl"><Menu trigger={<button>RTL actions</button>} items={[{key:'parent',label:'Parent',children:[{key:'child',label:'Child'}]}]}/></DirectionProvider>);
  await userEvent.click(screen.getByRole('button',{name:'RTL actions'}));
  await userEvent.click(await screen.findByRole('menuitem',{name:'Parent'}));
  const child=await screen.findByRole('menuitem',{name:'Child'});
  await waitFor(()=>expect(child.closest('[role="menu"]')).toHaveAttribute('data-side','inline-end')); // Base UI exposes the logical side; jsdom cannot verify physical geometry.
});

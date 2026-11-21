import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Popover, Menu, ContextMenu } from "../packages/mtone/src";
import { readFileSync } from "node:fs";

describe("Popover", () => {
  it("renders independent custom content with named nonmodal dialog semantics", async () => {
    render(
      <Popover
        trigger={<button>Details</button>}
        label="Details panel"
        content={<input aria-label="Name" />}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Details" }));
    expect(
      await screen.findByRole("dialog", { name: "Details panel" }),
    ).toBeVisible();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await userEvent.type(
      screen.getByRole("textbox", { name: "Name" }),
      "Alice",
    );
    expect(screen.getByRole("dialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "Details" })).toHaveFocus();
  });
  it("supports controlled state, default labels and repeated reopen", async () => {
    const change = vi.fn();
    function Demo() {
      const [open, setOpen] = React.useState(false);
      return (
        <Popover
          trigger={<button>Open</button>}
          content={<button onClick={() => setOpen(false)}>Done</button>}
          open={open}
          onOpenChange={(next) => {
            change(next);
            setOpen(next);
          }}
        />
      );
    }
    render(<Demo />);
    for (let n = 0; n < 2; n++) {
      await userEvent.click(screen.getByRole("button", { name: "Open" }));
      expect(
        await screen.findByRole("dialog", { name: "浮层内容" }),
      ).toBeVisible();
      await userEvent.click(screen.getByRole("button", { name: "Done" }));
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    }
    expect(change).toHaveBeenCalledWith(true);
  });
  it("keeps explicit width on the panel rather than the trigger", async () => {
    render(
      <Popover
        trigger={<button>Open</button>}
        width={240}
        align="right"
        defaultOpen
        content="Content"
      />,
    );
    const panel = await screen.findByRole("dialog");
    expect(panel).toHaveStyle({ width: "240px", minWidth: "0" });
    expect(screen.getByRole("button", { name: "Open" })).not.toHaveAttribute(
      "width",
    );
  });
  it.each([
    ["ltr", "left", "start"],
    ["ltr", "right", "end"],
    ["rtl", "left", "end"],
    ["rtl", "right", "start"],
    ["rtl", "start", "start"],
    ["rtl", "end", "end"],
  ] as const)(
    "maps %s %s to %s without changing semantics",
    async (direction, align, expected) => {
      render(
        <DirectionProvider direction={direction}>
          <Popover
            trigger={<button>Open</button>}
            align={align}
            defaultOpen
            content="Content"
          />
        </DirectionProvider>,
      );
      const panel = await screen.findByRole("dialog");
      await waitFor(() =>
        expect(panel).toHaveAttribute("data-align", expected),
      );
    },
  );
});

describe("Menu sizing", () => {
  it("applies a main-panel width while preserving menu semantics and independent submenu width", async () => {
    render(
      <Menu
        trigger={<button>Actions</button>}
        width="220px"
        align="right"
        items={[
          {
            key: "p",
            label: "Parent",
            children: [{ key: "c", label: "Child" }],
          },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    const parent = await screen.findByRole("menu");
    expect(parent).toHaveStyle({ width: "220px" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("menuitem", { name: "Parent" }));
    const child = await screen.findByRole("menuitem", { name: "Child" });
    expect(child.closest('[role="menu"]')).toHaveStyle({
      width: "max-content",
    });
  });
  it("overrides anchor-based width only for the shared floating surface", () => {
    const css = readFileSync("packages/mtone/src/interactive.css", "utf8");
    expect(css).toMatch(
      /\.mt-floating-popup\s*\{[^}]*max-width:[^;]*--available-width/s,
    );
    expect(css).toMatch(/\.mt-floating-popup\s*\{[^}]*min-width: min\(160px/s);
    const defaults = css.slice(css.indexOf(".mt-popup {")).split("}")[0];
    expect(defaults).toContain("var(--anchor-width");
  });
});

it('preserves Base UI pointer offsets for ContextMenu instead of overriding them',()=>{
  const source=readFileSync('packages/mtone/src/floating-surface.tsx','utf8');
  expect(source).toContain('kind === "context" ? undefined');
  expect(source).not.toContain('kind === "context" ? 0 : 4');
});

it('allows long shortcut text to shrink and wrap within a narrow menu',()=>{
  const css=readFileSync('packages/mtone/src/interactive.css','utf8');
  expect(css).toMatch(/\.mt-floating-popup \.mt-shortcut\s*\{[^}]*min-width: 0;[^}]*max-width: 40%;[^}]*overflow-wrap: anywhere/s);
});

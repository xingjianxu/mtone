import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, expectTypeOf, test, vi } from "vitest";
import { Button, ButtonGroup, Select, Toolbar, type ToolbarProps } from "../packages/mtone/src";

test("groups standalone controls without managing their state or native tab order", async () => {
  const user = userEvent.setup();
  const onExport = vi.fn();
  const ref = React.createRef<HTMLDivElement>();
  const { container } = render(<>
    <Toolbar
      aria-label="Project controls"
      title="Independent toolbar"
      dir="rtl"
      className="custom"
      style={{ marginBlockEnd: 7 }}
      ref={ref}
      search={<input aria-label="Search projects" />}
      start={<button type="button">Filter</button>}
      end={<button type="button" onClick={onExport}>Export</button>}
    />
    <button type="button">Outside</button>
  </>);
  const group = screen.getByRole("group", { name: "Project controls" });
  expect(group).toBe(ref.current);
  expect(group).toHaveAttribute("dir", "rtl");
  expect(group).toHaveAttribute("title", "Independent toolbar");
  expect(group).toHaveClass("custom");
  expect(group.style.marginBlockEnd).toBe("7px");
  expect(group).toHaveAttribute("data-background", "white");
  expect(container.querySelector("table")).toBeNull();
  expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  const search = within(group).getByRole("textbox", { name: "Search projects" });
  await user.tab();
  expect(search).toHaveFocus();
  await user.keyboard("roadmap");
  expect(search).toHaveValue("roadmap");
  await user.tab();
  expect(within(group).getByRole("button", { name: "Filter" })).toHaveFocus();
  await user.tab();
  expect(within(group).getByRole("button", { name: "Export" })).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(onExport).toHaveBeenCalledOnce();
  await user.tab();
  expect(screen.getByRole("button", { name: "Outside" })).toHaveFocus();
});

test("supports gray and white surfaces, optional slots and an optional accessible name", () => {
  expectTypeOf<ToolbarProps["background"]>().toEqualTypeOf<"white" | "gray" | undefined>();
  const { container } = render(<>
    <p id="page-controls-label">Page controls</p>
    <Toolbar aria-labelledby="page-controls-label" background="gray" end={<button type="button">Publish</button>} />
    <Toolbar data-testid="unnamed" start={0} />
    <Toolbar data-testid="custom-role" aria-label="Header commands" role="region" search={false} end={null} />
  </>);
  const group = screen.getByRole("group", { name: "Page controls" });
  expect(group).toHaveAttribute("data-background", "gray");
  expect(group.querySelector(".mt-toolbar-search, .mt-toolbar-start")).toBeNull();
  expect(within(group).getByRole("button", { name: "Publish" })).toBeVisible();
  expect(screen.getByTestId("unnamed")).not.toHaveAttribute("role");
  expect(screen.getByTestId("unnamed")).toHaveTextContent("0");
  expect(screen.getByRole("region", { name: "Header commands" })).toBe(screen.getByTestId("custom-role"));
  expect(container.querySelector("#page-controls-label")).toBeVisible();
});

test("enables borderless controls only on gray toolbars without changing control semantics", async () => {
  expectTypeOf<ToolbarProps["controlStyle"]>().toEqualTypeOf<"default" | "borderless" | undefined>();
  const user = userEvent.setup();
  const select = vi.fn();
  render(<>
    <Toolbar
      aria-label="Quiet controls"
      background="gray"
      controlStyle="borderless"
      start={<>
        <Button disabled>Unavailable</Button>
        <Select label="Labels" options={[{ value: "bug", label: "Bug" }]} onValueChange={select} />
      </>}
      end={<ButtonGroup connected><Button>List</Button><Button>Compact</Button></ButtonGroup>}
    />
    <Toolbar aria-label="Regular gray" background="gray" />
    <Toolbar aria-label="Regular white" controlStyle="borderless" />
  </>);

  const toolbar = screen.getByRole("group", { name: "Quiet controls" });
  expect(toolbar).toHaveAttribute("data-control-style", "borderless");
  expect(screen.getByRole("group", { name: "Regular gray" })).toHaveAttribute("data-control-style", "default");
  expect(screen.getByRole("group", { name: "Regular white" })).toHaveAttribute("data-control-style", "default");
  expect(within(toolbar).getByRole("button", { name: "Unavailable" })).toBeDisabled();
  const trigger = within(toolbar).getByRole("combobox", { name: "Labels" });
  await user.tab();
  expect(trigger).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  await user.click(await screen.findByRole("option", { name: "Bug" }));
  expect(select).toHaveBeenCalledWith("bug");
  expect(within(toolbar).getByRole("button", { name: "List" }).closest(".mt-button-group")).toHaveClass("mt-button-group-connected");
});

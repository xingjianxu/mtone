import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { MtoneProvider, Popover } from "../packages/mtone/src";

test("exports the searchable component name without the unreleased Select alias", () => {
  expect(Popover.SearchableSelect).toBeTypeOf("function");
  expect(Popover).not.toHaveProperty("Select");
});

const items = [
  { value: "mtone", label: "mtone", icon: <span>◇</span> },
  { value: "disabled", label: "Archived", disabled: true },
  { value: "vault", label: "Vault Sync" },
  { value: "nix", label: "Nix Config" },
];

test("opens a searchable single-choice dialog; commits with the keyboard and resets the query", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<MtoneProvider locale="en">
    <Popover.SearchableSelect trigger="Choose repository" title="Switch repository" items={items}
      defaultValue="mtone" onValueChange={onValueChange} />
  </MtoneProvider>);
  const trigger = screen.getByRole("button", { name: "Choose repository" });
  await user.click(trigger);
  const dialog = await screen.findByRole("dialog", { name: "Switch repository" });
  const search = within(dialog).getByRole("combobox", { name: "Search options" });
  const list = within(dialog).getByRole("listbox");
  expect(search).toHaveAttribute("aria-controls", list.id);
  expect(within(list).getByRole("option", { name: "mtone", selected: true })).toBeVisible();
  expect(within(list).getByRole("option", { name: "Archived" })).toHaveAttribute("aria-disabled", "true");
  fireEvent.keyDown(search, { key: "ArrowDown" });
  expect(search).toHaveAttribute("aria-activedescendant", within(list).getByRole("option", { name: "Vault Sync" }).id);
  fireEvent.change(search, { target: { value: "  NIX  " } });
  expect(within(list).getAllByRole("option")).toHaveLength(1);
  fireEvent.keyDown(search, { key: "Enter" });
  expect(onValueChange).toHaveBeenCalledExactlyOnceWith("nix");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await user.click(trigger);
  const reopened = await screen.findByRole("dialog");
  expect(within(reopened).getByRole("combobox")).toHaveValue("");
  expect(within(reopened).getByRole("option", { name: "Nix Config", selected: true })).toBeVisible();
});

test("honors controlled selection, ignores disabled options and composition, and handles no results", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  const onOpenChange = vi.fn();
  render(<MtoneProvider locale="en">
    <Popover.SearchableSelect trigger={<button>Projects</button>} label="Project picker" items={items}
      value="mtone" onValueChange={onValueChange} onOpenChange={onOpenChange} />
  </MtoneProvider>);
  const trigger = screen.getByRole("button", { name: "Projects" });
  await user.click(trigger);
  const dialog = await screen.findByRole("dialog", { name: "Project picker" });
  const search = within(dialog).getByRole("combobox");
  await user.click(within(dialog).getByRole("option", { name: "Archived" }));
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.change(search, { target: { value: "missing" } });
  expect(within(dialog).getByRole("status")).toHaveTextContent("No matching options");
  expect(search).not.toHaveAttribute("aria-activedescendant");
  fireEvent.keyDown(search, { key: "Enter" });
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.change(search, { target: { value: "Vault" } });
  fireEvent.compositionStart(search);
  fireEvent.keyDown(search, { key: "Enter" });
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.compositionEnd(search);
  await user.click(within(dialog).getByRole("option", { name: "Vault Sync" }));
  expect(onValueChange).toHaveBeenCalledExactlyOnceWith("vault");
  expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  await user.click(trigger);
  expect(await screen.findByRole("option", { name: "mtone", selected: true })).toBeVisible();
});

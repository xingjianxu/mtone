import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, expectTypeOf, test, vi } from "vitest";
import { MtoneProvider, Popover, Select, type SelectPopupSearchProps, type SelectSingleProps } from "../packages/mtone/src";

const options = [
  { label: "Repositories", options: [
    { value: "mtone", label: "mtone" },
    { value: "disabled", label: "Archived", disabled: true },
    { value: "vault", label: "Vault Sync", searchText: "Vault Sync personal archive" },
    { value: "nix", label: "Nix Config" },
  ] },
  { value: "", label: "Default repository" },
];

test("removes the old Popover preset and exposes popup-only Select props", () => {
  expect(Popover).not.toHaveProperty("SearchableSelect");
  expect(Popover.Menu).toBeTypeOf("function");
  expectTypeOf<SelectPopupSearchProps["searchable"]>().toEqualTypeOf<"popup">();
  interface CustomSelect extends SelectSingleProps { example: boolean }
  expectTypeOf<CustomSelect["searchable"]>().toEqualTypeOf<boolean | undefined>();
});

test("opens a popup search from a string trigger, filters grouped custom rows and returns focus", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<MtoneProvider locale="en">
    <Select searchable="popup" trigger="Choose repository" popupTitle="Switch repository" options={options}
      defaultValue="mtone" onValueChange={onValueChange}
      renderOption={(option) => <><span aria-hidden="true">◇</span><strong>{option.label}</strong></>} />
  </MtoneProvider>);
  const trigger = screen.getByRole("button", { name: "Choose repository" });
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  await user.click(trigger);
  const dialog = await screen.findByRole("dialog", { name: "Switch repository" });
  const search = within(dialog).getByRole("combobox", { name: "Search options" });
  const list = within(dialog).getByRole("listbox");
  expect(search).toHaveFocus();
  expect(search).toHaveAttribute("aria-controls", list.id);
  expect(within(list).getByRole("group", { name: "Repositories" })).toBeVisible();
  expect(within(list).getByRole("option", { name: "mtone", selected: true })).toBeVisible();
  expect(within(list).getByRole("option", { name: "Archived" })).toHaveAttribute("aria-disabled", "true");
  await user.type(search, "personal archive");
  const option = within(list).getByRole("option", { name: "Vault Sync" });
  expect(within(option).getByText("Vault Sync").tagName).toBe("STRONG");
  expect(within(list).getAllByRole("option")).toHaveLength(1);
  await user.keyboard("{Enter}");
  expect(onValueChange).toHaveBeenCalledExactlyOnceWith("vault");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(await screen.findByRole("combobox")).toHaveValue("");
  expect(screen.getByRole("option", { name: "Vault Sync", selected: true })).toBeVisible();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

test("honors controlled selection, disabled options, composition and keyboard form boundaries", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  const onOpenChange = vi.fn();
  const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
  render(<MtoneProvider locale="en"><form onSubmit={submit}>
    <Select searchable="popup" trigger={<button>Projects</button>} popupTitle="Project picker" options={options}
      value="mtone" onValueChange={onValueChange} onOpenChange={onOpenChange} />
  </form></MtoneProvider>);
  const trigger = screen.getByRole("button", { name: "Projects" });
  await user.click(trigger);
  const dialog = await screen.findByRole("dialog", { name: "Project picker" });
  const search = within(dialog).getByRole("combobox");
  await user.click(within(dialog).getByRole("option", { name: "Archived" }));
  expect(onValueChange).not.toHaveBeenCalled();
  await user.type(search, "missing");
  expect(within(dialog).getByRole("status")).toHaveTextContent("No results");
  expect(search).not.toHaveAttribute("aria-activedescendant");
  await user.keyboard("{Enter}");
  expect(onValueChange).not.toHaveBeenCalled();
  expect(submit).not.toHaveBeenCalled();
  if (!screen.queryByRole("dialog")) await user.click(trigger);
  const editing = await screen.findByRole("combobox");
  await user.clear(editing);
  await user.type(editing, "Vault");
  fireEvent.compositionStart(editing);
  fireEvent.keyDown(editing, { key: "Enter", isComposing: true, keyCode: 229 });
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.compositionEnd(editing);
  await user.click(screen.getByRole("option", { name: "Vault Sync" }));
  expect(onValueChange).toHaveBeenCalledExactlyOnceWith("vault");
  expect(onOpenChange.mock.calls.at(-1)).toEqual([false]);
  await user.click(trigger);
  expect(await screen.findByRole("option", { name: "mtone", selected: true })).toBeVisible();
});

test("uses the selected label only in the default trigger and preserves native clear, validation and reset", async () => {
  const user = userEvent.setup();
  const { container } = render(<MtoneProvider locale="en"><form>
    <Select searchable="popup" clearable options={options} name="repo" required defaultValue="mtone"
      renderOption={(option) => <strong>{option.label} row</strong>} />
  </form></MtoneProvider>);
  const form = container.querySelector("form")!;
  await user.click(screen.getByRole("button", { name: "mtone" }));
  await user.click(await screen.findByRole("option", { name: "Default repository row" }));
  expect(screen.getByRole("button", { name: "Default repository" })).toHaveFocus();
  expect(new FormData(form).get("repo")).toBe("");
  expect(form.checkValidity()).toBe(true);
  await user.click(screen.getByRole("button", { name: "Clear selection" }));
  expect(screen.getByRole("button", { name: "Select…" })).toHaveFocus();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(form.checkValidity()).toBe(false);
  await act(async () => form.reset());
  expect(screen.getByRole("button", { name: "mtone" })).toBeVisible();
});

test("custom row rendering leaves fixed and multiple selected labels unchanged", async () => {
  const user = userEvent.setup();
  const renderRow = (option: { label: React.ReactNode }) => <strong>{option.label} row</strong>;
  render(<MtoneProvider locale="en">
    <div aria-label="Native single"><Select options={options} defaultValue="mtone" renderOption={renderRow} /></div>
    <div aria-label="Chips"><Select mode="multiple" options={options} defaultValue={["mtone"]} renderOption={renderRow} /></div>
  </MtoneProvider>);
  const single = within(screen.getByLabelText("Native single")).getByRole("combobox");
  expect(single).toHaveTextContent(/^mtone$/);
  await user.click(single);
  await user.click(await screen.findByRole("option", { name: "Vault Sync row" }));
  expect(single).toHaveTextContent(/^Vault Sync$/);
  const chips = within(screen.getByLabelText("Chips"));
  expect(chips.getByText("mtone")).toBeVisible();
  await user.click(chips.getByRole("combobox"));
  expect(within(await screen.findByRole("option", { name: "Vault Sync row" })).getByText("Vault Sync row").tagName).toBe("STRONG");
});

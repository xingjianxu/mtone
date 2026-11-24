import { readFileSync } from "node:fs";
import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SettingsDialog, Sidebar } from "../packages/mtone/src";

const categories = [
  {
    value: "general",
    label: "General",
    content: <input aria-label="Project" defaultValue="mtone" />,
  },
  { value: "editor", label: "Editor", content: <p>Editor options</p> },
];

afterEach(() => vi.unstubAllGlobals());

it("keeps visited settings mounted while switching accessible content", () => {
  render(
    <SettingsDialog title="Settings" defaultOpen categories={categories} />,
  );
  const dialog = screen.getByRole("dialog", { name: "Settings" });
  const input = within(dialog).getByRole("textbox", { name: "Project" });
  fireEvent.change(input, { target: { value: "Saved draft" } });
  fireEvent.click(within(dialog).getByRole("button", { name: "Editor" }));
  expect(within(dialog).getByText("Editor options")).toBeVisible();
  expect(within(dialog).queryByRole("textbox", { name: "Project" })).toBeNull();
  fireEvent.click(within(dialog).getByRole("button", { name: "General" }));
  expect(within(dialog).getByRole("textbox", { name: "Project" })).toHaveValue(
    "Saved draft",
  );
});

it("supports controlled categories and delegates search behavior to the caller", () => {
  const onValueChange = vi.fn();
  const { rerender } = render(
    <SettingsDialog
      title="Settings"
      defaultOpen
      categories={categories}
      value="general"
      onValueChange={onValueChange}
      search={({ selectCategory }) => (
        <button onClick={() => selectCategory("editor")}>Jump to editor</button>
      )}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Jump to editor" }));
  expect(onValueChange).toHaveBeenCalledWith("editor");
  expect(screen.getByRole("textbox", { name: "Project" })).toBeVisible();
  rerender(
    <SettingsDialog
      title="Settings"
      defaultOpen
      categories={categories}
      value="editor"
    />,
  );
  expect(screen.getByText("Editor options")).toBeVisible();
});

it("enters compact details and restores category focus when returning", () => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  render(
    <SettingsDialog title="Settings" defaultOpen categories={categories} />,
  );
  expect(screen.queryByText("Editor options")).toBeNull();
  expect(screen.queryByRole("textbox", { name: "Project" })).toBeNull();
  act(() => screen.getByRole("button", { name: "Editor" }).click());
  expect(screen.getByRole("heading", { name: "Editor" })).toHaveFocus();
  expect(screen.queryByRole("button", { name: "Editor" })).toBeNull();
  act(() => screen.getByRole("button", { name: /Back|返回/ }).click());
  expect(screen.getByRole("button", { name: "Editor" })).toHaveFocus();
  expect(screen.queryByRole("heading", { name: "Editor" })).toBeNull();
});

it("does not inherit a collapsed host sidebar", () => {
  render(
    <Sidebar collapsible defaultCollapsed>
      <SettingsDialog title="Settings" defaultOpen categories={categories} />
    </Sidebar>,
  );
  expect(screen.getByRole("button", { name: "General" })).not.toHaveClass(
    "mt-nav-item-collapsed",
  );
});

it("keeps compact details open if a controlled Dialog rejects the close request", () => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  const onOpenChange = vi.fn();
  render(
    <SettingsDialog
      title="Settings"
      open
      onOpenChange={onOpenChange}
      categories={categories}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Editor" }));
  fireEvent.click(screen.getByRole("button", { name: /^(?:Close|关闭)$/ }));
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(screen.getByRole("heading", { name: "Editor" })).toBeVisible();
});

const indexedCategories = [
  { value: "general", label: "General", content: <p>General options</p> },
  {
    value: "editor",
    label: "Editor",
    content: (
      <div id="indent-setting" tabIndex={-1}>
        <label>
          Indent width <input defaultValue="4" />
        </label>
      </div>
    ),
  },
];
const entries = [
  {
    category: "editor",
    id: "indent-setting",
    label: "Indent width",
    keywords: ["spaces", "缩进"],
  },
];

it("finds an unmounted setting by keyword and navigates to it without editing it", () => {
  render(
    <SettingsDialog
      title="Settings"
      defaultOpen
      categories={indexedCategories}
      searchIndex={entries}
    />,
  );
  const search = screen.getByRole("combobox");
  fireEvent.change(search, { target: { value: "  SPACES " } });
  const result = screen.getByRole("option", { name: /Indent width.*Editor/ });
  fireEvent.keyDown(search, { key: "ArrowDown" });
  expect(search).toHaveAttribute("aria-activedescendant", result.id);
  fireEvent.compositionStart(search);
  fireEvent.keyDown(search, { key: "Enter" });
  expect(screen.queryByRole("textbox", { name: "Indent width" })).toBeNull();
  fireEvent.compositionEnd(search);
  fireEvent.keyDown(search, { key: "Enter" });
  expect(search).toHaveValue("");
  const input = screen.getByRole("textbox", { name: "Indent width" });
  expect(input).toHaveValue("4");
  expect(input.parentElement?.parentElement).toHaveAttribute(
    "data-mt-settings-highlight",
  );
  expect(input.parentElement?.parentElement).toHaveFocus();
  expect(screen.getByRole("button", { name: "Editor" })).toBeVisible();
});

it("keeps the dialog open when escaping from a query and announces no matches", () => {
  render(
    <SettingsDialog
      title="Settings"
      defaultOpen
      categories={indexedCategories}
      searchIndex={entries}
    />,
  );
  const search = screen.getByRole("combobox");
  fireEvent.change(search, { target: { value: "not found" } });
  expect(screen.getByRole("status")).toHaveTextContent(/No results|无匹配结果/);
  fireEvent.keyDown(search, { key: "Escape" });
  expect(screen.getByRole("dialog", { name: "Settings" })).toBeVisible();
  expect(search).toHaveValue("");
});

it("waits for a controlled category before locating its target", () => {
  const onValueChange = vi.fn();
  const { rerender } = render(
    <SettingsDialog
      title="Settings"
      defaultOpen
      categories={indexedCategories}
      searchIndex={entries}
      value="general"
      onValueChange={onValueChange}
    />,
  );
  const search = screen.getByRole("combobox");
  fireEvent.change(search, { target: { value: "缩进" } });
  fireEvent.click(screen.getByRole("option", { name: /Indent width/ }));
  expect(onValueChange).toHaveBeenCalledWith("editor");
  expect(document.querySelector("[data-mt-settings-highlight]")).toBeNull();
  rerender(
    <SettingsDialog
      title="Settings"
      defaultOpen
      categories={indexedCategories}
      searchIndex={entries}
      value="editor"
      onValueChange={onValueChange}
    />,
  );
  expect(document.getElementById("indent-setting")).toHaveAttribute(
    "data-mt-settings-highlight",
  );
});

it("does not reopen compact details for a superseded controlled search", () => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  const onValueChange = vi.fn();
  const view = (value: string) => (
    <SettingsDialog
      title="Settings"
      defaultOpen
      categories={indexedCategories}
      searchIndex={entries}
      value={value}
      onValueChange={onValueChange}
    />
  );
  const { rerender } = render(view("general"));
  const search = screen.getByRole("combobox");
  fireEvent.change(search, { target: { value: "spaces" } });
  fireEvent.keyDown(search, { key: "Enter" });
  expect(onValueChange).toHaveBeenCalledWith("editor");
  fireEvent.change(search, { target: { value: "different" } });
  rerender(view("editor"));
  expect(search).toBeVisible();
  expect(search).toHaveValue("different");
  expect(screen.queryByRole("heading", { name: "Editor" })).toBeNull();
});

it("locates a compact result and returns to the selected category", () => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  render(
    <SettingsDialog
      title="Settings"
      defaultOpen
      categories={indexedCategories}
      searchIndex={entries}
    />,
  );
  const search = screen.getByRole("combobox");
  fireEvent.change(search, { target: { value: "editor" } });
  fireEvent.keyDown(search, { key: "Enter" });
  expect(document.getElementById("indent-setting")).toHaveFocus();
  expect(search).not.toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: /Back|返回/ }));
  expect(screen.getByRole("button", { name: "Editor" })).toHaveFocus();
  expect(search).toHaveValue("");
});

it("keeps the existing custom search slot when both options are passed", () => {
  render(
    <SettingsDialog
      title="Settings"
      defaultOpen
      categories={indexedCategories}
      searchIndex={entries}
      search={<input aria-label="Custom search" />}
    />,
  );
  expect(screen.getByRole("textbox", { name: "Custom search" })).toBeVisible();
  expect(screen.queryByRole("combobox")).toBeNull();
});

it("reserves enough logical start padding for the selected navigation marker", () => {
  const css = readFileSync("packages/mtone/src/settings-dialog.css", "utf8");
  const nav = css.match(/^\.mt-settings-dialog-nav \{([^}]+)\}/m)?.[1];
  expect(nav).toMatch(/padding-inline:\s*5px\s+10px;/);
});

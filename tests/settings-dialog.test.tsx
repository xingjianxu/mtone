import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SettingsDialog, Sidebar } from "../packages/mtone/src";

const categories = [
  { value: "general", label: "General", content: <input aria-label="Project" defaultValue="mtone" /> },
  { value: "editor", label: "Editor", content: <p>Editor options</p> },
];

afterEach(() => vi.unstubAllGlobals());

it("keeps visited settings mounted while switching accessible content", () => {
  render(<SettingsDialog title="Settings" defaultOpen categories={categories} />);
  const dialog = screen.getByRole("dialog", { name: "Settings" });
  const input = within(dialog).getByRole("textbox", { name: "Project" });
  fireEvent.change(input, { target: { value: "Saved draft" } });
  fireEvent.click(within(dialog).getByRole("button", { name: "Editor" }));
  expect(within(dialog).getByText("Editor options")).toBeVisible();
  expect(within(dialog).queryByRole("textbox", { name: "Project" })).toBeNull();
  fireEvent.click(within(dialog).getByRole("button", { name: "General" }));
  expect(within(dialog).getByRole("textbox", { name: "Project" })).toHaveValue("Saved draft");
});

it("supports controlled categories and delegates search behavior to the caller", () => {
  const onValueChange = vi.fn();
  const { rerender } = render(
    <SettingsDialog title="Settings" defaultOpen categories={categories} value="general"
      onValueChange={onValueChange}
      search={({ selectCategory }) => <button onClick={() => selectCategory("editor")}>Jump to editor</button>} />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Jump to editor" }));
  expect(onValueChange).toHaveBeenCalledWith("editor");
  expect(screen.getByRole("textbox", { name: "Project" })).toBeVisible();
  rerender(<SettingsDialog title="Settings" defaultOpen categories={categories} value="editor" />);
  expect(screen.getByText("Editor options")).toBeVisible();
});

it("enters compact details and restores category focus when returning", () => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({
    matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  })));
  render(<SettingsDialog title="Settings" defaultOpen categories={categories} />);
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
  render(<Sidebar collapsible defaultCollapsed>
    <SettingsDialog title="Settings" defaultOpen categories={categories} />
  </Sidebar>);
  expect(screen.getByRole("button", { name: "General" })).not.toHaveClass("mt-nav-item-collapsed");
});

it("keeps compact details open if a controlled Dialog rejects the close request", () => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({
    matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  })));
  const onOpenChange = vi.fn();
  render(<SettingsDialog title="Settings" open onOpenChange={onOpenChange} categories={categories} />);
  fireEvent.click(screen.getByRole("button", { name: "Editor" }));
  fireEvent.click(screen.getByRole("button", { name: /^(?:Close|关闭)$/ }));
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(screen.getByRole("heading", { name: "Editor" })).toBeVisible();
});

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { MtoneProvider, MtoneScope, mtoneOriginalTheme } from "../packages/mtone/src/basic";
import { Dialog, Select } from "../packages/mtone/src/interactive";
import { Mentions } from "../packages/mtone/src/mentions";
import { ToastProvider, useToast } from "../packages/mtone/src/toast";

it("defaults to light and applies inherited or explicit themes without changing neighboring scopes", () => {
  render(
    <>
      <MtoneProvider>
        <MtoneScope data-testid="legacy" />
      </MtoneProvider>
      <MtoneProvider theme="dark">
        <MtoneScope data-testid="dark" />
        <MtoneScope theme="light">
          <MtoneProvider>
            <MtoneScope data-testid="nested-light" />
          </MtoneProvider>
        </MtoneScope>
        <MtoneScope theme="system" data-testid="system" />
      </MtoneProvider>
    </>,
  );
  for (const [id, theme] of [
    ["legacy", "light"],
    ["dark", "dark"],
    ["nested-light", "light"],
    ["system", "system"],
  ]) {
    expect(screen.getByTestId(id)).toHaveAttribute("data-mt-theme", theme);
  }
});

it("keeps a portalled Dialog in its triggering scope and updates it while open", async () => {
  const view = (theme: "dark" | "system") => (
    <MtoneProvider theme="light">
      <MtoneScope theme={theme} data-testid="trigger-scope">
        <Dialog defaultOpen title="Themed dialog">
          Content
        </Dialog>
      </MtoneScope>
    </MtoneProvider>
  );
  const { rerender } = render(view("dark"));
  const dialog = await screen.findByRole("dialog", { name: "Themed dialog" });
  expect(screen.getByTestId("trigger-scope")).not.toContainElement(dialog);
  expect(dialog.closest(".mt-scope")).toHaveAttribute("data-mt-theme", "dark");
  rerender(view("system"));
  expect(dialog.closest(".mt-scope")).toHaveAttribute(
    "data-mt-theme",
    "system",
  );
});

it("propagates the theme to the manually portalled Mentions suggestions", async () => {
  render(
    <MtoneProvider theme="dark">
      <Mentions
        aria-label="People"
        options={[{ value: "alice", label: "Alice" }]}
      />
    </MtoneProvider>,
  );
  const input = screen.getByRole("combobox", { name: "People" });
  fireEvent.focus(input);
  fireEvent.change(input, {
    target: { value: "@a", selectionStart: 2, selectionEnd: 2 },
  });
  expect(
    (await screen.findByRole("listbox")).closest(".mt-scope"),
  ).toHaveAttribute("data-mt-theme", "dark");
});

it("keeps notifications and option lists in separate themed portals", async () => {
  function Notify() {
    const toast = useToast();
    return (
      <button onClick={() => toast.info({ title: "Themed notice" })}>
        Notify
      </button>
    );
  }
  const { container } = render(
    <MtoneProvider theme="dark">
      <ToastProvider>
        <Notify />
      </ToastProvider>
      <MtoneScope theme="light">
        <Select label="Choose" options={[{ value: "a", label: "Alpha" }]} />
      </MtoneScope>
    </MtoneProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Notify" }));
  const notice = await screen.findByText("Themed notice");
  expect(container).not.toContainElement(notice);
  expect(notice.closest(".mt-scope")).toHaveAttribute("data-mt-theme", "dark");
  fireEvent.click(screen.getByRole("combobox", { name: "Choose" }));
  const option = await screen.findByRole("option", { name: "Alpha" });
  expect(container).not.toContainElement(option);
  expect(option.closest(".mt-scope")).toHaveAttribute("data-mt-theme", "light");
});

it("keeps input state when a scope changes between inherited and explicit themes", () => {
  const view = (theme?: "dark") => (
    <MtoneProvider>
      <MtoneScope theme={theme}>
        <input aria-label="Draft" defaultValue="" />
      </MtoneScope>
    </MtoneProvider>
  );
  const { rerender } = render(view());
  const draft = screen.getByRole("textbox", { name: "Draft" });
  fireEvent.change(draft, { target: { value: "still editing" } });
  rerender(view("dark"));
  expect(screen.getByRole("textbox", { name: "Draft" })).toBe(draft);
  expect(draft).toHaveValue("still editing");
  rerender(view());
  expect(screen.getByRole("textbox", { name: "Draft" })).toBe(draft);
});

it("applies named theme presets, local overrides and explicit default reset to portals", async () => {
  const preset = {
    id: "sample",
    name: "Sample",
    tokens: { "--mt-height": "36px", "--mt-radius": "6px" },
    light: { "--mt-nav-selected": "#deedfa" },
    dark: { "--mt-nav-selected": "#25384a" },
  };
  render(
    <MtoneProvider themePreset={preset} tokens={{ "--mt-radius": "8px" }}>
      <MtoneScope data-testid="sample-light" />
      <MtoneScope theme="dark" data-testid="sample-dark">
        <Dialog defaultOpen title="Preset portal">Content</Dialog>
      </MtoneScope>
      <MtoneScope themePreset={mtoneOriginalTheme} data-testid="original" />
    </MtoneProvider>,
  );
  const light = screen.getByTestId("sample-light");
  expect(light).toHaveAttribute("data-mt-theme-preset", "sample");
  expect(light.style.getPropertyValue("--mt-height")).toBe("36px");
  expect(light.style.getPropertyValue("--mt-nav-selected")).toBe("#deedfa");
  expect(light.style.getPropertyValue("--mt-radius")).toBe("8px");
  expect(screen.getByTestId("sample-dark").style.getPropertyValue("--mt-nav-selected")).toBe("#25384a");
  const portal = (await screen.findByRole("dialog", { name: "Preset portal" })).closest<HTMLElement>(".mt-scope")!;
  expect(portal).toHaveAttribute("data-mt-theme-preset", "sample");
  expect(portal.style.getPropertyValue("--mt-nav-selected")).toBe("#25384a");
  const original = screen.getByTestId("original");
  expect(original).toHaveAttribute("data-mt-theme-preset", "original");
  expect(original.style.getPropertyValue("--mt-nav-selected")).toBe("");
});

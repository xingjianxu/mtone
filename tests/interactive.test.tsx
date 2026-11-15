import React from "react";
import { describe, it, expect, vi } from "vitest";
const { readFileSync } = await vi.importActual<{
  readFileSync: (path: string, encoding: string) => string;
}>("node:fs");
const interactiveStyles = readFileSync(
  "packages/mtone/src/interactive.css",
  "utf8",
);
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MtoneProvider } from "../packages/mtone/src/basic";
import * as UI from "../packages/mtone/src/interactive";
// jsdom does not provide PointerEvent; Base UI dispatches synthetic pointer clicks.
if (!window.PointerEvent)
  window.PointerEvent = MouseEvent as typeof PointerEvent;
const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta", disabled: true },
  { value: "c", label: "Charlie" },
];
describe("styled interactive controls", () => {
  it("toggles checkbox and switch with accessible labels", async () => {
    render(
      <>
        <UI.Checkbox label="Agree" />
        <UI.Switch label="Notify" />
      </>,
    );
    await userEvent.click(screen.getByRole("checkbox", { name: "Agree" }));
    expect(screen.getByRole("checkbox")).toBeChecked();
    await userEvent.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch")).toBeChecked();
  });
  it("radio groups respect disabled options", async () => {
    render(<UI.RadioGroup options={options} defaultValue="a" label="Choice" />);
    expect(screen.getByRole("radio", { name: "Alpha" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Beta" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await userEvent.click(screen.getByRole("radio", { name: "Charlie" }));
    expect(screen.getByRole("radio", { name: "Charlie" })).toBeChecked();
  });
  it("select exposes options and returns the selected value", async () => {
    const change = vi.fn();
    render(
      <UI.Select options={options} onValueChange={change} label="Choose" />,
    );
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(
      await screen.findByRole("option", { name: /Charlie/ }),
    );
    expect(change.mock.calls[0][0]).toBe("c");
  });
  it("multiselect supports searchable choices", async () => {
    render(<UI.MultiSelect options={options} label="Tags" />);
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.type(screen.getByRole("combobox"), "Char");
    expect(
      await screen.findByRole("option", { name: /Charlie/ }),
    ).toBeVisible();
  });
  it("number input increments", async () => {
    render(<UI.NumberInput label="Count" defaultValue={2} />);
    await userEvent.click(
      screen.getByRole("button", { name: /Increase|增加/ }),
    );
    expect(screen.getByRole("textbox", { name: "Count" })).toHaveValue("3");
  });
  it("slider exposes an accessible numeric control", () => {
    render(<UI.Slider label="Volume" defaultValue={30} />);
    expect(screen.getByRole("slider", { name: "Volume" })).toHaveAttribute(
      "aria-valuenow",
      "30",
    );
  });
  it("tabs and segmented switch selection", async () => {
    render(
      <>
        <UI.Tabs
          items={[
            { value: "one", label: "First", content: "First panel" },
            { value: "two", label: "Second", content: "Second panel" },
          ]}
        />
        <UI.Segmented options={options} defaultValue="a" />
      </>,
    );
    await userEvent.click(screen.getByRole("tab", { name: "Second" }));
    expect(screen.getByText("Second panel")).toBeVisible();
  });
  it("dropdown menu activates actions", async () => {
    const action = vi.fn();
    render(
      <UI.DropdownMenu
        trigger={<button>Actions</button>}
        items={[{ key: "copy", label: "Copy", onSelect: action }]}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Copy" }),
    );
    expect(action).toHaveBeenCalledOnce();
  });
  it("context menu opens on right click", async () => {
    render(
      <UI.ContextMenu items={[{ key: "copy", label: "Copy" }]}>
        <div>Context area</div>
      </UI.ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText("Context area"));
    expect(await screen.findByRole("menuitem", { name: "Copy" })).toBeVisible();
  });
  it("popover and tooltip render content", async () => {
    render(
      <>
        <UI.Popover trigger={<button>Details</button>} content="More detail" />
        <UI.Tooltip content="Helpful" open>
          <button>Help</button>
        </UI.Tooltip>
      </>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Details" }));
    expect(await screen.findByText("More detail")).toBeVisible();
    expect(screen.getByRole("tooltip")).toHaveTextContent("Helpful");
  });
  it("modal is labeled and dismissible", async () => {
    const change = vi.fn();
    render(
      <UI.Modal open title="Edit entry" onOpenChange={change}>
        Fields
      </UI.Modal>,
    );
    expect(screen.getByRole("dialog", { name: "Edit entry" })).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: /Close|关闭/ }));
    expect(change.mock.calls[0][0]).toBe(false);
  });
  it("confirm dialog asks before running confirmation", async () => {
    const confirm = vi.fn();
    render(<UI.ConfirmDialog open title="Delete entry?" onConfirm={confirm} />);
    expect(screen.getByRole("alertdialog")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: /Confirm|确认/ }));
    expect(confirm).toHaveBeenCalledOnce();
  });
  it("drawer presents a labeled dialog", () => {
    render(
      <UI.Drawer open title="Settings">
        Preferences
      </UI.Drawer>,
    );
    expect(screen.getByRole("dialog", { name: "Settings" })).toHaveTextContent(
      "Preferences",
    );
  });
  it("controlled switches request changes without mutating the supplied value", async () => {
    const change = vi.fn();
    render(
      <UI.Switch checked={false} onCheckedChange={change} label="Controlled" />,
    );
    await userEvent.click(screen.getByRole("switch"));
    expect(change.mock.calls[0][0]).toBe(true);
    expect(screen.getByRole("switch")).not.toBeChecked();
  });
  it("multiselect renders selected chips and removes a selection", async () => {
    const change = vi.fn();
    render(
      <UI.MultiSelect
        options={options}
        defaultValue={["a"]}
        onValueChange={change}
        label="Tags"
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Alpha/ }));
    expect(change.mock.calls[0][0]).toEqual([]);
  });
  it("modal Escape closes and restores focus to its trigger", async () => {
    render(
      <UI.Modal title="Keyboard modal" trigger={<button>Open editor</button>}>
        Body
      </UI.Modal>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open editor" }));
    expect(screen.getByRole("dialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button", { name: "Open editor" })).toHaveFocus();
  });
  it("portals retain the provider theme and density", () => {
    render(
      <MtoneProvider
        density="comfortable"
        tokens={{ "--mt-primary": "purple" }}
      >
        <UI.Modal open title="Theme">
          Body
        </UI.Modal>
      </MtoneProvider>,
    );
    const scope = screen.getByRole("dialog").closest(".mt-scope");
    expect(scope).toHaveAttribute("data-density", "comfortable");
    expect(scope).toHaveStyle({ "--mt-primary": "purple" });
  });
  it("portal layers appear above modals and below toast notifications", () => {
    const compact = interactiveStyles.replace(/\s/g, "");
    const layer = (selector: string) =>
      Number(
        compact
          .split(selector + "{")[1]
          ?.split("}")[0]
          .match(/z-index:(\d+)/)?.[1],
      );
    expect(layer(".mt-positioner")).toBeGreaterThan(layer(".mt-modal"));
    expect(layer(".mt-positioner")).toBeLessThan(layer(".mt-toast-viewport"));
  });
  it("menu icons render decoratively without changing accessible labels", async () => {
    render(
      <UI.DropdownMenu
        trigger={<button>Icon menu</button>}
        items={[
          {
            key: "copy",
            label: "Copy",
            icon: (
              <svg data-testid="copy-icon">
                <title>Copy icon</title>
              </svg>
            ),
          },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Icon menu" }));
    expect(await screen.findByRole("menuitem", { name: "Copy" })).toBeVisible();
    expect(screen.getByTestId("copy-icon").parentElement).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
  it("toast provides a simple imperative hook", async () => {
    function Demo() {
      const toast = UI.useToast();
      return (
        <button onClick={() => toast.add({ title: "Saved" })}>Save</button>
      );
    }
    render(
      <UI.ToastProvider>
        <Demo />
      </UI.ToastProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Saved")).toBeVisible();
  });
});

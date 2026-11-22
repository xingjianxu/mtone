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
  it("uses the old segmented styles under an accessible RadioGroup without exporting Segmented", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const { container } = render(
      <form>
        <UI.RadioGroup
          variant="segmented"
          className="custom-segment"
          label="Layout"
          name="layout"
          defaultValue="a"
          options={options}
          onValueChange={handleChange}
        />
      </form>,
    );
    const form = container.querySelector("form")!;
    const group = screen.getByRole("radiogroup", { name: "Layout" });
    expect(group).toHaveClass("mt-segmented", "mt-horizontal", "custom-segment");
    expect(group).not.toHaveAttribute("variant");
    expect(group.querySelector(".mt-radio-indicator")).not.toBeInTheDocument();
    expect(UI).not.toHaveProperty("Segmented");
    expect(new FormData(form).get("layout")).toBe("a");
    const first = screen.getByRole("radio", { name: "Alpha" });
    const next = screen.getByRole("radio", { name: "Charlie" });
    expect(first).toHaveClass("mt-segment");
    expect(first).toBeChecked();
    first.focus();
    await user.keyboard("{ArrowRight}");
    expect(next).toHaveFocus();
    expect(next).toBeChecked();
    expect(handleChange.mock.lastCall?.[0]).toBe("c");
    expect(new FormData(form).get("layout")).toBe("c");
  });

  it("retains standard vertical styling and accepts explicit direction in both variants", () => {
    const { rerender } = render(<UI.RadioGroup label="Direction" defaultValue="a" options={options} />);
    const group = screen.getByRole("radiogroup", { name: "Direction" });
    expect(group).toHaveClass("mt-radio-group", "mt-vertical");
    expect(group.querySelector(".mt-radio-indicator")).toBeInTheDocument();
    rerender(<UI.RadioGroup label="Direction" defaultValue="a" options={options} orientation="horizontal" />);
    expect(group).toHaveClass("mt-radio-group", "mt-horizontal");
    rerender(<UI.RadioGroup label="Direction" defaultValue="a" options={options} variant="segmented" orientation="vertical" />);
    expect(group).toHaveClass("mt-segmented", "mt-vertical");
    expect(group).not.toHaveClass("mt-horizontal");
  });

  it("uses controlled semantics and group disabling for segmented radios", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const { rerender } = render(<UI.RadioGroup variant="segmented" label="Mode" options={options} value="a" onValueChange={handleChange} />);
    const alpha = screen.getByRole("radio", { name: "Alpha" });
    const charlie = screen.getByRole("radio", { name: "Charlie" });
    await user.click(charlie);
    expect(handleChange.mock.lastCall?.[0]).toBe("c");
    expect(alpha).toBeChecked();
    expect(charlie).not.toBeChecked();
    rerender(<UI.RadioGroup variant="segmented" label="Mode" options={options} value="c" onValueChange={handleChange} disabled />);
    expect(charlie).toBeChecked();
    expect(alpha).toHaveAttribute("aria-disabled", "true");
    await user.click(alpha);
    expect(handleChange).toHaveBeenCalledTimes(1);
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
  it("tabs switch selection", async () => {
    render(
      <>
        <UI.Tabs
          items={[
            { value: "one", label: "First", content: "First panel" },
            { value: "two", label: "Second", content: "Second panel" },
          ]}
        />
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
      <UI.Dialog open title="Edit entry" onOpenChange={change}>
        Fields
      </UI.Dialog>,
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
      <UI.Dialog title="Keyboard modal" trigger={<button>Open editor</button>}>
        Body
      </UI.Dialog>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open editor" }));
    expect(screen.getByRole("dialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button", { name: "Open editor" })).toHaveFocus();
  });
  it("portals retain the provider theme and tokens", () => {
    render(
      <MtoneProvider
        theme="dark"
        tokens={{ "--mt-primary": "purple" }}
      >
        <UI.Dialog open title="Theme">
          Body
        </UI.Dialog>
      </MtoneProvider>,
    );
    const scope = screen.getByRole("dialog").closest(".mt-scope");
    expect(scope).toHaveAttribute("data-mt-theme", "dark");
    expect(scope).not.toHaveAttribute("data-density");
    expect(scope).toHaveStyle({ "--mt-primary": "purple" });
  });
  it("portal layers appear above modals and below toast notifications", () => {
    const compact = (interactiveStyles + readFileSync("packages/mtone/src/toast.css", "utf8")).replace(/\s/g, "");
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

it('keeps disabled compound inputs unfocusable', async () => {
  render(<><UI.NumberInput label="Disabled count" disabled /><UI.MultiSelect label="Disabled tags" options={options} disabled /></>);
  const number = screen.getByLabelText('Disabled count');
  const combo = screen.getByRole('combobox', {name: 'Disabled tags'});
  expect(number).toBeDisabled();
  expect(combo).toBeDisabled();
  number.focus();
  expect(number).not.toHaveFocus();
  combo.focus();
  expect(combo).not.toHaveFocus();
});

it("select uses a decorative fixed-size vector arrow instead of a font glyph", () => {
  render(<UI.Select label="Fixed arrow" options={options} defaultValue="a" />);
  const trigger = screen.getByRole("combobox", { name: "Fixed arrow" });
  const icon = trigger.querySelector(".mt-select-icon");
  expect(icon).toHaveAttribute("aria-hidden", "true");
  expect(icon?.querySelector("svg")).toHaveAttribute("width", "16");
  expect(icon?.querySelector("svg")).toHaveAttribute("height", "16");
  expect(icon).not.toHaveTextContent("⌄");
  expect(trigger.querySelector(".mt-select-value")).toHaveTextContent("Alpha");
});

it("select preserves long values and disabled semantics with its decorative arrow", async () => {
  const long = "A long option that must truncate without changing its value";
  render(<UI.Select label="Long disabled" disabled options={[{value:"long",label:long}]} defaultValue="long" />);
  const trigger = screen.getByRole("combobox", { name:"Long disabled" });
  expect(trigger).toBeDisabled();
  expect(trigger.querySelector(".mt-select-value")).toHaveTextContent(long);
});

it("select marks only the selected option with a thin decorative vector check", async () => {
  render(<UI.Select label="Checked choice" options={options} defaultValue="a" />);
  await userEvent.click(screen.getByRole("combobox", {name:"Checked choice"}));
  const selected = await screen.findByRole("option", {name:/Alpha/});
  expect(selected).toHaveAttribute("aria-selected", "true");
  const indicator = selected.querySelector(".mt-select-item-indicator");
  expect(indicator).toHaveAttribute("aria-hidden", "true");
  const svg = indicator?.querySelector("svg");
  expect(svg).toHaveClass("lucide-check");
  expect(svg).toHaveAttribute("width", "16");
  expect(svg).toHaveAttribute("height", "16");
  expect(svg).toHaveAttribute("stroke-width", "1.5");
  expect(indicator).not.toHaveTextContent("✓");
  expect(screen.getByRole("option", {name:/Charlie/}).querySelector(".mt-select-item-indicator")).toBeNull();
});

it("scopes Dialog layout and provides a name when its visible title is empty", () => {
  render(<UI.Dialog open title={null}><p>Body only</p></UI.Dialog>);
  const modal = screen.getByRole("dialog", { name: "对话框" });
  expect(modal).toHaveClass("mt-modal-dialog");
  expect(modal.querySelector(".mt-modal-header .mt-dialog-close")).not.toBeNull();
  expect(modal.querySelector(".mt-dialog-footer")).toBeNull();
});

it("preserves zero as a visible Dialog title", () => {
  render(<UI.Dialog open title={0}>Content</UI.Dialog>);
  const modal = screen.getByRole("dialog", { name: "0" });
  expect(modal.querySelector(".mt-dialog-title")).not.toHaveClass("mt-modal-title-hidden");
});

it("keeps deprecated Modal as an exact Dialog alias", () => {
  expect(UI.Modal).toBe(UI.Dialog);
});
it("keeps Escape dismissal when outside dismissal is disabled", async () => {
  const user = userEvent.setup();
  render(<UI.Dialog title="Protected" modal={true} trigger={<button>Open protected</button>}>Content</UI.Dialog>);
  await user.click(screen.getByRole("button", { name: "Open protected" }));
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("multiselect uses the same decorative arrow and selection check as Select", async () => {
  render(<UI.MultiSelect label="Vector tags" options={options} defaultValue={["a"]} />);
  const trigger = screen.getByRole("button", { name: "展开选项" });
  expect(trigger.querySelector("svg")).toHaveClass("lucide-chevron-down");
  expect(trigger.querySelector("svg")).toHaveAttribute("width", "16");
  await userEvent.click(trigger);
  const selected = await screen.findByRole("option", { name: "Alpha" });
  const marker = selected.querySelector(".mt-select-item-indicator");
  expect(marker).toHaveAttribute("aria-hidden", "true");
  expect(marker?.querySelector("svg")).toHaveClass("lucide-check");
  expect(marker?.querySelector("svg")).toHaveAttribute("stroke-width", "1.5");
  expect(screen.getByRole("option", { name: "Charlie" }).querySelector(".mt-select-item-indicator")).toBeNull();
  await userEvent.click(screen.getByRole("option", { name: "Charlie" }));
  expect(screen.getByRole("option", { name: "Charlie" }).querySelector(".mt-select-item-indicator svg")).not.toBeNull();
});
it("checkbox uses thin vector checked and indeterminate indicators", () => {
  const { rerender } = render(<UI.Checkbox label="Vector check" checked />);
  let marker = screen.getByRole("checkbox").querySelector(".mt-check-indicator");
  expect(marker).toHaveAttribute("aria-hidden", "true");
  expect(marker?.querySelector("svg")).toHaveClass("lucide-check");
  expect(marker?.querySelector("svg")).toHaveAttribute("stroke-width", "1.5");
  rerender(<UI.Checkbox label="Vector check" indeterminate />);
  expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "mixed");
  marker = screen.getByRole("checkbox").querySelector(".mt-check-indicator");
  expect(marker?.querySelector("svg")).toHaveClass("lucide-minus");
});

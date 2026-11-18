import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import {
  Fieldset,
  Input,
  Button,
  Select,
  MultiSelect,
  Rate,
  AutoComplete,
  Cascader,
  CascaderPanel,
  Mentions,
  Transfer,
  Slider,
  NumberInput,
  Checkbox,
  Switch,
  RadioGroup,
  Segmented,
  Textarea,
  DatePicker,
  Upload,
} from "../packages/mtone/src";

describe("Fieldset", () => {
  it("renders a named native group, forwards ref and native attributes", () => {
    const ref = React.createRef<HTMLFieldSetElement>();
    render(
      <Fieldset
        ref={ref}
        legend="Profile"
        name="profile"
        variant="filled"
        radius={8}
      >
        <Input aria-label="Name" />
      </Fieldset>,
    );
    const group = screen.getByRole("group", { name: "Profile" });
    expect(group.tagName).toBe("FIELDSET");
    expect(ref.current).toBe(group);
    expect(group).toHaveAttribute("name", "profile");
    expect(group).toHaveClass("mt-fieldset-filled");
    expect(group).toHaveStyle({ borderRadius: "8px" });
  });
  it("supports no legend and unstyled appearance", () => {
    const { container } = render(
      <Fieldset aria-label="Group" variant="unstyled">
        Content
      </Fieldset>,
    );
    expect(container.querySelector("legend")).toBeNull();
    expect(screen.getByRole("group")).toHaveClass("mt-fieldset-unstyled");
  });
  it("inherits disabling through wrappers and nested fieldsets, including custom controls", () => {
    const change = vi.fn();
    render(
      <Fieldset disabled legend="Outer">
        <div>
          <Fieldset disabled={false} legend="Inner">
            <Input aria-label="Name" />
            <Button onClick={change}>Save</Button>
            <Select label="Choice" options={[{ value: "a", label: "A" }]} />
            <MultiSelect
              label="Choices"
              options={[{ value: "a", label: "A" }]}
            />
            <Rate aria-label="Rating" onChange={change} />
          </Fieldset>
        </div>
      </Fieldset>,
    );
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    for (const control of screen.getAllByRole("combobox"))
      expect(control).toBeDisabled();
    const rate = screen.getByRole("slider");
    expect(rate).toHaveAttribute("aria-disabled", "true");
    expect(rate).toHaveAttribute("tabindex", "-1");
    fireEvent.keyDown(rate, { key: "ArrowRight" });
    expect(change).not.toHaveBeenCalled();
  });
  it("retains the native first-legend exception and restores descendants on enable", () => {
    const Demo = ({ disabled }: { disabled: boolean }) => (
      <Fieldset disabled={disabled} legend={<Button>Legend action</Button>}>
        <Input aria-label="Name" />
      </Fieldset>
    );
    const { rerender } = render(<Demo disabled />);
    expect(screen.getByRole("button")).not.toBeDisabled();
    expect(screen.getByRole("textbox")).toBeDisabled();
    rerender(<Demo disabled={false} />);
    expect(screen.getByRole("textbox")).not.toBeDisabled();
  });
});

it("closes a controlled Select popup while disabled and preserves its value", async () => {
  const Demo = ({ disabled }: { disabled: boolean }) => (
    <Fieldset disabled={disabled}>
      <Select
        label="Choice"
        open
        value="a"
        options={[{ value: "a", label: "Alpha" }]}
      />
    </Fieldset>
  );
  const { rerender } = render(<Demo disabled={false} />);
  expect(await screen.findByRole("option")).toHaveTextContent("Alpha");
  rerender(<Demo disabled />);
  expect(screen.queryByRole("option")).toBeNull();
  expect(screen.getByRole("combobox")).toBeDisabled();
  expect(screen.getByRole("combobox")).toHaveTextContent("Alpha");
  rerender(<Demo disabled={false} />);
  expect(await screen.findByRole("option")).toHaveTextContent("Alpha");
});

it("closes an uncontrolled popup and allows opening again after disabled changes", async () => {
  const Demo = ({ disabled }: { disabled: boolean }) => (
    <Fieldset disabled={disabled}>
      <Select
        label="Uncontrolled"
        defaultOpen
        options={[{ value: "a", label: "Alpha" }]}
      />
    </Fieldset>
  );
  const { rerender } = render(<Demo disabled={false} />);
  expect(await screen.findByRole("option")).toBeVisible();
  rerender(<Demo disabled />);
  expect(screen.queryByRole("option")).toBeNull();
  rerender(<Demo disabled={false} />);
  fireEvent.click(screen.getByRole("combobox"));
  expect(await screen.findByRole("option")).toBeVisible();
});

it("re-enables initially disabled MultiSelect and disables chip removal without dropping values", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const Demo = ({ disabled }: { disabled: boolean }) => (
    <Fieldset disabled={disabled}>
      <MultiSelect
        label="Tags"
        defaultValue={["a"]}
        onValueChange={change}
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ]}
      />
    </Fieldset>
  );
  const { rerender } = render(<Demo disabled />);
  const remove = screen.getByRole("button", { name: /Alpha/ });
  expect(remove).toBeDisabled();
  await user.click(remove);
  expect(change).not.toHaveBeenCalled();
  rerender(<Demo disabled={false} />);
  await user.click(screen.getByRole("combobox"));
  expect(await screen.findByRole("option", { name: "Beta" })).toBeVisible();
  rerender(<Demo disabled />);
  expect(screen.queryByRole("option")).toBeNull();
  expect(screen.getByText("Alpha")).toBeVisible();
});

it("propagates state to compound form controls and removes it when enabled", () => {
  const options = [{ value: "a", label: "Alpha" }];
  const Demo = ({ disabled }: { disabled: boolean }) => (
    <Fieldset disabled={disabled}>
      <Textarea aria-label="Notes" />
      <Checkbox label="Check" />
      <Switch label="Switch" />
      <RadioGroup label="Radio" options={options} />
      <Segmented label="Segment" options={options} />
      <Slider label="Volume" />
      <NumberInput label="Count" />
      <AutoComplete options={options} aria-label="Suggest" />
      <Mentions options={options} aria-label="Mention" />
      <Cascader options={options} aria-label="Cascade" />
      <CascaderPanel options={options} />
      <Transfer items={[{ key: "a", label: "Transfer item" }]} />
      <DatePicker label="Date" />
      <Upload upload={async () => ({ url: "" })} />
    </Fieldset>
  );
  const { container, rerender } = render(<Demo disabled />);
  for (const control of container.querySelectorAll("input,button,textarea"))
    expect(control).toBeDisabled();
  expect(container.querySelector(".mt-slider")).toHaveAttribute(
    "data-disabled",
  );
  expect(container.querySelector(".mt-cascader")).toHaveAttribute(
    "data-disabled",
  );
  rerender(<Demo disabled={false} />);
  expect(screen.getByRole("textbox", { name: "Notes" })).not.toBeDisabled();
  expect(container.querySelector(".mt-slider")).not.toHaveAttribute(
    "data-disabled",
  );
});

import React from "react";
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { NumberInput, Select, SettingRow, Switch } from "../packages/mtone/src";

it("connects each interactive control to the row text, excluding the shortcut from its name", () => {
  render(<SettingRow.Group aria-label="Editor">
    <SettingRow title="Read only" description="Lock the editor" shortcut="Ctrl+Shift+G"
      control={props => <Switch {...props} />} />
    <SettingRow title="Context lines" description="Keep nearby text visible"
      control={props => <NumberInput {...props} defaultValue={3} />} />
    <SettingRow title="Tab width"
      control={props => <Select {...props} defaultValue="4" options={[{ value: "4", label: "4 spaces" }]} />} />
  </SettingRow.Group>);
  const group = screen.getByRole("group", { name: "Editor" });
  expect(group.querySelector("kbd")).toHaveTextContent("Ctrl+Shift+G");
  const enabled = screen.getByRole("switch", { name: "Read only" });
  expect(enabled).toHaveAccessibleDescription("Lock the editor");
  const number = screen.getByRole("textbox", { name: "Context lines" });
  expect(number).toHaveAccessibleDescription("Keep nearby text visible");
  expect(screen.getByRole("combobox", { name: "Tab width" })).not.toHaveAttribute("aria-describedby");
});

it("allows a caller-labelled arbitrary control and renders standalone on the server", () => {
  const example = <SettingRow title="Reset" control={<button type="button">Reset defaults</button>} />;
  expect(renderToString(example)).toContain("Reset defaults");
  render(example);
  expect(screen.getByRole("button", { name: "Reset defaults" })).toBeInTheDocument();
});

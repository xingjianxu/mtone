import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Fieldset, TagSelect } from "../packages/mtone/src";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma", disabled: true },
];

describe("TagSelect", () => {
  it("toggles selections from keyboard without submitting a surrounding form", async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={submit}>
        <TagSelect
          aria-label="Tags"
          options={options}
          defaultValue={["a"]}
          onValueChange={changed}
        />
      </form>,
    );
    const alpha = screen.getByRole("button", { name: "Alpha" });
    await user.tab();
    expect(alpha).toHaveFocus();
    await user.keyboard("[Space]");
    expect(alpha).toHaveAttribute("aria-pressed", "false");
    expect(changed).toHaveBeenLastCalledWith([]);
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Gamma" })).toBeDisabled();
  });

  it("leaves the controlled value unchanged until the owner updates it", async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    render(
      <TagSelect options={options} value={["a"]} onValueChange={changed} />,
    );
    const beta = screen.getByRole("button", { name: "Beta" });
    await user.click(beta);
    expect(beta).toHaveAttribute("aria-pressed", "false");
    expect(changed).toHaveBeenLastCalledWith(["a", "b"]);
  });

  it("honors fieldset disabled state and allows wrapping without disclosure", () => {
    render(
      <Fieldset disabled>
        <TagSelect options={options} expandable={false} />
      </Fieldset>,
    );
    expect(screen.getAllByRole("button")).toHaveLength(3);
    for (const button of screen.getAllByRole("button"))
      expect(button).toBeDisabled();
  });
});

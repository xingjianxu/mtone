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

describe("TagSelect selectAll", () => {
  it("exposes a first toggle with mixed selection; excludes disabled options when toggling", async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    render(
      <TagSelect
        options={options}
        selectAll
        defaultValue={["a", "c"]}
        onValueChange={changed}
      />,
    );
    const [all, alpha, beta, gamma] = screen.getAllByRole("button");
    expect(all).toHaveAccessibleName("全选");
    expect(all).toHaveAttribute("aria-pressed", "mixed");
    await user.tab();
    expect(all).toHaveFocus();
    await user.keyboard("[Space]");
    expect(changed).toHaveBeenLastCalledWith(["a", "c", "b"]);
    expect(all).toHaveAttribute("aria-pressed", "true");
    await user.keyboard("[Enter]");
    expect(changed).toHaveBeenLastCalledWith(["c"]);
    expect(all).toHaveAttribute("aria-pressed", "false");
    expect(alpha).toHaveAttribute("aria-pressed", "false");
    expect(beta).toHaveAttribute("aria-pressed", "false");
    expect(gamma).toHaveAttribute("aria-pressed", "true");
  });

  it("notifies without changing controlled values and supports a custom label", async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    render(
      <TagSelect
        options={options}
        selectAll
        selectAllLabel="All tags"
        value={[]}
        onValueChange={changed}
      />,
    );
    const all = screen.getByRole("button", { name: "All tags" });
    await user.click(all);
    expect(changed).toHaveBeenLastCalledWith(["a", "b"]);
    expect(all).toHaveAttribute("aria-pressed", "false");
  });

  it("disables the aggregate toggle when no options can be selected", () => {
    render(<TagSelect options={options.slice(2)} selectAll />);
    expect(screen.getByRole("button", { name: "全选" })).toBeDisabled();
  });
});

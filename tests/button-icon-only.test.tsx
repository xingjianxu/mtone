import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button, IconButton, type ButtonProps } from "../packages/mtone/src";

interface ConsumerButtonProps extends ButtonProps {
  auditId: string;
}

function ConsumerButton({ auditId, ...props }: ConsumerButtonProps) {
  return <Button {...props} data-audit-id={auditId} />;
}

function acceptedProps(dynamic: boolean) {
  const examples: ButtonProps[] = [
    { children: "Save" },
    { iconOnly: false, children: "Save" },
    { iconOnly: true, "aria-label": "Save" },
    { iconOnly: dynamic, "aria-labelledby": "save-name" },
  ];
  // @ts-expect-error The compatibility wrapper still requires aria-label.
  const wrapper: Parameters<typeof IconButton>[0] = {
    "aria-labelledby": "save-name",
  };
  return {
    examples,
    wrapper,
    tracked: <ConsumerButton auditId="save" iconOnly aria-label="Save" />,
  };
}
void acceptedProps;

describe("Button iconOnly", () => {
  it("is explicit and supports both accessible name sources", () => {
    render(
      <>
        <span id="settings-name">Settings</span>
        <Button iconOnly aria-label="Search">
          <svg />
        </Button>
        <Button
          iconOnly
          aria-labelledby="settings-name"
          variant="ghost"
          size="lg"
          leftSection={<svg />}
        />
        <Button aria-label="Unnamed artwork">
          <svg />
        </Button>
        <Button leftSection={<svg />}>Continue</Button>
      </>,
    );
    const search = screen.getByRole("button", { name: "Search" });
    expect(search).toHaveClass("mt-btn", "mt-icon-btn", "mt-size-md");
    expect(search).not.toHaveAttribute("iconOnly");
    expect(screen.getByRole("button", { name: "Settings" })).toHaveClass(
      "mt-icon-btn",
      "mt-btn-ghost",
      "mt-size-lg",
    );
    expect(
      screen.getByRole("button", { name: "Unnamed artwork" }),
    ).not.toHaveClass("mt-icon-btn");
    expect(screen.getByRole("button", { name: "Continue" })).not.toHaveClass(
      "mt-icon-btn",
    );
  });

  it("preserves the legacy wrapper ref, options and original button type", () => {
    const ref = createRef<HTMLButtonElement>();
    const click = vi.fn();
    render(
      <IconButton
        ref={ref}
        aria-label="Archive"
        type="button"
        variant="solid"
        size="sm"
        className="legacy"
        onClick={click}
      >
        <svg />
      </IconButton>,
    );
    const button = screen.getByRole("button", { name: "Archive" });
    expect(button).toBe(ref.current);
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass(
      "mt-btn-solid",
      "mt-icon-btn",
      "mt-size-sm",
      "legacy",
    );
    fireEvent.click(button);
    expect(click).toHaveBeenCalledOnce();
  });

  it("keeps the accessible name, toggle state and disabled loading behavior", () => {
    const toggle = { mode: "icon", preset: "star" } as const;
    const change = vi.fn();
    const { rerender } = render(
      <Button
        iconOnly
        aria-label="Favorite"
        toggle={toggle}
        onPressedChange={change}
      />,
    );
    const button = screen.getByRole("button", {
      name: "Favorite",
      pressed: false,
    });
    fireEvent.click(button);
    expect(
      screen.getByRole("button", { name: "Favorite", pressed: true }),
    ).toBe(button);
    expect(change).toHaveBeenCalledWith(true);
    rerender(
      <Button
        iconOnly
        aria-label="Favorite"
        toggle={toggle}
        loading
        onPressedChange={change}
      />,
    );
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button.querySelector(".mt-spin")).not.toBeNull();
    fireEvent.click(button);
    expect(change).toHaveBeenCalledOnce();
  });
});

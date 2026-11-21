import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button, Fieldset } from "../packages/mtone/src";

describe("Button toggle", () => {
  it("opts into background state without modifying regular buttons", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <>
        <Button>Ordinary</Button>
        <Button toggle onPressedChange={change}>
          Filter
        </Button>
      </>,
    );
    expect(
      screen.getByRole("button", { name: "Ordinary" }),
    ).not.toHaveAttribute("aria-pressed");
    const button = screen.getByRole("button", {
      name: "Filter",
      pressed: false,
    });
    expect(button).toHaveAttribute("data-toggle-mode", "background");
    button.focus();
    await user.keyboard(" ");
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(change).toHaveBeenLastCalledWith(true);
    await user.keyboard("{Enter}");
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(change).toHaveBeenLastCalledWith(false);
    expect(change).toHaveBeenCalledTimes(2);
  });

  it("uses controlled state and respects a canceled click", () => {
    const change = vi.fn();
    const { rerender } = render(
      <Button toggle pressed={false} onPressedChange={change}>
        Flag
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Flag", pressed: false });
    fireEvent.click(button);
    expect(change).toHaveBeenCalledWith(true);
    expect(button).toHaveAttribute("aria-pressed", "false");
    rerender(
      <Button
        toggle
        pressed
        onPressedChange={change}
        onClick={(event) => event.preventDefault()}
      >
        Flag
      </Button>,
    );
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(change).toHaveBeenCalledTimes(1);
  });

  it.each(["star", "pin"] as const)(
    "fills the %s and preserves its accessible name",
    (preset) => {
      render(
        <Button iconOnly aria-label="Save item" toggle={{ mode: "icon", preset }} />,
      );
      const button = screen.getByRole("button", {
        name: "Save item",
        pressed: false,
      });
      expect(button).toHaveAttribute("data-toggle-mode", "icon");
      expect(button.querySelector("svg")).toHaveAttribute("fill", "none");
      expect(button.querySelector("svg")).toHaveClass(
        preset === "star" ? "lucide-star" : "lucide-pin",
      );
      fireEvent.click(button);
      expect(button.querySelector("svg")).toHaveAttribute(
        "fill",
        "currentColor",
      );
      expect(
        screen.getByRole("button", { name: "Save item", pressed: true }),
      ).toBe(button);
    },
  );

  it("shows custom decorative icons ahead of legacy leading content while keeping the end", () => {
    render(
      <Button
        toggle={{
          mode: "icon",
          offIcon: <span>off icon</span>,
          onIcon: <span>on icon</span>,
        }}
        defaultPressed
        icon="legacy"
        leftSection="left"
        rightSection={<span aria-hidden>End</span>}
      >
        Pin item
      </Button>,
    );
    const button = screen.getByRole("button", {
      name: "Pin item",
      pressed: true,
    });
    expect(
      screen.getByText("on icon").closest("[aria-hidden=true]"),
    ).not.toBeNull();
    expect(screen.queryByText("left")).toBeNull();
    expect(screen.queryByText("legacy")).toBeNull();
    expect(screen.getByText("End")).toBeInTheDocument();
    fireEvent.click(button);
    expect(screen.getByText("off icon")).toBeInTheDocument();
    expect(screen.queryByText("on icon")).toBeNull();
  });

  it("cannot toggle while disabled, loading or inside disabled Fieldset", () => {
    const change = vi.fn();
    render(
      <>
        <Button toggle disabled onPressedChange={change}>
          Disabled
        </Button>
        <Button
          toggle={{ mode: "icon", preset: "star" }}
          loading
          defaultPressed
          onPressedChange={change}
        >
          Loading
        </Button>
        <Fieldset disabled>
          <Button toggle onPressedChange={change}>
            Inherited
          </Button>
        </Fieldset>
      </>,
    );
    for (const name of ["Disabled", "Loading", "Inherited"]) {
      const button = screen.getByRole("button", {
        name,
        pressed: name === "Loading",
      });
      expect(button).toBeDisabled();
      fireEvent.click(button);
    }
    expect(
      screen.getByRole("button", { name: "Loading" }).querySelector(".mt-spin"),
    ).not.toBeNull();
    expect(change).not.toHaveBeenCalled();
  });

  it("preserves native manually managed aria-pressed when opt-in is disabled", () => {
    render(
      <Button toggle={false} pressed aria-pressed="mixed">
        Manual
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Manual" });
    expect(button).toHaveAttribute("aria-pressed", "mixed");
    expect(button).not.toHaveAttribute("pressed");
    expect(button).not.toHaveAttribute("data-toggle-mode");
  });
});

it("documents a live, copyable demo for both toggle modes", async () => {
  const { buttonDocSections } = await import("../apps/docs/button-demos");
  const section = buttonDocSections.find(
    (item) => item.id === "button-toggle",
  )!;
  expect(section.source).toContain('from "@bixlab/mtone"');
  expect(section.source).toContain('preset: "star"');
  expect(section.source).toContain("offIcon");
  render(<section.Demo />);
  fireEvent.click(
    screen.getByRole("button", { name: "仅显示未读", pressed: false }),
  );
  expect(
    screen.getByRole("button", { name: "仅显示未读", pressed: true }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "置顶", pressed: false }));
  expect(
    screen.getByRole("button", { name: "置顶", pressed: true }),
  ).toBeInTheDocument();
});

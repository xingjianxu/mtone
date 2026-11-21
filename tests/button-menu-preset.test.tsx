import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../packages/mtone/src/basic";
import { Menu } from "../packages/mtone/src/interactive";

const items = [{ key: "edit", label: "Edit document" }];

describe("Dropdown preset and string Menu trigger", () => {
  it("adds a decorative trailing chevron without adding menu behavior", () => {
    const click = vi.fn();
    render(
      <Button preset="dropdown" onClick={click}>
        Choose
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Choose" });
    const icon = button.querySelector(".mt-btn-section-end svg");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveAttribute("width", "14");
    expect(icon).toHaveAttribute("height", "14");
    expect(button.lastElementChild).toContainElement(icon as SVGElement);
    expect(button).not.toHaveAttribute("preset");
    expect(button).not.toHaveAttribute("aria-haspopup");
    expect(button).not.toHaveAttribute("aria-expanded");
    fireEvent.click(button);
    expect(click).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("lets rightSection replace or explicitly suppress the preset chevron", () => {
    const { rerender } = render(
      <Button preset="dropdown" rightSection={<span>Custom</span>}>
        Choose
      </Button>,
    );
    expect(
      screen
        .getByRole("button", { name: "Choose Custom" })
        .querySelector("svg"),
    ).toBeNull();
    rerender(
      <Button preset="dropdown" rightSection={null}>
        Choose
      </Button>,
    );
    expect(
      screen
        .getByRole("button", { name: "Choose" })
        .querySelector(".mt-btn-section-end"),
    ).toBeNull();
    rerender(<Button>Choose</Button>);
    expect(
      screen.getByRole("button", { name: "Choose" }).querySelector("svg"),
    ).toBeNull();
  });

  it("renders a content-sized string trigger and restores its focus after Escape", async () => {
    const user = userEvent.setup();
    const selected = vi.fn();
    render(
      <Menu trigger="Document actions" items={items} onSelect={selected} />,
    );
    const trigger = screen.getByRole("button", { name: "Document actions" });
    expect(trigger).toHaveClass("mt-btn");
    expect(trigger.querySelector(".lucide-chevron-down")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");

    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(
      await screen.findByRole("menuitem", { name: "Edit document" }),
    ).toBeVisible();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    await user.click(
      await screen.findByRole("menuitem", { name: "Edit document" }),
    );
    expect(selected).toHaveBeenCalledWith("edit");
  });

  it("supports hover without taking focus and keeps custom element triggers unchanged", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>Current focus</button>
        <Menu trigger="Hover actions" triggerMode="hover" items={items} />
        <Menu
          trigger={<button className="custom">Custom trigger</button>}
          items={items}
        />
      </>,
    );
    const focus = screen.getByRole("button", { name: "Current focus" });
    focus.focus();
    await user.hover(screen.getByRole("button", { name: "Hover actions" }));
    expect(
      await screen.findByRole("menuitem", { name: "Edit document" }),
    ).toBeVisible();
    expect(focus).toHaveFocus();
    const custom = screen.getByRole("button", { name: "Custom trigger" });
    expect(custom).toHaveClass("custom");
    expect(custom.querySelector("svg")).toBeNull();
    expect(custom.style.width).toBe("");
  });
});

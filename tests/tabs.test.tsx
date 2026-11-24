import React, { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Tabs } from "../packages/mtone/src";
const items = [
  {
    value: "a",
    label: "Alpha",
    content: <input aria-label="draft" defaultValue="" />,
  },
  { value: "b", label: "Beta", content: "Beta panel" },
  { value: "c", label: "Closed", content: "C", disabled: true },
];
describe("Tabs extensions", () => {
  it("renders placement, variant, icons and extra content", () => {
    const { container } = render(
      <Tabs
        items={[{ ...items[0], icon: <span data-testid="icon" /> }]}
        placement="start"
        variant="card"
        size="small"
        extraStart="Before"
        extraEnd="After"
        label="Views"
      />,
    );
    expect(screen.getByRole("tablist", { name: "Views" })).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
    expect(container.firstChild).toHaveAttribute("data-placement", "start");
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("Before")).toBeInTheDocument();
  });
  it("requests add/remove without altering caller data or selecting closed tab", async () => {
    const user = userEvent.setup(),
      edit = vi.fn(),
      change = vi.fn();
    render(
      <Tabs
        items={items}
        variant="editable-card"
        onEdit={edit}
        onValueChange={change}
      />,
    );
    await user.click(screen.getByRole("button", { name: "关闭 Beta" }));
    expect(edit).toHaveBeenCalledWith("remove", "b");
    expect(change).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "添加标签" }));
    expect(edit).toHaveBeenCalledWith("add");
    expect(screen.getByRole("tab", { name: "Beta" })).toBeInTheDocument();
  });
  it("keeps visited content only when requested", async () => {
    const user = userEvent.setup();
    render(<Tabs items={items} destroyOnHidden={false} />);
    await user.type(screen.getByLabelText("draft"), "kept");
    await user.click(screen.getByRole("tab", { name: "Beta" }));
    await user.click(screen.getByRole("tab", { name: "Alpha" }));
    expect(screen.getByLabelText("draft")).toHaveValue("kept");
  });
  it("preserves legacy destroy behavior", async () => {
    const user = userEvent.setup();
    render(<Tabs items={items} />);
    await user.type(screen.getByLabelText("draft"), "discard");
    await user.click(screen.getByRole("tab", { name: "Beta" }));
    expect(screen.queryByLabelText("draft")).not.toBeInTheDocument();
  });
  it("force renders panels without making them visible", () => {
    render(<Tabs items={[items[0], { ...items[1], forceRender: true }]} />);
    expect(screen.getByText("Beta panel")).not.toBeVisible();
  });
  it("requests keyboard reorder without mutating items", () => {
    const order = vi.fn();
    render(<Tabs items={items} reorderable onOrderChange={order} />);
    fireEvent.keyDown(screen.getByRole("tab", { name: "Alpha" }), {
      key: "ArrowRight",
      altKey: true,
      shiftKey: true,
    });
    expect(order).toHaveBeenCalledWith(["b", "a", "c"]);
    expect(screen.getAllByRole("tab")[0]).toHaveTextContent("Alpha");
  });
  it("supports manual keyboard activation", async () => {
    const user = userEvent.setup();
    render(<Tabs items={items} />);
    screen.getByRole("tab", { name: "Alpha" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Beta" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Alpha" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.keyboard("{Enter}");
    expect(screen.getByRole("tab", { name: "Beta" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
  it("recovers to enabled tab when active item is removed", async () => {
    const { rerender } = render(<Tabs items={items} defaultValue="b" />);
    rerender(<Tabs items={[items[0], items[2]]} defaultValue="b" />);
    await waitFor(() =>
      expect(screen.getByRole("tab", { name: "Alpha" })).toHaveAttribute(
        "aria-selected",
        "true",
      ),
    );
  });
  it("handles no enabled items without emitting string null", async () => {
    const change = vi.fn();
    render(<Tabs items={[items[2]]} onValueChange={change} />);
    await waitFor(() =>
      expect(screen.getByRole("tab", { name: "Closed" })).toHaveAttribute(
        "aria-selected",
        "false",
      ),
    );
    expect(change).not.toHaveBeenCalledWith("null");
  });
  it("honors RTL arrow navigation", async () => {
    const user = userEvent.setup();
    render(<Tabs items={items} dir="rtl" />);
    screen.getByRole("tab", { name: "Alpha" }).focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Beta" })).toHaveFocus();
  });
  it("does not steal focus when a removal is declined", async () => {
    const user = userEvent.setup();
    const edit = vi.fn();
    const { rerender } = render(
      <>
        <input aria-label="Elsewhere" />
        <Tabs items={items} variant="editable-card" onEdit={edit} />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "关闭 Beta" }));
    screen.getByLabelText("Elsewhere").focus();
    rerender(
      <>
        <input aria-label="Elsewhere" />
        <Tabs items={[...items]} variant="editable-card" onEdit={edit} />
      </>,
    );
    expect(screen.getByLabelText("Elsewhere")).toHaveFocus();
  });
  it("restores focus after removing the active tab", async () => {
    const user = userEvent.setup();
    function Editable() {
      const [list, setList] = useState(items);
      return (
        <Tabs
          items={list}
          variant="editable-card"
          onEdit={(_, key) => setList(list.filter((i) => i.value !== key))}
        />
      );
    }
    render(<Editable />);
    await user.click(screen.getByRole("button", { name: "关闭 Alpha" }));
    await waitFor(() =>
      expect(screen.getByRole("tab", { name: "Beta" })).toHaveFocus(),
    );
  });
  it("does not activate a disabled tab", async () => {
    const user = userEvent.setup();
    render(<Tabs items={items} />);
    await user.click(screen.getByRole("tab", { name: "Closed" }));
    expect(screen.getByRole("tab", { name: "Alpha" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});

describe("line indicator color", () => {
  it("maps preset names to shared theme tokens and accepts arbitrary CSS colors", () => {
    const {container, rerender} = render(<Tabs items={items} indicatorColor="teal" />);
    const root = () => container.querySelector<HTMLElement>(".mt-tabs")!;
    expect(root().style.getPropertyValue("--mt-tabs-indicator-color")).toBe("var(--mt-accent-teal)");
    rerender(<Tabs items={items} indicatorColor="coral" />);
    expect(root().style.getPropertyValue("--mt-tabs-indicator-color")).toBe("var(--mt-accent-coral)");
    rerender(<Tabs items={items} indicatorColor="oklch(62% .16 33)" />);
    expect(root().style.getPropertyValue("--mt-tabs-indicator-color")).toBe("oklch(62% .16 33)");
    rerender(<Tabs items={items} indicatorColor="var(--custom-color)" />);
    expect(root().style.getPropertyValue("--mt-tabs-indicator-color")).toBe("var(--custom-color)");
    rerender(<Tabs items={items} />);
    expect(root().style.getPropertyValue("--mt-tabs-indicator-color")).toBe("");
  });

  it("does not apply line indicator props to either card variant", () => {
    const {container, rerender} = render(<Tabs items={items} variant="card" indicatorColor="red" />);
    const root = () => container.querySelector<HTMLElement>(".mt-tabs")!;
    expect(root().style.getPropertyValue("--mt-tabs-indicator-color")).toBe("");
    rerender(<Tabs items={items} variant="editable-card" indicatorColor="red" />);
    expect(root().style.getPropertyValue("--mt-tabs-indicator-color")).toBe("");
  });
});

it.each(["bottom", "start", "end"] as const)(
  "attached uses line presentation at %s without changing placement or orientation",
  (placement) => {
    const { container } = render(<Tabs variant="attached" placement={placement} items={items} />);
    expect(container.firstChild).toHaveAttribute("data-variant", "line");
    expect(container.firstChild).toHaveAttribute("data-placement", placement);
    const orientation = screen.getByRole("tablist").getAttribute("aria-orientation") ?? "horizontal";
    expect(orientation).toBe(placement === "bottom" ? "horizontal" : "vertical");
  },
);


it("defaults to md and exposes the requested height preset without remounting tab content", () => {
  const items = [{ value: "a", label: "A", content: <input aria-label="Draft" defaultValue="Keep" /> }];
  const { rerender } = render(<Tabs items={items} />);
  const field = screen.getByRole("textbox", { name: "Draft" });
  expect(screen.getByRole("tablist").closest(".mt-tabs")).toHaveAttribute("data-size", "md");
  rerender(<Tabs items={items} size="sm" />);
  expect(screen.getByRole("tablist").closest(".mt-tabs")).toHaveAttribute("data-size", "sm");
  expect(screen.getByRole("textbox", { name: "Draft" })).toBe(field);
});

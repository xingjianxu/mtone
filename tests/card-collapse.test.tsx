import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { test, expect, vi } from "vitest";
import { Card } from "../packages/mtone/src/card";
import { MtoneProvider } from "../packages/mtone/src/basic";

test("collapse uses a distinct accessible button and hides every content section", () => {
  render(
    <Card
      collapsible
      title="Notes"
      extra={<button>Menu</button>}
      cover={<img alt="Cover" />}
      tabList={[{ key: "a", label: "Overview" }]}
      actions={[<button key="save">Save</button>]}
    >
      <input aria-label="Note" />
    </Card>,
  );
  const toggle = screen.getByRole("button", { name: "收起卡片" });
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  const region = document.getElementById(toggle.getAttribute("aria-controls")!);
  expect(region).toBeTruthy();
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(region).toHaveAttribute("hidden");
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Save" }),
  ).not.toBeInTheDocument();
  expect(screen.getByText("Notes")).toBeVisible();
  expect(screen.getByRole("button", { name: "Menu" })).toBeVisible();
});
test("title and extra actions do not toggle collapse or become nested controls", () => {
  const change = vi.fn();
  const title = vi.fn();
  const extra = vi.fn();
  render(
    <Card
      collapsible
      onCollapsedChange={change}
      title={<button onClick={title}>Title action</button>}
      extra={<button onClick={extra}>Extra action</button>}
    >
      Body
    </Card>,
  );
  fireEvent.click(screen.getByText("Title action"));
  fireEvent.click(screen.getByText("Extra action"));
  expect(title).toHaveBeenCalledTimes(1);
  expect(extra).toHaveBeenCalledTimes(1);
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByText("Body")).toBeVisible();
  expect(
    screen
      .getByText("Title action")
      .closest("button")
      ?.parentElement?.closest("button"),
  ).toBeNull();
});
test("collapse preserves mounted input state and selected tab", () => {
  render(
    <Card
      collapsible
      tabList={[
        { key: "a", label: "First", content: <span>First body</span> },
        {
          key: "b",
          label: "Second",
          content: <input aria-label="Draft" defaultValue="initial" />,
        },
      ]}
    />,
  );
  fireEvent.click(screen.getByRole("tab", { name: "Second" }));
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "edited" } });
  fireEvent.click(screen.getByRole("button", { name: "收起卡片" }));
  expect(input).toBeInTheDocument();
  expect(input).not.toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "展开卡片" }));
  expect(screen.getByRole("textbox")).toBe(input);
  expect(input).toHaveValue("edited");
  expect(screen.getByRole("tab", { name: "Second" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});
test("controlled state requests change but waits for parent", () => {
  const change = vi.fn();
  const { rerender } = render(
    <Card collapsible collapsed onCollapsedChange={change}>
      Body
    </Card>,
  );
  fireEvent.click(screen.getByRole("button"));
  expect(change).toHaveBeenCalledWith(false);
  expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
  rerender(
    <Card collapsible collapsed={false} onCollapsedChange={change}>
      Body
    </Card>,
  );
  expect(screen.getByText("Body")).toBeVisible();
});
test("defaultCollapsed initializes only and changes notify", () => {
  const change = vi.fn();
  const { rerender } = render(
    <Card collapsible defaultCollapsed onCollapsedChange={change}>
      Body
    </Card>,
  );
  expect(screen.getByText("Body")).not.toBeVisible();
  fireEvent.click(screen.getByRole("button"));
  expect(change).toHaveBeenLastCalledWith(false);
  rerender(
    <Card collapsible defaultCollapsed onCollapsedChange={change}>
      Body
    </Card>,
  );
  expect(screen.getByText("Body")).toBeVisible();
});
test("noncollapsible retains bare Card DOM even with collapse state props", () => {
  const { container } = render(
    <Card
      collapsible={false}
      collapsed
      defaultCollapsed
      onCollapsedChange={() => {}}
      collapseLabel="Toggle"
    >
      <span>Body</span>
    </Card>,
  );
  const card = container.firstElementChild!;
  expect(card).toHaveClass("mt-card");
  expect(card).not.toHaveClass("mt-card-structured");
  expect(card.children).toHaveLength(1);
  expect(card.firstElementChild?.tagName).toBe("SPAN");
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  expect(card).not.toHaveAttribute("collapsed");
});
test("multiple cards have stable distinct controls IDs, custom labels and localized fallback", () => {
  const { rerender } = render(
    <>
      <Card collapsible collapseLabel="Details">
        One
      </Card>
      <MtoneProvider locale="en">
        <Card collapsible>Two</Card>
      </MtoneProvider>
    </>,
  );
  const first = screen.getByRole("button", { name: "Details" }),
    second = screen.getByRole("button", { name: "Collapse card" });
  const id = first.getAttribute("aria-controls");
  expect(id).not.toBe(second.getAttribute("aria-controls"));
  fireEvent.click(second);
  expect(screen.getByRole("button", { name: "Expand card" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  rerender(
    <>
      <Card collapsible collapseLabel="Details">
        One
      </Card>
      <MtoneProvider locale="en">
        <Card collapsible>Two</Card>
      </MtoneProvider>
    </>,
  );
  expect(first).toHaveAttribute("aria-controls", id);
});
test("loading status is hidden when collapsed and Card.Grid remains mounted", () => {
  render(
    <>
      <Card collapsible defaultCollapsed loading title="Loading">
        Hidden
      </Card>
      <Card collapsible size="small">
        <Card.Grid>Grid</Card.Grid>
      </Card>
    </>,
  );
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
  expect(screen.getByText("Grid")).toHaveClass("mt-card-grid");
  fireEvent.click(screen.getByRole("button", { name: "展开卡片" }));
  expect(screen.getByRole("status")).toBeVisible();
});

test("collapse button never submits its surrounding form", () => {
  const submit = vi.fn((e) => e.preventDefault());
  render(
    <form onSubmit={submit}>
      <Card collapsible>Form content</Card>
    </form>,
  );
  fireEvent.click(screen.getByRole("button"));
  expect(submit).not.toHaveBeenCalled();
  expect(screen.getByRole("button")).toHaveAttribute("type", "button");
});
test("noncollapsible structured cards retain native data attributes and no content wrapper", () => {
  const { container } = render(
    <Card title="Title" data-collapsed="custom" collapsible={false}>
      Body
    </Card>,
  );
  expect(container.firstElementChild).toHaveAttribute(
    "data-collapsed",
    "custom",
  );
  expect(container.querySelector(".mt-card-collapse-content")).toBeNull();
});

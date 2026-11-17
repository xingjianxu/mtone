import React, { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Timeline } from "../packages/mtone/src";

test("renders semantic ordered items with title and content", () => {
  render(
    <Timeline
      aria-label="History"
      items={[{ title: "Today", content: "Created" }, { content: "Saved" }]}
    />,
  );
  expect(screen.getByRole("list", { name: "History" }).tagName).toBe("OL");
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(screen.getByText("Today")).toHaveClass("mt-timeline-title");
  expect(screen.getByText("Created")).toHaveClass("mt-timeline-content");
});
test("reverses without mutating input and supports pending", () => {
  const items = Object.freeze([{ content: "A" }, { content: "B" }]);
  render(<Timeline items={items} pending="Waiting" reverse />);
  expect(screen.getAllByRole("listitem").map((e) => e.textContent)).toEqual([
    "Waiting",
    "B",
    "A",
  ]);
  expect(items[0].content).toBe("A");
  expect(screen.getByText("Waiting").closest("li")).toHaveAttribute(
    "aria-busy",
    "true",
  );
});
test("supports alternate, explicit placement, aliases and custom icon", () => {
  render(
    <Timeline
      mode="alternate"
      items={[
        { children: "Old", label: "Date", dot: <b>!</b> },
        { content: "New", placement: "start" },
        { content: "End", position: "right" },
      ]}
    />,
  );
  const rows = screen.getAllByRole("listitem");
  expect(rows.map((e) => e.getAttribute("data-placement"))).toEqual([
    "start",
    "start",
    "end",
  ]);
  expect(screen.getByText("Date")).toBeInTheDocument();
  expect(screen.getByText("!")).toBeInTheDocument();
});
test("applies horizontal, filled, semantic styles and native ref", () => {
  const ref = createRef<HTMLOListElement>();
  render(
    <Timeline
      ref={ref}
      orientation="horizontal"
      variant="filled"
      titleSpan={100}
      classNames={{ content: "custom" }}
      styles={{ title: { fontWeight: 600 } }}
      items={[{ title: "T", content: "C", color: "red", loading: true }]}
    />,
  );
  expect(ref.current).toHaveAttribute("data-orientation", "horizontal");
  expect(ref.current).toHaveAttribute("data-variant", "filled");
  expect(ref.current?.style.getPropertyValue("--mt-timeline-title-span")).toBe(
    "100px",
  );
  expect(screen.getByText("C")).toHaveClass("custom");
  expect(screen.getByText("T")).toHaveStyle({ fontWeight: 600 });
  expect(screen.getByRole("listitem")).toHaveAttribute("aria-busy", "true");
});
test("handles empty items, zero-valued content and false pending", () => {
  const { rerender } = render(<Timeline />);
  expect(screen.queryByRole("listitem")).toBeNull();
  rerender(
    <Timeline pending={false} items={[{ title: 0, content: 0, icon: null }]} />,
  );
  expect(screen.getAllByText("0")).toHaveLength(2);
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
});

test("explicit null new fields suppress legacy aliases", () => {
  render(
    <Timeline
      items={[
        {
          title: null,
          label: "Hidden label",
          content: null,
          children: "Hidden child",
          icon: null,
          dot: "Hidden icon",
        },
      ]}
    />,
  );
  expect(screen.queryByText(/Hidden/)).toBeNull();
});

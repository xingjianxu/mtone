import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { Calendar, MtoneProvider } from "../packages/mtone/src";
test("renders six weeks and selects dates with source", () => {
  const select = vi.fn();
  render(<Calendar defaultValue="2024-02-15" locale="en" onSelect={select} />);
  expect(screen.getAllByRole("gridcell")).toHaveLength(42);
  fireEvent.click(screen.getByRole("button", { name: "2024-02-29" }));
  expect(select).toHaveBeenCalledWith("2024-02-29", { source: "date" });
  expect(screen.getByRole("gridcell", { selected: true })).toHaveTextContent(
    "29",
  );
});
test("controlled value refuses changes while notifying consumer", () => {
  const change = vi.fn();
  render(<Calendar value="2024-02-15" onChange={change} />);
  fireEvent.click(screen.getByRole("button", { name: "2024-02-16" }));
  expect(change).toHaveBeenCalledWith("2024-02-16");
  expect(screen.getByRole("gridcell", { selected: true })).toHaveTextContent(
    "15",
  );
});
test("range and disabled dates prevent selection", () => {
  const select = vi.fn();
  render(
    <Calendar
      defaultValue="2024-02-15"
      validRange={["2024-02-10", "2024-02-20"]}
      disabledDate={(d) => d === "2024-02-16"}
      onSelect={select}
    />,
  );
  expect(screen.getByRole("button", { name: "2024-02-09" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "2024-02-16" }));
  expect(select).not.toHaveBeenCalled();
});
test("keyboard changes focus not selection until Enter", () => {
  const change = vi.fn();
  render(<Calendar defaultValue="2024-02-28" locale="en" onChange={change} />);
  const button = screen.getByRole("button", { name: "2024-02-28" });
  button.focus();
  fireEvent.keyDown(button, { key: "ArrowRight" });
  expect(screen.getByRole("button", { name: "2024-02-29" })).toHaveFocus();
  expect(change).not.toHaveBeenCalled();
  fireEvent.keyDown(document.activeElement!, { key: "Enter" });
  expect(change).toHaveBeenCalledWith("2024-02-29");
});
test("year view displays twelve months and clamps leap day on navigation", () => {
  const change = vi.fn();
  render(
    <Calendar
      defaultValue="2024-02-29"
      defaultMode="year"
      locale="en"
      onChange={change}
    />,
  );
  expect(screen.getAllByRole("gridcell")).toHaveLength(12);
  fireEvent.click(screen.getByRole("button", { name: "Next year" }));
  expect(change).toHaveBeenCalledWith("2025-02-28");
});
test("custom renders and provider locale", () => {
  render(
    <MtoneProvider locale="en">
      <Calendar
        defaultValue="2024-02-15"
        cellRender={(d) => (d === "2024-02-15" ? <span>Meeting</span> : null)}
        showWeek
      />
    </MtoneProvider>,
  );
  expect(screen.getByText("Meeting")).toBeInTheDocument();
  expect(
    screen.getByRole("columnheader", { name: "Week" }),
  ).toBeInTheDocument();
});
test("custom header receives guarded navigation", () => {
  const change = vi.fn();
  render(
    <Calendar
      defaultValue="2024-02-15"
      onChange={change}
      validRange={["2024-02-01", "2024-02-29"]}
      headerRender={({ onChange }) => (
        <button onClick={() => onChange("2025-01-01")}>Custom</button>
      )}
    />,
  );
  fireEvent.click(screen.getByText("Custom"));
  expect(change).toHaveBeenCalledWith("2024-02-29");
});
test("supports extreme years without invalid date containers", () => {
  const { rerender } = render(<Calendar value="0001-01-01" locale="en" />);
  expect(screen.getAllByRole("gridcell")).toHaveLength(42);
  rerender(<Calendar value="9999-12-31" locale="en" />);
  expect(screen.getAllByRole("gridcell")).toHaveLength(42);
  expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
});
test("keyboard can traverse disabled days without selecting them", () => {
  const change = vi.fn();
  render(
    <Calendar
      defaultValue="2024-02-15"
      disabledDate={(d) => d === "2024-02-16"}
      onChange={change}
    />,
  );
  const b = screen.getByRole("button", { name: "2024-02-15" });
  b.focus();
  fireEvent.keyDown(b, { key: "ArrowRight" });
  expect(screen.getByRole("button", { name: "2024-02-17" })).toHaveFocus();
});
test("controlled rejected next-month selection retains displayed month", () => {
  render(<Calendar value="2024-02-15" locale="en" />);
  fireEvent.click(screen.getByRole("button", { name: "2024-03-01" }));
  expect(screen.getByRole("grid")).toHaveAttribute("aria-label", "Feb 2024");
});
test("navigation can enter a month when corresponding day is disabled", () => {
  render(
    <Calendar
      defaultValue="2024-02-15"
      disabledDate={(d) => d === "2024-03-15"}
      locale="en"
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Next month" }));
  expect(screen.getByRole("grid")).toHaveAttribute("aria-label", "Mar 2024");
});
test("all-disabled keyboard navigation terminates without change", () => {
  const change = vi.fn();
  render(
    <Calendar
      defaultValue="2024-02-15"
      disabledDate={() => true}
      onChange={change}
    />,
  );
  expect(screen.getAllByRole("gridcell")).toHaveLength(42);
  expect(change).not.toHaveBeenCalled();
});
test("invalid input and reversed ranges fail clearly", () => {
  expect(() => render(<Calendar value="2024-02-30" />)).toThrow(RangeError);
  expect(() =>
    render(<Calendar validRange={["2024-03-01", "2024-02-01"]} />),
  ).toThrow(RangeError);
});
test("extreme year with week numbers and disabled initial value remain usable", () => {
  const { rerender } = render(<Calendar value="9999-12-31" showWeek />);
  expect(screen.getAllByRole("gridcell")).toHaveLength(42);
  rerender(
    <Calendar
      defaultValue="2024-02-15"
      disabledDate={(d) => d === "2024-02-15"}
    />,
  );
  expect(
    document.querySelectorAll('.mt-calendar-day[tabindex="0"]'),
  ).toHaveLength(1);
});
test("controlled external update preserves grid focus but never steals external focus", () => {
  const { rerender } = render(<Calendar value="2024-02-15" />);
  screen.getByRole("button", { name: "2024-02-15" }).focus();
  rerender(<Calendar value="2024-03-15" />);
  expect(screen.getByRole("button", { name: "2024-03-15" })).toHaveFocus();
  const outside = document.createElement("button");
  document.body.append(outside);
  outside.focus();
  rerender(<Calendar value="2024-04-15" />);
  expect(outside).toHaveFocus();
  outside.remove();
});
test("controlled mode can reject change", () => {
  const panel = vi.fn();
  render(
    <Calendar
      value="2024-02-15"
      mode="month"
      locale="en"
      onPanelChange={panel}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Year" }));
  expect(screen.getAllByRole("gridcell")).toHaveLength(42);
  expect(panel).toHaveBeenCalledWith("2024-02-15", "year");
});
test("Home End and shift PageDown follow configured week and year", () => {
  render(<Calendar defaultValue="2024-02-15" weekStartsOn={1} />);
  let b = screen.getByRole("button", { name: "2024-02-15" });
  b.focus();
  fireEvent.keyDown(b, { key: "Home" });
  expect(screen.getByRole("button", { name: "2024-02-12" })).toHaveFocus();
  fireEvent.keyDown(document.activeElement!, { key: "End" });
  expect(screen.getByRole("button", { name: "2024-02-18" })).toHaveFocus();
  fireEvent.keyDown(document.activeElement!, {
    key: "PageDown",
    shiftKey: true,
  });
  expect(screen.getByRole("button", { name: "2025-02-18" })).toHaveFocus();
});
test("dynamic disabledDate moves grid focus to available fallback", () => {
  const { rerender } = render(<Calendar value="2024-02-15" />);
  screen.getByRole("button", { name: "2024-02-15" }).focus();
  rerender(
    <Calendar value="2024-02-15" disabledDate={(d) => d === "2024-02-15"} />,
  );
  expect(document.activeElement).not.toBe(
    screen.getByRole("button", { name: "2024-02-15" }),
  );
  expect(document.activeElement).toHaveClass("mt-calendar-day");
});
test("year keyboard skips a fully disabled month", () => {
  render(
    <Calendar
      defaultValue="2024-02-15"
      defaultMode="year"
      disabledDate={(d) => d.startsWith("2024-03")}
    />,
  );
  const b = screen.getByRole("button", { name: "2024-02" });
  b.focus();
  fireEvent.keyDown(b, { key: "ArrowRight" });
  expect(screen.getByRole("button", { name: "2024-04" })).toHaveFocus();
});

test("does not reclaim grid focus after intentional blur to body", () => {
  const { rerender } = render(<Calendar value="2024-02-15" />);
  const b = screen.getByRole("button", { name: "2024-02-15" });
  b.focus();
  b.blur();
  expect(document.body).toHaveFocus();
  rerender(<Calendar value="2024-05-15" />);
  expect(document.body).toHaveFocus();
});

import React, { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { Rate, MtoneProvider } from "../packages/mtone/src";

function character(index: number) {
  return screen
    .getByRole("slider")
    .querySelectorAll<HTMLElement>(".mt-rate-character")[index];
}
function geometry(element: HTMLElement) {
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
    left: 100,
    right: 124,
    width: 24,
    top: 0,
    bottom: 24,
    height: 24,
    x: 100,
    y: 0,
    toJSON: () => ({}),
  });
}

test("selects an integer rating and clears the same rating on repeated click", () => {
  const change = vi.fn();
  render(<Rate onChange={change} aria-label="Quality" />);
  const slider = screen.getByRole("slider", { name: "Quality" });
  expect(slider).toHaveAttribute("aria-valuenow", "0");
  expect(slider).toHaveAttribute("aria-valuemax", "5");
  expect(slider.querySelectorAll(".mt-rate-character")).toHaveLength(5);
  fireEvent.click(character(2));
  expect(slider).toHaveAttribute("aria-valuenow", "3");
  expect(change).toHaveBeenLastCalledWith(3);
  fireEvent.click(character(2));
  expect(change).toHaveBeenLastCalledWith(0);
  expect(slider).toHaveAttribute("aria-valuenow", "0");
});

test("half rating uses the clicked character's first half, not the root", () => {
  render(<Rate allowHalf />);
  geometry(character(2));
  fireEvent.click(character(2), { clientX: 104, detail: 1 });
  expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "2.5");
  fireEvent.click(character(2), { clientX: 120, detail: 1 });
  expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "3");
});

test("controlled value is retained when the parent declines a change", () => {
  const change = vi.fn();
  const { rerender } = render(<Rate value={2} onChange={change} />);
  fireEvent.click(character(4));
  expect(change).toHaveBeenCalledWith(5);
  expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "2");
  rerender(<Rate value={4} onChange={change} />);
  expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "4");
});

test("allowClear false keeps repeated selection and prevents clearing keys", () => {
  const change = vi.fn();
  render(<Rate defaultValue={2} allowClear={false} onChange={change} />);
  fireEvent.click(character(1));
  fireEvent.keyDown(screen.getByRole("slider"), { key: "Delete" });
  expect(change).not.toHaveBeenCalled();
  fireEvent.keyDown(screen.getByRole("slider"), { key: "Home" });
  expect(change).toHaveBeenLastCalledWith(1);
});

test("keyboard supports half steps, boundaries and clear without repeated change events", () => {
  const change = vi.fn();
  render(<Rate allowHalf defaultValue={2} onChange={change} />);
  const slider = screen.getByRole("slider");
  fireEvent.keyDown(slider, { key: "ArrowRight" });
  expect(change).toHaveBeenLastCalledWith(2.5);
  fireEvent.keyDown(slider, { key: "ArrowDown" });
  expect(change).toHaveBeenLastCalledWith(2);
  fireEvent.keyDown(slider, { key: "End" });
  expect(change).toHaveBeenLastCalledWith(5);
  const calls = change.mock.calls.length;
  fireEvent.keyDown(slider, { key: "ArrowUp" });
  expect(change).toHaveBeenCalledTimes(calls);
  fireEvent.keyDown(slider, { key: "Backspace" });
  expect(slider).toHaveAttribute("aria-valuenow", "0");
});

test("keyboard false allows pointer use without intercepting arrow keys", () => {
  render(<Rate keyboard={false} />);
  const slider = screen.getByRole("slider");
  expect(fireEvent.keyDown(slider, { key: "ArrowRight" })).toBe(true);
  expect(slider).toHaveAttribute("aria-valuenow", "0");
  fireEvent.click(character(1));
  expect(slider).toHaveAttribute("aria-valuenow", "2");
});

test("consumer keydown can prevent the default rating update", () => {
  const change = vi.fn();
  render(<Rate onChange={change} onKeyDown={(e) => e.preventDefault()} />);
  fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });
  expect(change).not.toHaveBeenCalled();
});

test("disabled blocks preview, click and keyboard and removes the tab stop", () => {
  const change = vi.fn(),
    hover = vi.fn();
  render(
    <Rate disabled defaultValue={2} onChange={change} onHoverChange={hover} />,
  );
  const slider = screen.getByRole("slider");
  expect(slider).toHaveAttribute("aria-disabled", "true");
  expect(slider).toHaveAttribute("tabindex", "-1");
  fireEvent.pointerMove(character(4));
  fireEvent.click(character(4));
  fireEvent.keyDown(slider, { key: "End" });
  expect(change).not.toHaveBeenCalled();
  expect(hover).not.toHaveBeenCalled();
  expect(slider).toHaveAttribute("aria-valuenow", "2");
});

test("preview and tooltip restore on pointer leave without changing committed value", () => {
  const hover = vi.fn();
  render(
    <Rate
      defaultValue={2}
      tooltips={["Poor", "Fair", "Good", "Great", "Excellent"]}
      onHoverChange={hover}
    />,
  );
  const slider = screen.getByRole("slider");
  fireEvent.pointerMove(character(3));
  expect(hover).toHaveBeenLastCalledWith(4);
  expect(slider).toHaveAttribute("data-preview", "4");
  expect(slider).toHaveAttribute("aria-valuenow", "2");
  expect(slider).toHaveAttribute("aria-valuetext", "2 / 5，Fair");
  expect(screen.getByRole("tooltip")).toHaveTextContent("Great");
  fireEvent.pointerLeave(slider);
  expect(hover).toHaveBeenLastCalledWith(undefined);
  expect(slider).not.toHaveAttribute("data-preview");
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});

test("pointer cancel clears preview and touch does not create sticky hover", () => {
  render(<Rate />);
  const slider = screen.getByRole("slider");
  fireEvent.pointerMove(character(3));
  fireEvent.pointerCancel(slider);
  expect(slider).not.toHaveAttribute("data-preview");
});

test("RTL reverses pointer halves and horizontal arrows", () => {
  render(<Rate dir="rtl" allowHalf defaultValue={2} />);
  geometry(character(2));
  fireEvent.click(character(2), { clientX: 120, detail: 1 });
  const slider = screen.getByRole("slider");
  expect(slider).toHaveAttribute("aria-valuenow", "2.5");
  fireEvent.keyDown(slider, { key: "ArrowLeft" });
  expect(slider).toHaveAttribute("aria-valuenow", "3");
  fireEvent.keyDown(slider, { key: "ArrowRight" });
  expect(slider).toHaveAttribute("aria-valuenow", "2.5");
});

test("normalizes out of range and fractional values, count and step changes", () => {
  const change = vi.fn();
  const { rerender } = render(<Rate defaultValue={9.2} onChange={change} />);
  expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "5");
  rerender(<Rate defaultValue={9.2} count={3} onChange={change} />);
  expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "3");
  expect(change).not.toHaveBeenCalled();
  rerender(<Rate value={2.3} allowHalf />);
  expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "2.5");
  rerender(<Rate value={-1} />);
  expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "0");
});

test("validates count and values rather than rendering NaN or an invalid slider", () => {
  expect(() => render(<Rate count={0} />)).toThrow(RangeError);
  expect(() => render(<Rate count={2.5} />)).toThrow(RangeError);
  expect(() => render(<Rate value={NaN} />)).toThrow(RangeError);
});

test("supports per-character rendering, sizes and an imperative DOM ref", () => {
  const ref = createRef<HTMLSpanElement>();
  const focus = vi.fn(),
    blur = vi.fn();
  render(
    <Rate
      ref={ref}
      size="small"
      count={3}
      character={({ index }) => <span>{index + 1}</span>}
      onFocus={focus}
      onBlur={blur}
    />,
  );
  expect(screen.getByRole("slider")).toHaveClass("mt-rate-small");
  expect(character(2)).toHaveTextContent("3");
  ref.current!.focus();
  expect(screen.getByRole("slider")).toHaveFocus();
  expect(focus).toHaveBeenCalledTimes(1);
  ref.current!.blur();
  expect(blur).toHaveBeenCalledTimes(1);
});

test("locale controls the default accessible label and value text", () => {
  render(
    <MtoneProvider locale="en">
      <Rate defaultValue={2} tooltips={["Poor", "Fair"]} />
    </MtoneProvider>,
  );
  expect(screen.getByRole("slider", { name: "Rating" })).toHaveAttribute(
    "aria-valuetext",
    "2 / 5, Fair",
  );
});

test("dynamic disabled/count/step/value changes remove stale pointer preview", () => {
  const hover = vi.fn();
  const { rerender } = render(<Rate onHoverChange={hover} />);
  fireEvent.pointerMove(character(4));
  rerender(<Rate count={3} onHoverChange={hover} />);
  expect(screen.getByRole("slider")).not.toHaveAttribute("data-preview");
  expect(hover).toHaveBeenLastCalledWith(undefined);
  fireEvent.pointerMove(character(2));
  rerender(<Rate count={3} disabled onHoverChange={hover} />);
  expect(screen.getByRole("slider")).not.toHaveAttribute("data-preview");
  rerender(<Rate count={3} allowHalf onHoverChange={hover} />);
  fireEvent.pointerMove(character(2));
  rerender(<Rate count={3} value={1.5} allowHalf onHoverChange={hover} />);
  expect(screen.getByRole("slider")).not.toHaveAttribute("data-preview");
  expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "1.5");
});

test("exposes a keyboard focus tooltip and permits custom accessible text", () => {
  render(
    <Rate
      defaultValue={2}
      tooltips={["Poor", "Fair"]}
      aria-valuetext="Two stars"
    />,
  );
  fireEvent.focus(screen.getByRole("slider"));
  expect(screen.getByRole("tooltip")).toHaveTextContent("Fair");
  expect(screen.getByRole("slider")).toHaveAttribute(
    "aria-valuetext",
    "Two stars",
  );
  fireEvent.blur(screen.getByRole("slider"));
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});

test("Escape dismisses a focused tooltip until the next interaction", () => {
  render(<Rate defaultValue={2} tooltips={["Poor", "Fair", "Good"]} />);
  const slider = screen.getByRole("slider");
  fireEvent.focus(slider);
  expect(screen.getByRole("tooltip")).toHaveTextContent("Fair");
  fireEvent.keyDown(slider, { key: "Escape" });
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  expect(slider).toHaveAttribute("aria-valuenow", "2");
  fireEvent.keyDown(slider, { key: "ArrowRight" });
  expect(screen.getByRole("tooltip")).toHaveTextContent("Good");
});

test("Escape dismisses tooltips even when rating keyboard shortcuts are disabled", () => {
  render(<Rate keyboard={false} defaultValue={1} tooltips={["Poor"]} />);
  fireEvent.focus(screen.getByRole("slider"));
  fireEvent.keyDown(screen.getByRole("slider"), { key: "Escape" });
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});

test("tooltip is portalled outside a clipping container and linked to the slider", () => {
  const { container } = render(
    <div style={{ overflow: "hidden" }}>
      <Rate defaultValue={2} tooltips={["Poor", "Fair"]} />
    </div>,
  );
  const slider = screen.getByRole("slider");
  fireEvent.focus(slider);
  const tooltip = screen.getByRole("tooltip");
  expect(container.contains(tooltip)).toBe(false);
  expect(slider).toHaveAttribute("aria-describedby", tooltip.id);
});

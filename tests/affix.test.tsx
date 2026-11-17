import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi, afterEach } from "vitest";
import { Affix } from "../packages/mtone/src";
const rect = (top: number, height = 40, left = 20, width = 200) => ({
  top,
  bottom: top + height,
  left,
  right: left + width,
  width,
  height,
  x: left,
  y: top,
  toJSON() {},
});
afterEach(() => vi.restoreAllMocks());
function geometry(top = 100) {
  let position = top;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement) {
      return rect(this.classList.contains("mt-affix") ? position : 0);
    },
  );
  return (value: number) => {
    position = value;
  };
}
async function scroll() {
  await act(async () => {
    fireEvent.scroll(window);
    await new Promise((r) => setTimeout(r, 40));
  });
}
test("preserves children and only notifies when default top affix state changes", async () => {
  const set = geometry();
  const change = vi.fn();
  render(
    <Affix onChange={change}>
      <button>Action</button>
    </Affix>,
  );
  expect(change).not.toHaveBeenCalled();
  set(-5);
  await scroll();
  expect(screen.getByRole("button").parentElement).toHaveStyle({
    position: "fixed",
    top: "0px",
    width: "200px",
    left: "20px",
  });
  expect(change).toHaveBeenLastCalledWith(true);
  await scroll();
  expect(change).toHaveBeenCalledTimes(1);
  set(100);
  await scroll();
  expect(change).toHaveBeenLastCalledWith(false);
});
test("bottom alone sticks to bottom and top takes precedence when both supplied", () => {
  geometry(900);
  const { rerender } = render(<Affix offsetBottom={12}>Bottom</Affix>);
  expect(screen.getByText("Bottom")).toHaveStyle({
    position: "fixed",
    top: `${window.innerHeight - 12 - 40}px`,
  });
  rerender(
    <Affix offsetTop={10} offsetBottom={12}>
      Bottom
    </Affix>,
  );
  expect(screen.getByText("Bottom").style.position).not.toBe("fixed");
});
test("uses target inner border bounds and responds to changing target getter", () => {
  geometry(50);
  const target = document.createElement("div");
  target.getBoundingClientRect = () => rect(100, 300);
  Object.defineProperties(target, {
    clientTop: { value: 2 },
    clientHeight: { value: 296 },
  });
  const { rerender } = render(
    <Affix target={() => target} offsetTop={8}>
      Target
    </Affix>,
  );
  expect(screen.getByText("Target")).toHaveStyle({
    top: "110px",
    position: "fixed",
  });
  rerender(<Affix target={() => null}>Target</Affix>);
  expect(screen.getByText("Target").style.position).not.toBe("fixed");
});
test("retains placeholder height, permits event props and forwards root ref", async () => {
  const set = geometry();
  const ref = React.createRef<HTMLDivElement>();
  const click = vi.fn();
  render(
    <Affix
      ref={ref}
      className="custom"
      style={{ marginTop: 3 }}
      onClick={click}
    >
      Content
    </Affix>,
  );
  set(-10);
  await scroll();
  expect(ref.current).toHaveStyle({ height: "40px", marginTop: "3px" });
  expect(ref.current).toHaveClass("custom");
  fireEvent.click(screen.getByText("Content"));
  expect(click).toHaveBeenCalledOnce();
});
test("re-resolves a stable target getter after a parent rerender", () => {
  geometry(-10);
  let current: Window | null = window;
  const target = () => current;
  const { rerender } = render(
    <Affix target={target} title="first">
      Stable
    </Affix>,
  );
  expect(screen.getByText("Stable")).toHaveStyle({ position: "fixed" });
  current = null;
  rerender(
    <Affix target={target} title="second">
      Stable
    </Affix>,
  );
  expect(screen.getByText("Stable").style.position).not.toBe("fixed");
});
test("resolves a parent container ref after the initial commit", () => {
  geometry(-10);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(300);
  function Demo() {
    const parent = React.useRef<HTMLDivElement>(null);
    return (
      <div ref={parent}>
        <Affix target={() => parent.current}>Parent</Affix>
      </div>
    );
  }
  render(<Demo />);
  expect(screen.getByText("Parent")).toHaveStyle({ position: "fixed" });
});

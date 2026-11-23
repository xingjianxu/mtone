import React from "react";
import { readFileSync } from "node:fs";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Rate, Tooltip, TooltipProvider } from "../packages/mtone/src";

test("default hover and keyboard focus retain the trigger and its descriptions", async () => {
  const user = userEvent.setup();
  render(<TooltipProvider delay={0}>
    <span id="existing">Original description</span>
    <Tooltip content="New help"><button aria-describedby="existing">Info</button></Tooltip>
  </TooltipProvider>);
  const trigger = screen.getByRole("button", { name: "Info" });
  expect(trigger.getAttribute("aria-describedby")?.split(/\s+/)[0]).toBe("existing");
  await user.hover(trigger);
  const popup = await screen.findByRole("tooltip");
  expect(popup).toHaveTextContent("New help");
  expect(trigger.getAttribute("aria-describedby")?.split(/\s+/)).toEqual(["existing", popup.id]);
  await user.unhover(trigger);
  await user.tab();
  expect(await screen.findByRole("tooltip")).toHaveTextContent("New help");
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});

test("click and context-menu open explicitly and ignore pointer hover", async () => {
  const user = userEvent.setup();
  render(<TooltipProvider delay={0}>
    <Tooltip trigger="click" content="Clicked"><button>Details</button></Tooltip>
    <Tooltip trigger="contextMenu" content="Context"><button>Inspect</button></Tooltip>
    <button>Outside</button>
  </TooltipProvider>);
  const click = screen.getByRole("button", { name: "Details" });
  const inspect = screen.getByRole("button", { name: "Inspect" });
  await user.hover(click);
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  await user.click(click);
  expect(await screen.findByRole("tooltip")).toHaveTextContent("Clicked");
  await user.unhover(click);
  expect(screen.getByRole("tooltip")).toHaveTextContent("Clicked");
  await user.click(click);
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  const context = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: 2 });
  fireEvent(inspect, context);
  expect(context.defaultPrevented).toBe(true);
  expect(await screen.findByRole("tooltip")).toHaveTextContent("Context");
  await user.click(screen.getByRole("button", { name: "Outside" }));
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  inspect.focus();
  await user.keyboard("{Shift>}{F10}{/Shift}");
  expect(await screen.findByRole("tooltip")).toHaveTextContent("Context");
});

test("controls popup mounting, fresh content, portal target and semantic slots", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  try {
    const tree = (content: React.ReactNode, open: boolean) => <Tooltip open={open} content={content} keepMounted
      container={host} side="bottom" align="start" arrow tone="blue" zIndex={1350}
      classNames={{ trigger: "my-trigger", positioner: "my-positioner", popup: "my-popup", arrow: "my-arrow" }}
      styles={{ popup: { padding: 9 } }}>
      <button>Target</button>
    </Tooltip>;
    const { rerender } = render(tree("First", false));
    expect(host.querySelector(".my-popup")).toHaveTextContent("First");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    rerender(tree("New text", true));
    const popup = await within(host).findByRole("tooltip");
    expect(popup).toHaveTextContent("New text");
    expect(popup).toHaveClass("my-popup");
    expect(popup).toHaveAttribute("data-tone", "blue");
    expect(popup).toHaveStyle({ padding: "9px" });
    expect(host.querySelector(".my-positioner")).toHaveStyle({ zIndex: "1350" });
    expect(host.querySelector(".my-arrow")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Target" })).toHaveClass("my-trigger");
    rerender(tree(null, true));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Target" })).not.toHaveAttribute("aria-describedby");
  } finally {
    host.remove();
  }
});

test("an initially open tooltip mounts directly in a same-render ancestor container ref", async () => {
  function Example() {
    const host = React.useRef<HTMLElement>(null);
    return <main ref={host}>
      <Tooltip open container={host} content="Local help"><button>Trigger</button></Tooltip>
    </main>;
  }

  render(<Example />);
  const popup = await screen.findByRole("tooltip");
  expect(screen.getByRole("main")).toContainElement(popup);
});

test("disabled tooltip leaves a live child alone; explicit disabled wrapper is keyboard focusable", async () => {
  const user = userEvent.setup();
  const action = vi.fn();
  render(<>
    <Tooltip disabled open content="Inactive"><button onClick={action}>Independent</button></Tooltip>
    <Tooltip wrapDisabledTrigger content="Why unavailable"><button disabled>Unavailable</button></Tooltip>
    <Tooltip wrapDisabledTrigger content={null}><button disabled>Empty</button></Tooltip>
  </>);
  const original = screen.getByRole("button", { name: "Independent" });
  await user.click(original);
  expect(action).toHaveBeenCalledOnce();
  expect(original).not.toHaveAttribute("aria-describedby");
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  await user.tab();
  const child = screen.getByRole("button", { name: "Unavailable" });
  expect(child).toBeDisabled();
  expect(screen.getByRole("group", { name: "Unavailable" })).toHaveFocus();
  expect(screen.getByRole("button", { name: "Empty" }).parentElement).not.toHaveClass("mt-tooltip-disabled-trigger");
  expect(await screen.findByRole("tooltip")).toHaveTextContent("Why unavailable");
});


test("focus-only and controlled open remain explicit; empty content preserves the same child", async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  const example = (open: boolean, content: React.ReactNode) => (
    <TooltipProvider delay={0}>
      <Tooltip open={open} onOpenChange={changed} trigger="focus" content={content}>
        <input aria-label="Decision" id="original-id" defaultValue="Editable value" />
      </Tooltip>
    </TooltipProvider>
  );
  const { rerender } = render(example(false, "Description"));
  const control = screen.getByRole("textbox", { name: "Decision" });
  await user.hover(control);
  expect(changed).not.toHaveBeenCalled();
  await user.tab();
  expect(changed).toHaveBeenCalledExactlyOnceWith(true);
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  rerender(example(true, "Description"));
  expect(await screen.findByRole("tooltip")).toHaveTextContent("Description");
  rerender(example(true, <></>));
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Decision" })).toBe(control);
  expect(control).toHaveFocus();
  expect(control).toHaveAttribute("id", "original-id");
  expect(control).toHaveValue("Editable value");
});

test("Tooltip wrapping does not alter Rate’s separate rating hints", () => {
  const sheet = document.createElement("style");
  sheet.textContent = readFileSync("packages/mtone/src/interactive.css", "utf8");
  document.head.append(sheet);
  try {
    render(<>
      <Tooltip open content="Standalone help"><button>Info</button></Tooltip>
      <Rate defaultValue={1} tooltips={["Rating hint"]} />
    </>);
    fireEvent.focus(screen.getByRole("slider"));
    const ratingHint = screen.getByText("Rating hint", { selector: '[role="tooltip"]' });
    const standalone = screen.getByText("Standalone help", { selector: '[role="tooltip"]' });
    expect(getComputedStyle(ratingHint).overflowWrap).toBe("");
    expect(getComputedStyle(ratingHint).maxWidth).toBe("260px");
    expect(getComputedStyle(standalone).overflowWrap).toBe("anywhere");
  } finally {
    sheet.remove();
  }
});

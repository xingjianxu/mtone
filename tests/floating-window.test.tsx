import React from "react";
import { createPortal } from "react-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { FloatingWindow, MtoneProvider } from "../packages/mtone/src";

afterEach(() => vi.unstubAllGlobals());

test("opens nonmodally, preserves child and geometry through minimize, restores and closes separately", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const background = vi.fn();
  render(<MtoneProvider locale="en">
    <button onClick={background}>Outside</button>
    <FloatingWindow title="Notes" trigger="Open notes" onOpenChange={change}
      initialPosition={{ left: 40, top: 50 }} initialSize={{ width: 380, height: 270 }}>
      <input aria-label="Draft" />
    </FloatingWindow>
  </MtoneProvider>);
  const opener = screen.getByRole("button", { name: "Open notes" });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await user.click(opener);
  const windowPanel = await screen.findByRole("dialog", { name: "Notes" });
  expect(windowPanel).toHaveAttribute("aria-modal", "false");
  expect(windowPanel).toHaveFocus();
  expect(windowPanel).toHaveStyle({ left: "40px", top: "50px", width: "380px", height: "270px" });
  await user.click(screen.getByRole("button", { name: "Outside" }));
  expect(background).toHaveBeenCalledOnce();
  expect(windowPanel).toBeVisible();
  const draft = within(windowPanel).getByRole("textbox", { name: "Draft" });
  await user.type(draft, "Preserve this");
  const move = within(windowPanel).getByRole("button", { name: "Move window" });
  const resize = within(windowPanel).getByRole("button", { name: "Resize window" });
  fireEvent.keyDown(move, { key: "ArrowRight" });
  fireEvent.keyDown(resize, { key: "ArrowDown", shiftKey: true });
  expect(windowPanel).toHaveStyle({ left: "48px", height: "294px" });
  await user.click(within(windowPanel).getByRole("button", { name: "Minimize window" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.queryByRole("textbox", { name: "Draft" })).not.toBeInTheDocument();
  const restore = screen.getByRole("button", { name: "Restore window" });
  expect(restore).toHaveFocus();
  expect(change.mock.calls).toEqual([[true]]);
  await user.click(restore);
  expect(windowPanel).toHaveFocus();
  expect(windowPanel).toHaveStyle({ left: "48px", height: "294px" });
  expect(draft).toHaveValue("Preserve this");
  await user.click(within(windowPanel).getByRole("button", { name: "Close window" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(opener).toHaveFocus();
  expect(change.mock.calls).toEqual([[true], [false]]);
});

test("keeps physical bounds on keyboard and viewport shrink and honors controlled open", async () => {
  vi.stubGlobal("innerWidth", 600);
  vi.stubGlobal("innerHeight", 470);
  const user = userEvent.setup();
  const change = vi.fn();
  const renderWindow = (open: boolean) => <MtoneProvider locale="en">
    <FloatingWindow title="Preview" open={open} onOpenChange={change}
      trigger={<button type="button">Show preview</button>}
      initialPosition={{ left: 500, top: 400 }} initialSize={{ width: 400, height: 300 }}
      maxWidth={350} maxHeight={250} minWidth={200} minHeight={150} minimizable={false}>
      <p>Window content</p>
    </FloatingWindow>
  </MtoneProvider>;
  const { rerender } = render(renderWindow(false));
  const trigger = screen.getByRole("button", { name: "Show preview" });
  await user.click(trigger);
  expect(change).toHaveBeenCalledExactlyOnceWith(true);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  rerender(renderWindow(true));
  const pane = screen.getByRole("dialog", { name: "Preview" });
  expect(pane).toHaveStyle({ left: "238px", top: "208px", width: "350px", height: "250px" });
  expect(within(pane).queryByRole("button", { name: "Minimize window" })).not.toBeInTheDocument();
  const resize = within(pane).getByRole("button", { name: "Resize window" });
  fireEvent.keyDown(resize, { key: "ArrowRight" });
  expect(pane).toHaveStyle({ width: "350px" });
  fireEvent.keyDown(resize, { key: "ArrowLeft" });
  expect(pane).toHaveStyle({ width: "342px" });
  vi.stubGlobal("innerWidth", 180);
  vi.stubGlobal("innerHeight", 120);
  fireEvent(window, new Event("resize"));
  expect(pane).toHaveStyle({ left: "12px", top: "12px", width: "156px", height: "96px" });
  await user.click(within(pane).getByRole("button", { name: "Close window" }));
  expect(change).toHaveBeenLastCalledWith(false);
  expect(pane).toBeVisible();
  rerender(renderWindow(false));
  expect(pane).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

test("disables optional handles without making the dialog modal", async () => {
  render(<MtoneProvider locale="en">
    <FloatingWindow title="Read only geometry" defaultOpen draggable={false} resizable={false} minimizable={false}>
      <a href="#inside">Inside</a>
    </FloatingWindow>
  </MtoneProvider>);
  const pane = await screen.findByRole("dialog");
  expect(within(pane).getAllByRole("button")).toHaveLength(1);
  expect(within(pane).getByRole("link", { name: "Inside" })).toBeVisible();
  expect(document.body).not.toHaveStyle({ overflow: "hidden" });
});

test("minimizing deactivates portaled child controls and effects without discarding state", async () => {
  const user = userEvent.setup();
  const cleanup = vi.fn();
  function ChildPortal() {
    const [count, setCount] = React.useState(0);
    React.useEffect(() => cleanup, []);
    return createPortal(<button type="button" onClick={() => setCount(count + 1)}>Child action {count}</button>, document.body);
  }
  render(<MtoneProvider locale="en">
    <FloatingWindow title="With portal" defaultOpen><ChildPortal /></FloatingWindow>
  </MtoneProvider>);
  const pane = await screen.findByRole("dialog", { name: "With portal" });
  await user.click(screen.getByRole("button", { name: "Child action 0" }));
  await user.click(within(pane).getByRole("button", { name: "Minimize window" }));
  expect(screen.queryByRole("button", { name: "Child action 1" })).not.toBeInTheDocument();
  expect(cleanup).toHaveBeenCalledOnce();
  await user.click(screen.getByRole("button", { name: "Restore window" }));
  expect(screen.getByRole("button", { name: "Child action 1" })).toBeVisible();
});

test("externally controlled close restores focus from within, not from the surrounding page", async () => {
  const user = userEvent.setup();
  const template = (open: boolean) => <MtoneProvider locale="en">
    <button type="button">Outside control</button>
    <FloatingWindow title="Controlled" trigger="Open controlled" open={open}>
      <input aria-label="Inside control" />
    </FloatingWindow>
  </MtoneProvider>;
  const { rerender } = render(template(false));
  const outside = screen.getByRole("button", { name: "Outside control" });
  const opener = screen.getByRole("button", { name: "Open controlled" });
  await user.click(outside);
  rerender(template(true));
  expect(outside).toHaveFocus();
  await user.click(screen.getByRole("textbox"));
  rerender(template(false));
  expect(opener).toHaveFocus();
  rerender(template(true));
  await user.click(outside);
  rerender(template(false));
  expect(outside).toHaveFocus();
});

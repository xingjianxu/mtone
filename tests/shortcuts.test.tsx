import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { formatShortcut, ShortcutScope, ShortcutsProvider, useShortcut, type ShortcutOptions } from "../packages/mtone/src";

const setPlatform = (platform: string) => vi.spyOn(window.navigator, "platform", "get").mockReturnValue(platform);
const press = (key: string, init: KeyboardEventInit = {}, target: EventTarget = document.body) => {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
  fireEvent(target as HTMLElement, event);
  return event;
};
function Binding({ shortcut = "Mod+K", callback, options }: {
  shortcut?: string | readonly string[] | false;
  callback: (event: KeyboardEvent) => void;
  options?: ShortcutOptions;
}) {
  useShortcut(shortcut, callback, options);
  return null;
}
afterEach(() => vi.restoreAllMocks());

test("Mod resolves by platform, matches an exact chord, and attaches no shortcut without a provider", () => {
  const platform = setPlatform("Win32");
  const callback = vi.fn();
  const { rerender } = render(<Binding callback={callback} />);
  expect(press("k", { ctrlKey: true }).defaultPrevented).toBe(false);
  rerender(<ShortcutsProvider><Binding callback={callback} /></ShortcutsProvider>);
  expect(press("K", { metaKey: true }).defaultPrevented).toBe(false);
  expect(press("K", { ctrlKey: true, shiftKey: true }).defaultPrevented).toBe(false);
  const key = press("k", { ctrlKey: true });
  expect(key.defaultPrevented).toBe(true);
  expect(callback).toHaveBeenCalledExactlyOnceWith(key);
  platform.mockReturnValue("iPhone");
  const ios = press("k", { metaKey: true });
  expect(callback).toHaveBeenLastCalledWith(ios);
  expect(callback).toHaveBeenCalledTimes(2);
});

test("scoped bindings prefer priority, then nesting and last mounted peer; inactive ancestors disable descendants", () => {
  const global = vi.fn(), page = vi.fn(), dialog = vi.fn(), peer = vi.fn();
  const tree = (dialogActive: boolean, globalPriority: number) => (
    <ShortcutsProvider>
      <ShortcutScope priority={globalPriority}><Binding callback={global} shortcut="Shift+F2" /></ShortcutScope>
      <ShortcutScope>
        <Binding callback={page} shortcut="Shift+F2" />
        <ShortcutScope active={dialogActive}><ShortcutScope><Binding callback={dialog} shortcut="Shift+F2" /></ShortcutScope></ShortcutScope>
      </ShortcutScope>
      <ShortcutScope><Binding callback={peer} shortcut="Shift+F2" /></ShortcutScope>
    </ShortcutsProvider>
  );
  const { rerender } = render(tree(true, 0));
  press("F2", { shiftKey: true });
  expect(dialog).toHaveBeenCalledOnce();
  rerender(tree(false, 0));
  press("F2", { shiftKey: true });
  expect(peer).toHaveBeenCalledOnce();
  expect(page).not.toHaveBeenCalled();
  rerender(tree(false, 3));
  press("F2", { shiftKey: true });
  expect(global).toHaveBeenCalledOnce();
});

test("ignores composition, AltGraph, repeats, default-prevented and editable controls unless opted in", () => {
  const global = vi.fn(), allowed = vi.fn();
  render(<ShortcutsProvider>
    <Binding shortcut="Ctrl+K" callback={global} />
    <Binding shortcut="Alt+J" callback={allowed} options={{ allowInInputs: true, preventDefault: false }} />
    <input aria-label="Field" />
    <div contentEditable suppressContentEditableWarning><span data-testid="rich">Text</span></div>
  </ShortcutsProvider>);
  const input = screen.getByRole("textbox");
  const rich = screen.getByTestId("rich");
  for (const target of [input, rich]) {
    expect(press("k", { ctrlKey: true }, target).defaultPrevented).toBe(false);
  }
  press("k", { ctrlKey: true, repeat: true });
  press("k", { ctrlKey: true, isComposing: true });
  const legacyIme = new KeyboardEvent("keydown", { key: "k", bubbles: true, ctrlKey: true });
  Object.defineProperty(legacyIme, "keyCode", { value: 229 });
  fireEvent(document.body, legacyIme);
  const altGraph = new KeyboardEvent("keydown", { key: "k", bubbles: true, ctrlKey: true });
  Object.defineProperty(altGraph, "getModifierState", { value: (name: string) => name === "AltGraph" });
  fireEvent(document.body, altGraph);
  const consumed = new KeyboardEvent("keydown", { key: "k", bubbles: true, ctrlKey: true, cancelable: true });
  consumed.preventDefault();
  fireEvent(document.body, consumed);
  expect(global).not.toHaveBeenCalled();
  const passed = press("J", { altKey: true }, input);
  expect(allowed).toHaveBeenCalledExactlyOnceWith(passed);
  expect(passed.defaultPrevented).toBe(false);
});

test("warns on a duplicate only in the same scope, preserves first binding, and cleans up", () => {
  setPlatform("Win32");
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const first = vi.fn(), second = vi.fn();
  const tree = (firstEnabled: boolean) => <ShortcutsProvider>
    <Binding callback={first} options={{ enabled: firstEnabled }} />
    <Binding callback={second} shortcut={["Ctrl+K", "F3"]} />
    <ShortcutScope active={false}><Binding shortcut="Ctrl+K" callback={second} /></ShortcutScope>
  </ShortcutsProvider>;
  const { rerender, unmount } = render(tree(true));
  expect(warn).toHaveBeenCalledOnce();
  press("K", { ctrlKey: true });
  expect(first).toHaveBeenCalledOnce();
  expect(second).not.toHaveBeenCalled();
  press("F3");
  expect(second).toHaveBeenCalledOnce();
  rerender(tree(false));
  press("k", { ctrlKey: true });
  expect(second).toHaveBeenCalledTimes(2);
  unmount();
  expect(press("k", { ctrlKey: true }).defaultPrevented).toBe(false);
});

test("nested providers reuse one listener and display platform-specific shortcut labels", () => {
  const listen = vi.spyOn(document, "addEventListener");
  const first = vi.fn();
  const { rerender } = render(<ShortcutsProvider><ShortcutsProvider><Binding shortcut="Ctrl+Plus" callback={first} /></ShortcutsProvider></ShortcutsProvider>);
  expect(listen.mock.calls.filter(([type]) => type === "keydown")).toHaveLength(1);
  const shortcut = press("+", { ctrlKey: true });
  expect(first).toHaveBeenCalledExactlyOnceWith(shortcut);
  rerender(<ShortcutsProvider><Binding shortcut={false} callback={first} /></ShortcutsProvider>);
  expect(press("+", { ctrlKey: true }).defaultPrevented).toBe(false);
  expect(formatShortcut("Mod+Shift+k", "mac")).toBe("⇧⌘K");
  expect(formatShortcut("Mod+Shift+k", "other")).toBe("Ctrl+Shift+K");
  expect(formatShortcut("Option+ArrowDown", "mac")).toBe("⌥↓");
});

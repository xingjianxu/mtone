import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { Button, Fieldset, Spotlight } from "../packages/mtone/src";
import { ShortcutScope, ShortcutsProvider, useShortcut } from "../packages/mtone/src/shortcuts";
const actions = [
  { id: "home", label: "首页", group: "页面", keywords: ["home"], description: "查看工作台" },
  { id: "locked", label: "禁用", disabled: true, group: "页面" },
  { id: "settings", label: "设置", group: "应用", keywords: "preferences" },
];
test("filters label, description and keywords, groups and empty state", async () => {
  render(<Spotlight defaultOpen actions={actions} />);
  const search = await screen.findByRole("combobox");
  expect(screen.getByRole("group", { name: "页面" })).toBeInTheDocument();
  for (const query of ["首页", "工作台", "HOME"]) {
    fireEvent.change(search, { target: { value: query } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option")).toHaveTextContent("首页");
  }
  fireEvent.change(search, { target: { value: "zzzz" } });
  expect(screen.queryAllByRole("option")).toHaveLength(0);
  expect(screen.getByRole("status")).toHaveTextContent("没有找到");
  expect(search).not.toHaveAttribute("aria-activedescendant");
});
test("keyboard skips disabled actions, wraps, and executes once", async () => {
  const select = vi.fn();
  render(<Spotlight defaultOpen actions={actions} onActionSelect={select} />);
  const input = await screen.findByRole("combobox");
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(screen.getByRole("option", { name: "设置" })).toHaveAttribute("aria-selected", "true");
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(screen.getByRole("option", { name: /首页/ })).toHaveAttribute("aria-selected", "true");
  fireEvent.keyDown(input, { key: "End" });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(select).toHaveBeenCalledExactlyOnceWith(actions[2]);
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
});
test("supports controlled state, custom filtering, limit and keeping open", async () => {
  const change = vi.fn(), selected = vi.fn();
  render(<Spotlight open query="server" onQueryChange={change} closeOnSelect={false}
    actions={actions} filter={() => true} limit={1} onActionSelect={selected} />);
  const input = await screen.findByRole("combobox");
  fireEvent.change(input, { target: { value: "new" } });
  expect(change).toHaveBeenCalledWith("new");
  expect(input).toHaveValue("server");
  expect(screen.getAllByRole("option")).toHaveLength(1);
  fireEvent.click(screen.getByRole("option"));
  expect(selected).toHaveBeenCalledOnce();
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});
test("trigger, shortcuts and reset behavior", async () => {
  render(<><input aria-label="Editor" /><Spotlight actions={actions} trigger={<Button>打开搜索</Button>} /></>);
  fireEvent.keyDown(screen.getByLabelText("Editor"), { key: "k", ctrlKey: true });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  fireEvent.keyDown(document, { key: "k", ctrlKey: true });
  const input = await screen.findByRole("combobox");
  fireEvent.keyDown(input, { key: "k", ctrlKey: true });
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  fireEvent.keyDown(document, { key: "k", metaKey: true });
  const reopened = await screen.findByRole("combobox");
  fireEvent.change(reopened, { target: { value: "home" } });
  fireEvent.click(screen.getByRole("button", { name: "关闭" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  fireEvent.click(screen.getByRole("button", { name: "打开搜索" }));
  expect(await screen.findByRole("combobox")).toHaveValue("");
});
test("disabled pointer actions and IME Enter do not execute", async () => {
  const selected = vi.fn();
  render(<Spotlight defaultOpen actions={actions} onActionSelect={selected} />);
  const input = await screen.findByRole("combobox");
  fireEvent.click(screen.getByRole("option", { name: "禁用" }));
  fireEvent.keyDown(input, { key: "Enter", isComposing: true });
  expect(selected).not.toHaveBeenCalled();
});
test("uses Input.Search with one embedded icon and keeps its input focused after clearing", async () => {
  render(<Spotlight defaultOpen actions={actions} defaultQuery="home" />);
  const input = await screen.findByRole("combobox");
  expect(input.parentElement).toHaveClass("mt-search");
  expect(input.closest(".mt-spotlight-search")?.querySelectorAll("svg")).toHaveLength(1);
  await waitFor(() => expect(input).toHaveFocus());
  fireEvent.change(input, { target: { value: "" } });
  expect(input).toHaveValue("");
  expect(screen.getAllByRole("option")).toHaveLength(3);
  expect(input).toHaveFocus();
});

test("search respects disabled Fieldset across the dialog portal", async () => {
  const { rerender } = render(<Fieldset disabled><Spotlight defaultOpen actions={actions} /></Fieldset>);
  expect(await screen.findByRole("combobox")).toBeDisabled();
  rerender(<Fieldset><Spotlight defaultOpen actions={actions} /></Fieldset>);
  expect(screen.getByRole("combobox")).toBeEnabled();
});

test("under ShortcutsProvider the legacy non-default chord opens on Ctrl or Meta and closes from the search input", async () => {
  const changed = vi.fn();
  render(
    <ShortcutsProvider>
      <input aria-label="Managed editor" />
      <Spotlight actions={actions} shortcut="p" onOpenChange={changed} />
    </ShortcutsProvider>,
  );
  fireEvent.keyDown(screen.getByLabelText("Managed editor"), { key: "p", ctrlKey: true });
  fireEvent.keyDown(document, { key: "k", ctrlKey: true });
  fireEvent.keyDown(document, { key: "p", ctrlKey: true, repeat: true });
  fireEvent.keyDown(document, { key: "p", metaKey: true, isComposing: true });
  expect(changed).not.toHaveBeenCalled();

  for (const modifiers of [{ ctrlKey: true }, { metaKey: true }, { ctrlKey: true, metaKey: true }]) {
    expect(fireEvent.keyDown(document, { key: "p", ...modifiers })).toBe(false);
    const search = await screen.findByRole("combobox");
    fireEvent.keyDown(search, { key: "p", ...modifiers });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  }
  expect(changed.mock.calls).toEqual([[true], [false], [true], [false], [true], [false]]);
});

test.each([false, true])("managed Spotlight enableInInputs=%s controls editable targets", async (enableInInputs) => {
  render(
    <ShortcutsProvider>
      <input aria-label="Editable target" />
      <Spotlight actions={actions} enableInInputs={enableInInputs} />
    </ShortcutsProvider>,
  );
  fireEvent.keyDown(screen.getByLabelText("Editable target"), { key: "k", metaKey: true });
  if (enableInInputs) expect(await screen.findByRole("dialog")).toBeVisible();
  else expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("shortcut=false lets an external registry binding control Spotlight without its default shortcuts", async () => {
  function Controlled() {
    const [open, setOpen] = React.useState(false);
    useShortcut("Ctrl+p", () => setOpen(true));
    return <Spotlight actions={actions} shortcut={false} open={open} onOpenChange={setOpen} />;
  }
  render(<ShortcutsProvider><Controlled /></ShortcutsProvider>);
  fireEvent.keyDown(document, { key: "k", ctrlKey: true });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  fireEvent.keyDown(document, { key: "p", ctrlKey: true });
  expect(await screen.findByRole("dialog")).toBeVisible();
});

test("a higher-priority registry binding wins over the managed Spotlight binding", () => {
  const override = vi.fn();
  const changed = vi.fn();
  function Override() {
    useShortcut("Ctrl+p", override);
    return null;
  }
  render(
    <ShortcutsProvider>
      <Spotlight actions={actions} shortcut="p" onOpenChange={changed} />
      <ShortcutScope priority={1}><Override /></ShortcutScope>
    </ShortcutsProvider>,
  );
  fireEvent.keyDown(document, { key: "p", ctrlKey: true });
  expect(override).toHaveBeenCalledOnce();
  expect(changed).not.toHaveBeenCalled();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});


test("an open managed Spotlight does not claim a chord in an unrelated editor", () => {
  const editorBinding = vi.fn();
  const changed = vi.fn();
  function Editor() {
    useShortcut("Ctrl+p", editorBinding, { allowInInputs: true });
    return <textarea aria-label="Another editor" />;
  }
  render(
    <ShortcutsProvider>
      <ShortcutScope priority={1}>
        <Spotlight actions={actions} defaultOpen shortcut="p" onOpenChange={changed} />
      </ShortcutScope>
      <Editor />
    </ShortcutsProvider>,
  );
  fireEvent.keyDown(screen.getByLabelText("Another editor"), { key: "p", ctrlKey: true });
  expect(editorBinding).toHaveBeenCalledOnce();
  expect(changed).not.toHaveBeenCalled();
});

test("an inactive managed scope disables the Spotlight binding without a standalone listener fallback", () => {
  const changed = vi.fn();
  render(
    <ShortcutsProvider>
      <ShortcutScope active={false}>
        <Spotlight actions={actions} onOpenChange={changed} />
      </ShortcutScope>
    </ShortcutsProvider>,
  );
  expect(fireEvent.keyDown(document, { key: "k", ctrlKey: true })).toBe(true);
  expect(changed).not.toHaveBeenCalled();
});

test("managed Spotlight still treats the legacy shortcut prop as a key, not a chord", () => {
  render(<ShortcutsProvider><Spotlight actions={actions} shortcut="Ctrl+x" /></ShortcutsProvider>);
  expect(fireEvent.keyDown(document, { key: "x", ctrlKey: true })).toBe(true);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test.each(["+", " "])("managed Spotlight supports the literal key %j", async (key) => {
  render(<ShortcutsProvider><Spotlight actions={actions} shortcut={key} /></ShortcutsProvider>);
  fireEvent.keyDown(document, { key, ctrlKey: true });
  expect(await screen.findByRole("dialog")).toBeVisible();
});

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import {
  Mentions,
  getMentions,
  type MentionsRef,
} from "../packages/mtone/src";
const options = [
  { value: "alice", label: "Alice" },
  { value: "locked", disabled: true },
  { value: "bob", label: "Bob" },
];
function edit(value: string, caret = value.length) {
  const input = screen.getByRole("combobox") as HTMLTextAreaElement;
  fireEvent.focus(input);
  fireEvent.change(input, {
    target: { value, selectionStart: caret, selectionEnd: caret },
  });
  return input;
}
test("parses plain text with multiple prefixes", () => {
  expect(getMentions("Hi @alice #team @bob", { prefix: ["@", "#"] })).toEqual([
    { prefix: "@", value: "alice" },
    { prefix: "#", value: "team" },
    { prefix: "@", value: "bob" },
  ]);
  expect(getMentions("a@b.com @")).toEqual([]);
});
test("filters and inserts a mention with a stable accessible active option", async () => {
  const select = vi.fn();
  render(<Mentions aria-label="Message" options={options} onSelect={select} />);
  const input = edit("Hi @al");
  const option = screen.getByRole("option", { name: "Alice" });
  expect(input).toHaveAttribute("aria-activedescendant", option.id);
  fireEvent.keyDown(input, { key: "Enter" });
  expect(input).toHaveValue("Hi @alice ");
  expect(select).toHaveBeenCalledWith(options[0], "@");
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  await waitFor(() => expect(input.selectionStart).toBe(10));
});
test("keyboard skips disabled, wraps, Escape dismisses and Tab does not select", () => {
  render(<Mentions options={options} />);
  const input = edit("@");
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(screen.getByRole("option", { name: "Bob" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(screen.getByRole("option", { name: "Alice" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  fireEvent.keyDown(input, { key: "Escape" });
  expect(screen.queryByRole("listbox")).toBeNull();
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(screen.getByRole("listbox")).toBeInTheDocument();
  fireEvent.keyDown(input, { key: "Tab" });
  expect(input).toHaveValue("@");
  expect(screen.queryByRole("listbox")).toBeNull();
});
test("replaces only text before caret and preserves suffix", async () => {
  render(<Mentions options={options} />);
  const input = edit("Hi @al and bye", 6);
  fireEvent.click(screen.getByRole("option", { name: "Alice" }));
  expect(input).toHaveValue("Hi @alice and bye");
  await waitFor(() => expect(input.selectionStart).toBe(10));
});
test("supports controlled values, rejection, and external updates without emitting changes", () => {
  const change = vi.fn();
  const { rerender } = render(
    <Mentions options={options} value="hello" onChange={change} />,
  );
  const input = edit("@");
  expect(input).toHaveValue("hello");
  expect(change).toHaveBeenCalledExactlyOnceWith("@");
  expect(screen.queryByRole("listbox")).toBeNull();
  rerender(<Mentions options={options} value="@bo" onChange={change} />);
  expect(input).toHaveValue("@bo");
  expect(change).toHaveBeenCalledTimes(1);
});
test("search is prefix aware and async loading does not select stale options", () => {
  const search = vi.fn(),
    select = vi.fn();
  const { rerender } = render(
    <Mentions
      options={options}
      prefix={["@", "#"]}
      onSearch={search}
      loading
      onSelect={select}
    />,
  );
  const input = edit("#al");
  expect(search).toHaveBeenLastCalledWith("al", "#");
  expect(screen.getByRole("status")).toHaveTextContent("加载");
  fireEvent.keyDown(input, { key: "Enter" });
  expect(select).not.toHaveBeenCalled();
  rerender(
    <Mentions
      options={[{ value: "alpine" }]}
      prefix={["@", "#"]}
      onSearch={search}
    />,
  );
  expect(screen.getByRole("option")).toHaveTextContent("alpine");
  fireEvent.keyDown(input, { key: "Enter" });
  expect(input).toHaveValue("#alpine ");
});
test("does not activate inside emails, noncollapsed selection or invalid search", () => {
  render(<Mentions options={options} />);
  const input = edit("me@alice");
  expect(screen.queryByRole("listbox")).toBeNull();
  edit("@alice more");
  expect(screen.queryByRole("listbox")).toBeNull();
  edit("@al");
  input.setSelectionRange(0, 3);
  fireEvent.select(input);
  expect(screen.queryByRole("listbox")).toBeNull();
});
test("IME composition never selects or searches unfinished text", () => {
  const search = vi.fn(),
    select = vi.fn();
  render(<Mentions options={options} onSearch={search} onSelect={select} />);
  const input = edit("@");
  search.mockClear();
  fireEvent.compositionStart(input);
  fireEvent.change(input, { target: { value: "@a" } });
  fireEvent.keyDown(input, { key: "Enter", keyCode: 229 });
  expect(select).not.toHaveBeenCalled();
  expect(search).not.toHaveBeenCalled();
  fireEvent.compositionEnd(input);
  expect(search).toHaveBeenLastCalledWith("a", "@");
});
test("disabled/readOnly suppress popup and clearing; custom filter and empty state work", () => {
  const { rerender } = render(
    <Mentions options={options} disabled defaultValue="@" allowClear />,
  );
  const input = screen.getByRole("combobox");
  fireEvent.focus(input);
  expect(screen.queryByRole("listbox")).toBeNull();
  expect(screen.queryByRole("button")).toBeNull();
  rerender(<Mentions options={options} readOnly defaultValue="@" allowClear />);
  fireEvent.focus(input);
  expect(screen.queryByRole("listbox")).toBeNull();
  rerender(<Mentions options={options} filterOption={false} />);
  edit("@zz");
  expect(screen.getAllByRole("option")).toHaveLength(3);
  rerender(<Mentions options={[]} notFoundContent="No matches" />);
  expect(screen.getByRole("status")).toHaveTextContent("No matches");
});
test("clear is accessible, emits string changes and ref exposes textarea methods", () => {
  const ref = React.createRef<MentionsRef>(),
    change = vi.fn(),
    clear = vi.fn();
  render(
    <Mentions
      ref={ref}
      defaultValue="hello"
      allowClear
      onChange={change}
      onClear={clear}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "清空" }));
  expect(screen.getByRole("combobox")).toHaveValue("");
  expect(change).toHaveBeenCalledWith("");
  expect(clear).toHaveBeenCalledOnce();
  expect(ref.current?.nativeElement).toBe(screen.getByRole("combobox"));
});
test("uncontrolled form reset restores default text", async () => {
  render(
    <form>
      <Mentions defaultValue="hello" options={options} />
      <button type="reset">Reset</button>
    </form>,
  );
  const input = edit("@al");
  fireEvent.reset(input.closest("form")!);
  await waitFor(() => expect(input).toHaveValue("hello"));
  expect(screen.queryByRole("listbox")).toBeNull();
});
test("custom split, multi-character prefix, popup portal and validation are supported", () => {
  const host = document.createElement("div");
  document.body.append(host);
  const { unmount } = render(
    <Mentions
      prefix={[":", "::"]}
      split=","
      options={options}
      validateSearch={(s) => !s.includes(",")}
      getPopupContainer={() => host}
      popupRender={(menu) => (
        <section data-testid="custom-popup">{menu}</section>
      )}
    />,
  );
  const input = edit("::al");
  expect(host.querySelector("[role=listbox]")).not.toBeNull();
  fireEvent.click(screen.getByRole("option", { name: "Alice" }));
  expect(input).toHaveValue("::alice,");
  unmount();
  host.remove();
});

test("focus reopens dismissed suggestions without changing text", () => {
  render(<Mentions options={options} />);
  const input = edit("@al");
  fireEvent.blur(input);
  fireEvent.focus(input);
  expect(screen.getByRole("option", { name: "Alice" })).toBeInTheDocument();
});
test("respects maxLength when inserting or clearing a mention", () => {
  const select = vi.fn();
  render(<Mentions options={options} maxLength={4} onSelect={select} />);
  const input = edit("@al");
  fireEvent.keyDown(input, { key: "Enter" });
  expect(input).toHaveValue("@al");
  expect(select).not.toHaveBeenCalled();
});

test("a rejected controlled edit cannot select using a stale caret", () => {
  const change = vi.fn();
  render(
    <Mentions
      value="@alice"
      options={[{ value: "alice" }, { value: "alex" }]}
      onChange={change}
    />,
  );
  const input = edit("@b", 2);
  expect(input).toHaveValue("@alice");
  expect(screen.queryByRole("listbox")).toBeNull();
  fireEvent.keyDown(input, { key: "Enter" });
  expect(change).toHaveBeenCalledExactlyOnceWith("@b");
});

test("disabling autoSize restores numeric caller height", () => {
  const styles = { textarea: { height: 120 } };
  const { rerender } = render(<Mentions autoSize styles={styles} />);
  rerender(<Mentions autoSize={false} styles={styles} />);
  expect(screen.getByRole("combobox")).toHaveStyle({ height: "120px" });
});

test("canceled reset preserves text and controlled reset stays owned by parent", async () => {
  const { rerender } = render(
    <form onReset={(e) => e.preventDefault()}>
      <Mentions defaultValue="hello" />
    </form>,
  );
  const input = edit("@al");
  fireEvent.reset(input.closest("form")!);
  await Promise.resolve();
  expect(input).toHaveValue("@al");
  rerender(
    <form>
      <Mentions value="owned" />
    </form>,
  );
  fireEvent.reset(input.closest("form")!);
  await Promise.resolve();
  expect(input).toHaveValue("owned");
});
test("shortened controlled text and replaced options never reference a removed candidate", () => {
  const { rerender } = render(<Mentions value="@alice" options={options} />);
  const input = screen.getByRole("combobox");
  fireEvent.focus(input);
  rerender(<Mentions value="@" options={[{ value: "bob" }]} />);
  const option = screen.getByRole("option", { name: "bob" });
  expect(input).toHaveAttribute("aria-activedescendant", option.id);
  rerender(<Mentions value="@" options={[]} />);
  expect(input).not.toHaveAttribute("aria-activedescendant");
});

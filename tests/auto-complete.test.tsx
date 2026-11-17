import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { AutoComplete } from "../packages/mtone/src";
const options = [
  { value: "alice", label: "Alice" },
  { value: "blocked", disabled: true },
  { value: "bob", label: "Bob" },
];
test("accepts free text and filters suggestions, selecting inserts value not label", async () => {
  const user = userEvent.setup(),
    change = vi.fn(),
    select = vi.fn();
  render(
    <AutoComplete
      aria-label="User"
      options={options}
      onChange={change}
      onSelect={select}
    />,
  );
  const input = screen.getByRole("combobox");
  await user.type(input, "al");
  await user.click(await screen.findByRole("option", { name: "Alice" }));
  expect(input).toHaveValue("alice");
  expect(select).toHaveBeenCalledWith("alice", options[0]);
  await user.clear(input);
  await user.type(input, "unknown");
  expect(input).toHaveValue("unknown");
  expect(change).toHaveBeenLastCalledWith("unknown");
});
test("keyboard selects enabled options, Escape closes without changing free text", async () => {
  const user = userEvent.setup();
  render(<AutoComplete options={options} filterOption={false} />);
  const input = screen.getByRole("combobox");
  await user.type(input, "x");
  await user.keyboard("{ArrowDown}{Enter}");
  expect(input).toHaveValue("alice");
  await user.clear(input);
  await user.type(input, "free");
  await user.keyboard("{Escape}");
  expect(input).toHaveValue("free");
  await waitFor(() =>
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
  );
});
test("clear reports callbacks and ref is native input", async () => {
  const user = userEvent.setup(),
    clear = vi.fn(),
    ref = React.createRef<HTMLInputElement>();
  render(
    <AutoComplete
      ref={ref}
      defaultValue="initial"
      allowClear
      onClear={clear}
    />,
  );
  expect(ref.current).toBe(screen.getByRole("combobox"));
  await user.click(screen.getByRole("button", { name: /清除|Clear/ }));
  expect(ref.current).toHaveValue("");
  expect(clear).toHaveBeenCalledOnce();
});
test("controlled input remains controlled and disabled is noneditable", async () => {
  const change = vi.fn();
  const { rerender } = render(<AutoComplete value="fixed" onChange={change} />);
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "next" } });
  expect(change).toHaveBeenCalledWith("next");
  expect(screen.getByRole("combobox")).toHaveValue("fixed");
  rerender(<AutoComplete disabled defaultValue="locked" />);
  expect(screen.getByRole("combobox")).toBeDisabled();
});
test("groups, loading and custom empty state", async () => {
  const user = userEvent.setup();
  const { rerender } = render(
    <AutoComplete
      options={[{ label: "People", options }]}
      filterOption={false}
    />,
  );
  await user.type(screen.getByRole("combobox"), "a");
  expect(await screen.findByText("People")).toBeVisible();
  rerender(<AutoComplete loading options={[]} open />);
  expect(await screen.findByText(/加载中|Loading…/)).toBeVisible();
  rerender(<AutoComplete options={[]} open notFoundContent="No suggestions" />);
  expect(await screen.findByText("No suggestions")).toBeVisible();
});
test("composition does not search until completion", () => {
  const search = vi.fn();
  render(<AutoComplete onSearch={search} />);
  const input = screen.getByRole("combobox");
  fireEvent.compositionStart(input);
  fireEvent.change(input, { target: { value: "中" } });
  expect(search).not.toHaveBeenCalled();
  fireEvent.compositionEnd(input, { data: "中" });
  expect(search).toHaveBeenCalledWith("中");
  expect(search).toHaveBeenCalledTimes(1);
});
test("remote options update while open; Tab preserves typed text", async () => {
  const user = userEvent.setup();
  const { rerender } = render(
    <AutoComplete options={[]} filterOption={false} />,
  );
  await user.type(screen.getByRole("combobox"), "query");
  rerender(
    <AutoComplete options={[{ value: "remote" }]} filterOption={false} />,
  );
  expect(await screen.findByRole("option", { name: "remote" })).toBeVisible();
  await user.tab();
  expect(screen.getByRole("combobox")).toHaveValue("query");
});
test("native form submits free text and reset restores default", async () => {
  const user = userEvent.setup();
  const { container } = render(
    <form>
      <AutoComplete name="query" defaultValue="start" />
      <button type="reset">Reset</button>
    </form>,
  );
  await user.type(screen.getByRole("combobox"), " end");
  expect(new FormData(container.querySelector("form")!).get("query")).toBe(
    "start end",
  );
  await user.click(screen.getByText("Reset"));
  expect(screen.getByRole("combobox")).toHaveValue("start");
});
test("readOnly blocks editing and suggestion opening", async () => {
  const user = userEvent.setup();
  render(<AutoComplete readOnly defaultValue="read" options={options} />);
  await user.click(screen.getByRole("combobox"));
  await user.type(screen.getByRole("combobox"), "x");
  expect(screen.getByRole("combobox")).toHaveValue("read");
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
});
test("composition Enter never commits a suggestion", () => {
  const select = vi.fn();
  render(
    <AutoComplete
      defaultOpen
      options={options}
      autoHighlight
      onSelect={select}
    />,
  );
  const input = screen.getByRole("combobox");
  fireEvent.compositionStart(input);
  fireEvent.keyDown(input, { key: "Enter", isComposing: true, keyCode: 229 });
  expect(select).not.toHaveBeenCalled();
});
test("disabling and reenabling does not break uncontrolled opening", async () => {
  const user = userEvent.setup();
  const { rerender } = render(<AutoComplete disabled options={options} />);
  rerender(<AutoComplete options={options} />);
  await user.click(screen.getByRole("combobox"));
  expect(await screen.findByRole("listbox")).toBeVisible();
  rerender(<AutoComplete readOnly options={options} />);
  await waitFor(() =>
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
  );
  rerender(<AutoComplete options={options} />);
  await user.click(screen.getByRole("combobox"));
  expect(await screen.findByRole("listbox")).toBeVisible();
});
test("disabled suggestions can be explored but never selected", async () => {
  const user = userEvent.setup(),
    select = vi.fn();
  render(
    <AutoComplete options={options} filterOption={false} onSelect={select} />,
  );
  await user.click(screen.getByRole("combobox"));
  await user.click(await screen.findByRole("option", { name: "blocked" }));
  expect(select).not.toHaveBeenCalled();
  await user.click(screen.getByRole("combobox"));
  await user.keyboard("{Escape}");
  await user.type(screen.getByRole("combobox"), "x");
  await user.keyboard("{ArrowDown}");
  expect(screen.getByRole("combobox")).toHaveAttribute(
    "aria-activedescendant",
    screen.getByRole("option", { name: "Alice" }).id,
  );
  await user.keyboard("{ArrowDown}{Enter}");
  expect(select).not.toHaveBeenCalled();
  await user.keyboard("{ArrowDown}");
  expect(screen.getByRole("combobox")).toHaveAttribute(
    "aria-activedescendant",
    screen.getByRole("option", { name: "Bob" }).id,
  );
  await user.keyboard("{Enter}");
  expect(screen.getByRole("combobox")).toHaveValue("bob");
});
test("native text editing keys do not select or lose input focus", async () => {
  const user = userEvent.setup(),
    select = vi.fn();
  render(
    <AutoComplete options={options} filterOption={false} onSelect={select} />,
  );
  const input = screen.getByRole("combobox") as HTMLInputElement;
  await user.type(input, "abcd");
  await user.keyboard("{Home}{ArrowRight}X{End}{Backspace}");
  expect(input).toHaveValue("aXbc");
  expect(input).toHaveFocus();
  expect(select).not.toHaveBeenCalled();
});

test("keeps the empty live region mounted without padding when suggestions exist", async () => {
  const { readFileSync } = await import("node:fs");
  const style = document.createElement("style");
  style.textContent = readFileSync(
    "packages/mtone/src/auto-complete.css",
    "utf8",
  );
  document.head.append(style);
  try {
    const user = userEvent.setup();
    render(<AutoComplete aria-label="Spacing" options={options} />);
    await user.click(screen.getByRole("combobox"));
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toBeEmptyDOMElement();
    expect(getComputedStyle(region).paddingTop).toBe("0px");
    expect(getComputedStyle(region).paddingBottom).toBe("0px");
    await user.type(screen.getByRole("combobox"), "no-match");
    expect(region).toHaveTextContent(/No suggestions|无匹配建议/);
    expect(getComputedStyle(region).paddingTop).toBe("8px");
    await user.clear(screen.getByRole("combobox"));
    expect(region).toBeEmptyDOMElement();
    expect(getComputedStyle(region).paddingTop).toBe("0px");
  } finally {
    style.remove();
  }
});

test.each([
  {
    label: "grouped",
    options: [{ label: "People", options: [{ value: "alice" }] }],
  },
  { label: "loading empty", options: [], loading: true },
  { label: "loading suggestions", options, loading: true },
  { label: "suppressed empty", options: [], notFoundContent: false },
])(
  "does not create an empty message spacer: $label",
  async ({ label, ...props }) => {
    const user = userEvent.setup();
    const { container } = render(
      <AutoComplete aria-label={label} {...props} />,
    );
    await user.click(screen.getByRole("combobox"));
    const empty = document.querySelector(".mt-auto-complete-empty")!;
    expect(empty).toBeEmptyDOMElement();
    expect(empty).toHaveAttribute("role", "status");
    expect(empty).not.toHaveAttribute("hidden");
    expect(empty).not.toHaveAttribute("aria-hidden");
  },
);

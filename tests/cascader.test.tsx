import React from "react";
import {
  render as rtlRender,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect, vi } from "vitest";
import {
  MtoneProvider,
  Cascader,
  CascaderPanel,
  type CascaderOption,
} from "../packages/mtone/src";
const render = (ui: React.ReactNode) =>
  rtlRender(ui, {
    wrapper: ({ children }) => (
      <MtoneProvider locale="en">{children}</MtoneProvider>
    ),
  });
const options: CascaderOption[] = [
  {
    value: "a",
    label: "Asia",
    children: [
      {
        value: "cn",
        label: "China",
        children: [
          { value: "bj", label: "Beijing" },
          { value: "sh", label: "Shanghai" },
        ],
      },
      {
        value: "off",
        label: "Blocked",
        disabled: true,
        children: [{ value: "hidden", label: "Hidden" }],
      },
    ],
  },
  {
    value: "eu",
    label: "Europe",
    children: [{ value: "fr", label: "France" }],
  },
];
test("Cascader selects only full paths by default and clears", async () => {
  const u = userEvent.setup(),
    change = vi.fn();
  render(
    <Cascader
      options={options}
      aria-label="Region"
      onValueChange={change}
      allowClear
    />,
  );
  await u.click(screen.getByRole("combobox"));
  await u.click(screen.getByRole("treeitem", { name: "Asia" }));
  expect(change).not.toHaveBeenCalled();
  await u.click(screen.getByRole("treeitem", { name: "China" }));
  await u.click(screen.getByRole("treeitem", { name: "Beijing" }));
  expect(change.mock.lastCall?.[0]).toEqual(["a", "cn", "bj"]);
  expect(screen.getByRole("combobox")).toHaveTextContent(
    "Asia / China / Beijing",
  );
  await u.click(screen.getByRole("button", { name: "Clear selection" }));
  expect(change.mock.lastCall?.[0]).toEqual([]);
});
test("controlled value and intermediate selection", async () => {
  const u = userEvent.setup(),
    change = vi.fn();
  render(
    <CascaderPanel
      options={options}
      value={["eu", "fr"]}
      changeOnSelect
      onValueChange={change}
    />,
  );
  await u.click(screen.getByRole("treeitem", { name: "Asia" }));
  expect(change.mock.lastCall?.[0]).toEqual(["a"]);
  expect(screen.getByRole("treeitem", { name: "Asia" })).toHaveAttribute(
    "aria-selected",
    "false",
  );
});
test("multiple parent cascade excludes disabled subtrees and parent display compresses", async () => {
  const u = userEvent.setup(),
    change = vi.fn();
  render(<Cascader options={options} multiple onValueChange={change} />);
  await u.click(screen.getByRole("combobox"));
  await u.click(screen.getByRole("checkbox", { name: "Select Asia" }));
  expect(change.mock.lastCall?.[0]).toEqual([
    ["a", "cn", "bj"],
    ["a", "cn", "sh"],
  ]);
  expect(screen.getByRole("treeitem", { name: /Asia/ })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await u.keyboard("{Escape}");
  expect(
    screen.getByRole("button", { name: "Remove Asia" }),
  ).toBeInTheDocument();
  await u.click(screen.getByRole("button", { name: "Remove Asia" }));
  expect(change.mock.lastCall?.[0]).toEqual([]);
});
test("search matches full known paths but not disabled descendants", async () => {
  const u = userEvent.setup();
  render(<Cascader options={options} searchable />);
  await u.click(screen.getByRole("combobox"));
  await u.type(screen.getByRole("searchbox"), "Asia Beijing");
  expect(
    screen.getByRole("treeitem", { name: "Asia / China / Beijing" }),
  ).toBeInTheDocument();
  await u.clear(screen.getByRole("searchbox"));
  await u.type(screen.getByRole("searchbox"), "Hidden");
  expect(screen.queryByRole("treeitem")).toBeNull();
});
test("keyboard navigates columns, selects and restores trigger focus", async () => {
  const u = userEvent.setup();
  render(<Cascader options={options} />);
  await u.click(screen.getByRole("combobox"));
  await waitFor(() =>
    expect(screen.getByRole("treeitem", { name: "Asia" })).toHaveFocus(),
  );
  await u.keyboard("{ArrowRight}");
  await waitFor(() =>
    expect(screen.getByRole("treeitem", { name: "China" })).toHaveFocus(),
  );
  await u.keyboard("{ArrowRight}{ArrowDown}{Enter}");
  await waitFor(() => expect(screen.getByRole("combobox")).toHaveFocus());
  expect(screen.getByRole("combobox")).toHaveTextContent("Shanghai");
});
test("numeric and string values remain distinct", async () => {
  const u = userEvent.setup(),
    change = vi.fn();
  render(
    <CascaderPanel
      options={[
        { value: 1, label: "Numeric" },
        { value: "1", label: "String" },
      ]}
      onValueChange={change}
    />,
  );
  await u.click(screen.getByRole("treeitem", { name: "Numeric" }));
  expect(change.mock.lastCall?.[0]).toEqual([1]);
  await u.click(screen.getByRole("treeitem", { name: "String" }));
  expect(change.mock.lastCall?.[0]).toEqual(["1"]);
});
test("lazy loading reports failure and retries without selecting an unresolved branch", async () => {
  const u = userEvent.setup(),
    load = vi
      .fn()
      .mockRejectedValueOnce(Error("oops"))
      .mockResolvedValueOnce([{ value: "child", label: "Child" }]),
    change = vi.fn();
  render(
    <CascaderPanel
      options={[{ value: "lazy", label: "Lazy", isLeaf: false }]}
      loadOptions={load}
      onValueChange={change}
    />,
  );
  await u.click(screen.getByRole("treeitem", { name: "Lazy" }));
  await screen.findByRole("button", { name: "Retry loading" });
  expect(change).not.toHaveBeenCalled();
  await u.click(screen.getByRole("button", { name: "Retry loading" }));
  await u.click(await screen.findByRole("treeitem", { name: "Child" }));
  expect(change.mock.lastCall?.[0]).toEqual(["lazy", "child"]);
  expect(load).toHaveBeenCalledTimes(2);
});
test("ignores obsolete lazy response after options replacement", async () => {
  let resolve!: (v: CascaderOption[]) => void;
  const load = vi.fn(() => new Promise<CascaderOption[]>((r) => (resolve = r))),
    u = userEvent.setup();
  const { rerender } = render(
    <CascaderPanel
      options={[{ value: "lazy", label: "Lazy", isLeaf: false }]}
      loadOptions={load}
    />,
  );
  await u.click(screen.getByRole("treeitem", { name: "Lazy" }));
  rerender(
    <CascaderPanel
      options={[{ value: "new", label: "New" }]}
      loadOptions={load}
    />,
  );
  await React.act(async () => resolve([{ value: "stale", label: "Stale" }]));
  expect(screen.queryByText("Stale")).toBeNull();
  expect(screen.getByText("New")).toBeInTheDocument();
});
test("disabled and readOnly do not open or mutate", async () => {
  const u = userEvent.setup(),
    change = vi.fn();
  const { rerender } = render(
    <Cascader options={options} disabled onValueChange={change} />,
  );
  expect(screen.getByRole("combobox")).toBeDisabled();
  rerender(
    <Cascader
      options={options}
      readOnly
      defaultValue={["eu", "fr"]}
      allowClear
      onValueChange={change}
    />,
  );
  await u.click(screen.getByRole("combobox"));
  expect(screen.queryByRole("tree")).toBeNull();
  expect(change).not.toHaveBeenCalled();
  expect(screen.queryByRole("button", { name: "Clear selection" })).toBeNull();
});
test("composition Enter does not pick a search result", async () => {
  const u = userEvent.setup(),
    change = vi.fn();
  render(<Cascader options={options} searchable onValueChange={change} />);
  await u.click(screen.getByRole("combobox"));
  const input = screen.getByRole("searchbox");
  fireEvent.compositionStart(input);
  fireEvent.change(input, { target: { value: "Beijing" } });
  fireEvent.keyDown(input, { key: "Enter", isComposing: true });
  expect(change).not.toHaveBeenCalled();
});

test("disabled selected values stay visible and serialized", () => {
  render(
    <Cascader
      multiple
      options={[{ value: "locked", label: "Locked", disabled: true }]}
      value={[["locked"]]}
      name="locations"
    />,
  );
  expect(screen.getByRole("combobox")).toHaveTextContent("1 selected");
  expect(screen.getByText("Locked")).toBeVisible();
  expect(document.querySelector('input[name="locations"]')).toHaveValue(
    '[["locked"]]',
  );
});
test("trigger popup semantics describe its actual dialog", async () => {
  const u = userEvent.setup();
  render(<Cascader options={options} />);
  const trigger = screen.getByRole("combobox");
  await u.click(trigger);
  expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  expect(
    document.getElementById(trigger.getAttribute("aria-controls")!),
  ).toHaveAttribute("role", "dialog");
});
test("hover expands without selection and partial checks are mixed", async () => {
  const u = userEvent.setup(),
    change = vi.fn();
  render(
    <CascaderPanel
      options={options}
      multiple
      defaultValue={[["a", "cn", "bj"]]}
      expandTrigger="hover"
      onValueChange={change}
    />,
  );
  expect(screen.getByRole("checkbox", { name: "Select Asia" })).toHaveAttribute(
    "aria-checked",
    "mixed",
  );
  await u.hover(screen.getByRole("treeitem", { name: "Europe" }));
  expect(screen.getByRole("treeitem", { name: "France" })).toBeVisible();
  expect(change).not.toHaveBeenCalled();
});

test("controlled re-renders keep loaded children with equivalent inline options", async () => {
  const u = userEvent.setup();
  function Example() {
    const [value, setValue] = React.useState<(string | number)[]>([]);
    return (
      <Cascader
        value={value}
        onValueChange={setValue}
        options={[{ value: "r", label: "Root", isLeaf: false }]}
        loadOptions={async () => [{ value: "child", label: "Child" }]}
      />
    );
  }
  render(<Example />);
  await u.click(screen.getByRole("combobox"));
  await u.click(screen.getByRole("treeitem", { name: "Root" }));
  await u.click(await screen.findByRole("treeitem", { name: "Child" }));
  expect(screen.getByRole("combobox")).toHaveTextContent("Root / Child");
  await u.click(screen.getByRole("combobox"));
  expect(screen.getByRole("treeitem", { name: "Child" })).toBeVisible();
});

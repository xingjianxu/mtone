import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DataList, MtoneProvider } from "../packages/mtone/src";

// Base UI re-dispatches real checkbox clicks through PointerEvent.
if (!window.PointerEvent)
  window.PointerEvent = MouseEvent as typeof PointerEvent;

const rows = [
  { id: "a", title: "Alpha", archived: false },
  { id: "b", title: "Beta", archived: true },
  { id: "c", title: "Gamma", archived: false },
  { id: "d", title: "Delta", archived: false },
];
const props = {
  items: rows,
  getKey: (item: (typeof rows)[number]) => item.id,
  getLabel: (item: (typeof rows)[number]) => item.title,
  renderItem: (item: (typeof rows)[number]) => item.title,
};
const english = (node: React.ReactNode) => (
  <MtoneProvider locale="en">{node}</MtoneProvider>
);
const navigation = () =>
  within(screen.getByRole("navigation", { name: "Pagination" }));
const list = () => screen.getByRole("list");
const labels = () =>
  within(list())
    .getAllByRole("listitem")
    .map((row) => row.textContent);

describe("DataList", () => {
  it("filters and searches before pagination, resetting to page one once per actual page change", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      english(
        <DataList
          {...props}
          search={{
            match: (row, query) =>
              row.title.toLowerCase().includes(query.toLowerCase()),
          }}
          filter={(row) => !row.archived}
          pagination={{ pageSize: 1, defaultPage: 3, onPageChange }}
          filters={<button>Filters</button>}
          toolbar={<button>New record</button>}
        />,
      ),
    );
    expect(labels()).toEqual(["Delta"]);
    expect(screen.getByRole("button", { name: "Filters" })).toBeVisible();
    expect(screen.getByRole("button", { name: "New record" })).toBeVisible();
    await user.type(
      screen.getByRole("textbox", { name: "Search list" }),
      " mm",
    );
    expect(labels()).toEqual(["Gamma"]);
    expect(
      navigation().getByRole("button", { name: "Page 1" }),
    ).toHaveAttribute("aria-current", "page");
    expect(onPageChange.mock.calls).toEqual([[1]]);
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
  });

  it("requests a reset on search even if an out-of-range controlled page is visually clamped", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      english(
        <DataList
          {...props}
          search={{
            value: "alpha",
            match: (row, query) => row.title.toLowerCase() === query,
          }}
          pagination={{ page: 3, pageSize: 1, onPageChange }}
        />,
      ),
    );
    expect(labels()).toEqual(["Alpha"]);
    await user.type(screen.getByRole("textbox", { name: "Search list" }), "x");
    expect(onPageChange).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("renders the supplied remote page without re-filtering or slicing, and emits page/query requests", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const onQuery = vi.fn();
    const match = vi.fn(() => false);
    const filter = vi.fn(() => false);
    render(
      english(
        <DataList
          {...props}
          items={rows.slice(2)}
          pagination={{
            mode: "remote",
            page: 3,
            pageSize: 1,
            total: 20,
            onPageChange,
          }}
          search={{ defaultValue: "unmatched", onChange: onQuery, match }}
          filter={filter}
        />,
      ),
    );
    expect(labels()).toEqual(["Gamma", "Delta"]);
    expect(match).not.toHaveBeenCalled();
    expect(filter).not.toHaveBeenCalled();
    await user.click(navigation().getByRole("button", { name: "Next page" }));
    expect(onPageChange.mock.calls).toEqual([[4]]);
    await user.type(screen.getByRole("textbox", { name: "Search list" }), "x");
    expect(onQuery).toHaveBeenCalledWith("unmatchedx");
    expect(onPageChange.mock.calls).toEqual([[4], [1]]);
    expect(labels()).toEqual(["Gamma", "Delta"]);
  });

  it("selects visible enabled rows, preserves selections across pages, and clears batch selections", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const batch = vi.fn();
    render(
      english(
        <DataList
          {...props}
          pagination={{ pageSize: 2 }}
          selection={{ getDisabled: (row) => row.archived, onChange }}
          renderBatchActions={({ selectedKeys }) => (
            <button onClick={() => batch(selectedKeys)}>
              Apply to {selectedKeys.length}
            </button>
          )}
        />,
      ),
    );
    const all = screen.getByRole("checkbox", { name: "Select visible items" });
    expect(
      screen.getByRole("checkbox", { name: "Select Beta" }),
    ).toHaveAttribute("aria-disabled", "true");
    await user.click(all);
    expect(onChange).toHaveBeenLastCalledWith(["a"]);
    expect(all).toBeChecked();
    await user.click(navigation().getByRole("button", { name: "Next page" }));
    expect(all).not.toBeChecked();
    await user.click(screen.getByRole("checkbox", { name: "Select Gamma" }));
    expect(all).toBePartiallyChecked();
    await user.click(all);
    expect(onChange).toHaveBeenLastCalledWith(["a", "c", "d"]);
    await user.click(screen.getByRole("button", { name: "Apply to 3" }));
    expect(batch).toHaveBeenCalledWith(["a", "c", "d"]);
    await user.click(all);
    expect(onChange).toHaveBeenLastCalledWith(["a"]);
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(
      screen.queryByRole("button", { name: /Apply to/ }),
    ).not.toBeInTheDocument();
  });

  it("does not mutate controlled selection and keeps the string and number keys distinct", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      english(
        <DataList
          items={[1, "1"]}
          getKey={(item) => item}
          getLabel={(item) => typeof item}
          renderItem={(item) => typeof item}
          selection={{ selectedKeys: [1], onChange }}
        />,
      ),
    );
    expect(
      screen.getByRole("checkbox", { name: "Select number" }),
    ).toBeChecked();
    const string = screen.getByRole("checkbox", { name: "Select string" });
    expect(string).not.toBeChecked();
    await user.click(string);
    expect(onChange).toHaveBeenCalledWith([1, "1"]);
    expect(string).not.toBeChecked();
  });

  it("expands details accessibly, keeps one list item per row, and does not select from actions", async () => {
    const user = userEvent.setup();
    const edit = vi.fn();
    const expanded = vi.fn();
    render(
      english(
        <DataList
          {...props}
          selection={{}}
          expansion={{
            isExpandable: (row) => !row.archived,
            onChange: expanded,
            renderDetail: (row) => <p>Details for {row.title}</p>,
          }}
          renderActions={(row) => (
            <button onClick={() => edit(row.id)}>Edit {row.title}</button>
          )}
        />,
      ),
    );
    expect(list().querySelectorAll(":scope > li")).toHaveLength(rows.length);
    expect(list().querySelector("li li")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Expand Beta" }),
    ).not.toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: "Expand Alpha" });
    const id = toggle.getAttribute("aria-controls");
    expect(id).toBeTruthy();
    expect(document.getElementById(id!)).not.toBeVisible();
    await user.click(toggle);
    expect(expanded).toHaveBeenLastCalledWith(["a"]);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById(id!)).toHaveTextContent("Details for Alpha");
    await user.click(screen.getByRole("button", { name: "Edit Alpha" }));
    expect(edit).toHaveBeenCalledWith("a");
    expect(
      screen.getByRole("checkbox", { name: "Select Alpha" }),
    ).not.toBeChecked();
    await user.click(screen.getByRole("button", { name: "Collapse Alpha" }));
    expect(expanded).toHaveBeenLastCalledWith([]);
    expect(document.getElementById(id!)).not.toBeVisible();
  });

  it("reports loading without an empty flash and uses custom empty content when settled", () => {
    const { rerender } = render(
      english(
        <DataList
          {...props}
          items={[]}
          loading
          empty={<p>No matching records</p>}
        />,
      ),
    );
    expect(list()).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
    expect(screen.queryByText("No matching records")).not.toBeInTheDocument();
    rerender(
      english(
        <DataList {...props} items={[]} empty={<p>No matching records</p>} />,
      ),
    );
    expect(list()).not.toHaveAttribute("aria-busy");
    expect(screen.getByText("No matching records")).toBeVisible();
  });

  it("rejects duplicate or non-finite item keys", () => {
    const renderRows = (items: number[]) =>
      render(
        <DataList
          items={items}
          getKey={(item) => item}
          renderItem={(item) => item}
        />,
      );
    expect(() => renderRows([1, 1])).toThrow(/duplicate.*key/i);
    expect(() => renderRows([NaN])).toThrow(/finite number/i);
  });
});

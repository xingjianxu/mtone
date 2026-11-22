import * as React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { MtoneProvider } from "../packages/mtone/src/basic";
import { Pagination } from "../packages/mtone/src/data";
import { TablePaginationBar } from "../packages/mtone/src/table-pagination";

afterEach(cleanup);

test("the shared pagination window preserves small, boundary and middle ranges", async () => {
  const { getPaginationWindow } =
    await import("../packages/mtone/src/pagination-controls");
  expect(getPaginationWindow(7, 4)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  expect(getPaginationWindow(12, 1)).toEqual([1, 2, 12]);
  expect(getPaginationWindow(12, 6)).toEqual([1, 5, 6, 7, 12]);
  expect(getPaginationWindow(12, 12)).toEqual([1, 11, 12]);
});

test("standalone pagination keeps localized labels, ellipses and raw button content", () => {
  const change = vi.fn();
  render(
    <MtoneProvider locale="zh">
      <Pagination page={6} total={120} onPageChange={change} />
    </MtoneProvider>,
  );
  const nav = within(screen.getByRole("navigation", { name: "分页" }));
  expect(nav.getAllByRole("button").map((el) => el.textContent)).toEqual([
    "‹",
    "1",
    "5",
    "6",
    "7",
    "12",
    "›",
  ]);
  expect(
    nav.getAllByText("…").map((el) => el.getAttribute("aria-hidden")),
  ).toEqual(["true", "true"]);
  const current = nav.getByRole("button", { name: "第6页" });
  expect(current.getAttribute("aria-current")).toBe("page");
  expect(current.childElementCount).toBe(0);
  fireEvent.click(nav.getByRole("button", { name: "下一页" }));
  expect(change).toHaveBeenCalledExactlyOnceWith(7);
});

test("table pagination keeps itemRender span, order, position and quick jumper", () => {
  const change = vi.fn();
  const itemRender = vi.fn(
    (_: number, __: "page" | "prev" | "next", node: React.ReactNode) => (
      <b>{node}</b>
    ),
  );
  const { container } = render(
    <TablePaginationBar
      config={{
        itemRender,
        showTotal: (total, range) => `${range.join("–")} of ${total}`,
        showQuickJumper: true,
        showSizeChanger: true,
      }}
      total={120}
      current={6}
      pageSize={10}
      onChange={change}
      zh={false}
      placement="topCenter"
    />,
  );
  const element = screen.getByRole("navigation", { name: "Pagination" });
  const nav = within(element);
  expect(element.classList.contains("mt-pagination-center")).toBe(true);
  expect(nav.getByText("51–60 of 120")).toBeTruthy();
  expect(
    itemRender.mock.calls.map(([page, type, node]) => [
      page,
      type,
      React.isValidElement(node) ? node.type : null,
    ]),
  ).toEqual([
    [5, "prev", "span"],
    [1, "page", "span"],
    [5, "page", "span"],
    [6, "page", "span"],
    [7, "page", "span"],
    [12, "page", "span"],
    [7, "next", "span"],
  ]);
  expect(
    nav.getByRole("button", { name: "Page 6" }).getAttribute("aria-current"),
  ).toBe("page");
  expect(nav.getByRole("combobox", { name: "Page size" })).toBeTruthy();
  fireEvent.change(nav.getByRole("textbox", { name: "Go to page" }), {
    target: { value: "123" },
  });
  fireEvent.submit(container.querySelector("form")!);
  expect(change).toHaveBeenCalledExactlyOnceWith(12, 10);
});

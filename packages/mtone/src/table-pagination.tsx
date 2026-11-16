import * as React from "react";
import { Button, cn } from "./basic";
import type { TablePagination } from "./table-types";
export function TablePaginationBar({
  config,
  total,
  current,
  pageSize,
  onChange,
  zh,
  placement,
  className,
  style,
}: {
  config: TablePagination;
  total: number;
  current: number;
  pageSize: number;
  onChange: (page: number, size: number) => void;
  zh: boolean;
  placement: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const count = Math.max(1, Math.ceil(total / pageSize));
  const [jump, setJump] = React.useState("");
  if (config.hideOnSinglePage && count <= 1) return null;
  const change = (p: number, size = pageSize) => {
    if (!config.disabled)
      onChange(
        Math.min(Math.max(1, p), Math.max(1, Math.ceil(total / size))),
        size,
      );
  };
  const pages = Array.from(
    new Set([
      1,
      ...Array.from({ length: count <= 7 ? count : 3 }, (_, i) =>
        count <= 7 ? i + 1 : current + i - 1,
      ).filter((p) => p > 0 && p <= count),
      count,
    ]),
  ).sort((a, b) => a - b);
  const render = (
    page: number,
    type: "page" | "prev" | "next",
    node: React.ReactNode,
  ) => (config.itemRender ? config.itemRender(page, type, node) : node);
  return (
    <nav
      aria-label={zh ? "分页" : "Pagination"}
      className={cn(
        "mt-pagination",
        "mt-table-pagination",
        placement.endsWith("Center") && "mt-pagination-center",
        (placement.endsWith("Start") || placement.endsWith("Left")) &&
          "mt-pagination-start",
        config.className,
        className,
      )}
      style={{ ...config.style, ...style }}
    >
      <span className="mt-pagination-total">
        {config.showTotal
          ? config.showTotal(
              total,
              total
                ? [
                    Math.min((current - 1) * pageSize + 1, total),
                    Math.min(current * pageSize, total),
                  ]
                : [0, 0],
            )
          : zh
            ? `共 ${total} 条`
            : `${total} items`}
      </span>
      <Button
        aria-label={zh ? "上一页" : "Previous page"}
        disabled={config.disabled || current === 1}
        onClick={() => change(current - 1)}
      >
        {render(current - 1, "prev", <span>‹</span>)}
      </Button>
      {config.simple ? (
        <span>
          {current} / {count}
        </span>
      ) : (
        <span className="mt-pagination-pages">
          {pages.map((p, i) => (
            <React.Fragment key={p}>
              {i > 0 && p - pages[i - 1] > 1 && (
                <span aria-hidden="true">…</span>
              )}
              <Button
                disabled={config.disabled}
                aria-label={`${zh ? "第" : "Page "}${p}${zh ? "页" : ""}`}
                aria-current={p === current ? "page" : undefined}
                variant={p === current ? "soft" : "ghost"}
                onClick={() => change(p)}
              >
                {render(p, "page", <span>{p}</span>)}
              </Button>
            </React.Fragment>
          ))}
        </span>
      )}
      <Button
        aria-label={zh ? "下一页" : "Next page"}
        disabled={config.disabled || current === count}
        onClick={() => change(current + 1)}
      >
        {render(current + 1, "next", <span>›</span>)}
      </Button>
      {config.showSizeChanger && (
        <select
          className="mt-input mt-table-page-size"
          aria-label={zh ? "每页条数" : "Page size"}
          disabled={config.disabled}
          value={pageSize}
          onChange={(e) => change(1, Number(e.target.value))}
        >
          {[
            ...new Set([
              ...(config.pageSizeOptions ?? [10, 20, 50, 100]).map(Number),
              pageSize,
            ]),
          ]
            .filter((s) => s > 0)
            .sort((a, b) => a - b)
            .map((s) => (
              <option key={s} value={s}>
                {s}
                {zh ? " 条/页" : " / page"}
              </option>
            ))}
        </select>
      )}
      {config.showQuickJumper && (
        <form
          className="mt-table-quick-jump"
          onSubmit={(e) => {
            e.preventDefault();
            const value = Number(jump);
            if (Number.isFinite(value) && value > 0) change(Math.floor(value));
            setJump("");
          }}
        >
          <label>
            {zh ? "跳至" : "Go to"}{" "}
            <input
              className="mt-input"
              inputMode="numeric"
              aria-label={zh ? "跳转页码" : "Go to page"}
              disabled={config.disabled}
              value={jump}
              onChange={(e) => setJump(e.target.value)}
            />
          </label>
          <Button type="submit" disabled={config.disabled}>
            {zh ? "跳转" : "Go"}
          </Button>
        </form>
      )}
    </nav>
  );
}

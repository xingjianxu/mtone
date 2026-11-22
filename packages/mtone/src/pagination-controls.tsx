import * as React from "react";
import { Button } from "./basic";

export function getPaginationWindow(count: number, current: number) {
  return Array.from(
    new Set([
      1,
      ...Array.from({ length: count <= 7 ? count : 3 }, (_, i) =>
        count <= 7 ? i + 1 : current + i - 1,
      ).filter((p) => p > 0 && p <= count),
      count,
    ]),
  ).sort((a, b) => a - b);
}

type PaginationContent = (
  page: number,
  type: "page" | "prev" | "next",
  label: string | number,
) => React.ReactNode;

export function PaginationControls({
  count,
  current,
  disabled,
  simple,
  zh,
  onPageChange,
  renderItem,
}: {
  count: number;
  current: number;
  disabled?: boolean;
  simple?: boolean;
  zh: boolean;
  onPageChange: (page: number) => void;
  renderItem?: PaginationContent;
}) {
  const pages = simple ? [] : getPaginationWindow(count, current);
  const content = (
    page: number,
    type: "page" | "prev" | "next",
    label: string | number,
  ) => (renderItem ? renderItem(page, type, label) : label);

  return (
    <>
      <Button
        aria-label={zh ? "上一页" : "Previous page"}
        disabled={disabled || current === 1}
        onClick={() => onPageChange(current - 1)}
      >
        {content(current - 1, "prev", "‹")}
      </Button>
      {simple ? (
        <span>
          {current} / {count}
        </span>
      ) : (
        <span className="mt-pagination-pages">
          {pages.map((page, index) => (
            <React.Fragment key={page}>
              {index > 0 && page - pages[index - 1] > 1 && (
                <span aria-hidden="true">…</span>
              )}
              <Button
                disabled={disabled}
                aria-label={zh ? `第${page}页` : `Page ${page}`}
                aria-current={page === current ? "page" : undefined}
                variant={page === current ? "soft" : "ghost"}
                onClick={() => onPageChange(page)}
              >
                {content(page, "page", page)}
              </Button>
            </React.Fragment>
          ))}
        </span>
      )}
      <Button
        aria-label={zh ? "下一页" : "Next page"}
        disabled={disabled || current === count}
        onClick={() => onPageChange(current + 1)}
      >
        {content(current + 1, "next", "›")}
      </Button>
    </>
  );
}

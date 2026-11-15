import * as React from "react";
import { Button, cn, useMtone } from "./basic";
import { ChevronDown, ChevronRight, Upload as UploadIcon } from "lucide-react";

export type PaginationProps = {
  total: number;
  pageSize?: number;
  page: number;
  onPageChange: (page: number) => void;
  className?: string;
};
export function Pagination({
  total,
  pageSize = 10,
  page,
  onPageChange,
  className,
}: PaginationProps) {
  const zh = useMtone().locale === "zh";
  const count = Math.max(
    1,
    Math.ceil(Math.max(0, total) / Math.max(1, pageSize)),
  );
  const current = Math.min(count, Math.max(1, page));
  const pages = Array.from(
    new Set([
      1,
      ...Array.from({ length: count <= 7 ? count : 3 }, (_, i) =>
        count <= 7 ? i + 1 : current + i - 1,
      ).filter((p) => p > 0 && p <= count),
      count,
    ]),
  ).sort((a, b) => a - b);
  return (
    <nav
      aria-label={zh ? "分页" : "Pagination"}
      className={cn("mt-pagination", className)}
    >
      <span>{zh ? `共 ${total} 条` : `${total} items`}</span>
      <Button
        aria-label={zh ? "上一页" : "Previous page"}
        disabled={current === 1}
        onClick={() => onPageChange(current - 1)}
      >
        ‹
      </Button>
      <span className="mt-pagination-pages">
        {pages.map((p, i) => (
          <React.Fragment key={p}>
            {i > 0 && p - pages[i - 1] > 1 && <span aria-hidden="true">…</span>}
            <Button
              aria-label={`${zh ? "第" : "Page "}${p}${zh ? "页" : ""}`}
              aria-current={p === current ? "page" : undefined}
              variant={p === current ? "soft" : "ghost"}
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          </React.Fragment>
        ))}
      </span>
      <Button
        aria-label={zh ? "下一页" : "Next page"}
        disabled={current === count}
        onClick={() => onPageChange(current + 1)}
      >
        ›
      </Button>
    </nav>
  );
}
export type TableColumn<T> = {
  key: string;
  title: React.ReactNode;
  dataIndex?: keyof T;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
};
export type TableState = {
  sort?: { key: string; direction: "asc" | "desc" } | null;
  filters: Record<string, string>;
  page: number;
  pageSize: number;
};
/** Set sort to null to explicitly clear controlled sorting; omit sort for internal sorting. Row-key values retain their original type. */
export type TableProps<T> = {
  data: T[];
  columns: TableColumn<T>[];
  rowKey: keyof T | ((row: T) => React.Key);
  manual?: boolean;
  loading?: boolean;
  onChange?: (state: TableState) => void;
  sort?: TableState["sort"];
  filters?: Record<string, string>;
  selectable?: boolean;
  selectedKeys?: React.Key[];
  onSelectionChange?: (keys: React.Key[]) => void;
  pagination?:
    | false
    | {
        pageSize?: number;
        page?: number;
        total?: number;
        onPageChange?: (page: number) => void;
      };
  empty?: React.ReactNode;
  className?: string;
};
export function Table<T>({
  data,
  columns,
  rowKey,
  manual = false,
  loading = false,
  onChange,
  sort: controlledSort,
  filters: controlledFilters,
  selectable,
  selectedKeys,
  onSelectionChange,
  pagination = false,
  empty,
  className,
}: TableProps<T>) {
  const zh = useMtone().locale === "zh";
  const [internal, setInternal] = React.useState<TableState>({
    filters: {},
    page: 1,
    pageSize: pagination ? pagination.pageSize || 10 : 10,
  });
  const [selected, setSelected] = React.useState<React.Key[]>([]);
  const state: TableState = {
    ...internal,
    sort: controlledSort === undefined ? internal.sort : controlledSort,
    filters: controlledFilters ?? internal.filters,
    page:
      pagination && pagination.page !== undefined
        ? pagination.page
        : internal.page,
    pageSize: Math.max(1, pagination ? pagination.pageSize || 10 : 10),
  };
  const keys = selectedKeys ?? selected;
  const update = (patch: Partial<TableState>) => {
    const next = { ...state, ...patch };
    setInternal(next);
    onChange?.(next);
  };
  const key = (row: T) =>
    typeof rowKey === "function" ? rowKey(row) : (row[rowKey] as React.Key);
  const val = (row: T, c: TableColumn<T>) =>
    row[c.dataIndex ?? (c.key as keyof T)];
  let rows = [...data];
  if (!manual) {
    rows = rows.filter((row) =>
      columns.every(
        (c) =>
          !state.filters[c.key] ||
          String(val(row, c) ?? "")
            .toLocaleLowerCase()
            .includes(state.filters[c.key].toLocaleLowerCase()),
      ),
    );
    if (state.sort) {
      const c = columns.find((c) => c.key === state.sort!.key);
      if (c)
        rows.sort((a, b) => {
          const x = val(a, c),
            y = val(b, c);
          return (
            (typeof x === "number" && typeof y === "number"
              ? x - y
              : String(x ?? "").localeCompare(String(y ?? ""))) *
            (state.sort!.direction === "asc" ? 1 : -1)
          );
        });
    }
  }
  const total =
    manual && pagination ? (pagination.total ?? rows.length) : rows.length;
  const page = Math.min(
    Math.max(1, state.page),
    Math.max(1, Math.ceil(total / state.pageSize)),
  );
  if (pagination && !manual)
    rows = rows.slice((page - 1) * state.pageSize, page * state.pageSize);
  const select = (next: React.Key[]) => {
    setSelected(next);
    onSelectionChange?.(next);
  };
  const all = rows.length > 0 && rows.every((r) => keys.includes(key(r)));
  return (
    <div className={cn("mt-table-wrap", className)}>
      <div className="mt-table-scroll">
        <table className="mt-table" aria-busy={loading || undefined}>
          <thead>
            <tr>
              {selectable && (
                <th>
                  <input
                    type="checkbox"
                    aria-label={zh ? "选择所有行" : "Select all rows"}
                    checked={all}
                    onChange={() =>
                      select(
                        all
                          ? keys.filter((k) => !rows.some((r) => key(r) === k))
                          : [...new Set([...keys, ...rows.map(key)])],
                      )
                    }
                  />
                </th>
              )}
              {columns.map((c) => (
                <th
                  key={c.key}
                  aria-sort={
                    state.sort?.key === c.key
                      ? state.sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {c.sortable ? (
                    <button
                      type="button"
                      className="mt-table-sort"
                      onClick={() =>
                        update({
                          sort:
                            state.sort?.key !== c.key
                              ? { key: c.key, direction: "asc" }
                              : state.sort.direction === "asc"
                                ? { key: c.key, direction: "desc" }
                                : undefined,
                          page: 1,
                        })
                      }
                    >
                      {c.title}
                      <span aria-hidden="true">
                        {state.sort?.key === c.key
                          ? state.sort.direction === "asc"
                            ? " ↑"
                            : " ↓"
                          : " ↕"}
                      </span>
                    </button>
                  ) : (
                    c.title
                  )}
                  {c.filterable && (
                    <input
                      className="mt-input mt-table-filter"
                      aria-label={`${zh ? "筛选" : "Filter"} ${typeof c.title === "string" ? c.title : c.key}`}
                      value={state.filters[c.key] || ""}
                      onChange={(e) =>
                        update({
                          filters: {
                            ...state.filters,
                            [c.key]: e.target.value,
                          },
                          page: 1,
                        })
                      }
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="mt-table-empty"
                >
                  <span role="status">{zh ? "加载中…" : "Loading…"}</span>
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr
                key={key(r)}
                data-selected={keys.includes(key(r)) || undefined}
              >
                {selectable && (
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`${zh ? "选择行" : "Select row"} ${key(r)}`}
                      checked={keys.includes(key(r))}
                      onChange={() =>
                        select(
                          keys.includes(key(r))
                            ? keys.filter((k) => k !== key(r))
                            : [...keys, key(r)],
                        )
                      }
                    />
                  </td>
                )}
                {columns.map((c) => (
                  <td key={c.key}>
                    {c.render
                      ? c.render(val(r, c), r, i)
                      : String(val(r, c) ?? "")}
                  </td>
                ))}
              </tr>
            ))}
            {!loading && !rows.length && (
              <tr>
                <td
                  className="mt-table-empty"
                  colSpan={columns.length + (selectable ? 1 : 0)}
                >
                  {empty ?? (zh ? "暂无数据" : "No data")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <Pagination
          total={total}
          pageSize={state.pageSize}
          page={page}
          onPageChange={(p) => {
            update({ page: p });
            pagination.onPageChange?.(p);
          }}
        />
      )}
    </div>
  );
}

export type TreeItem = {
  id: string;
  label: React.ReactNode;
  children?: TreeItem[];
  disabled?: boolean;
  icon?: React.ReactNode;
};
export type TreeProps = {
  items: TreeItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  label?: string;
  className?: string;
};
export function Tree({
  items,
  value,
  defaultValue,
  onValueChange,
  expanded,
  defaultExpanded = [],
  onExpandedChange,
  label,
  className,
}: TreeProps) {
  const zh = useMtone().locale === "zh";
  const [selection, setSelection] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(defaultExpanded);
  const [active, setActive] = React.useState<string>();
  const refs = React.useRef(new Map<string, HTMLDivElement>());
  const ids = expanded ?? open;
  const selected = value ?? selection;
  const visible: { item: TreeItem; level: number; parent?: string }[] = [];
  function walk(list: TreeItem[], level: number, parent?: string) {
    list.forEach((item) => {
      visible.push({ item, level, parent });
      if (ids.includes(item.id)) walk(item.children ?? [], level + 1, item.id);
    });
  }
  walk(items, 1);
  const enabled = visible.filter((x) => !x.item.disabled);
  const focusId = enabled.some((x) => x.item.id === active)
    ? active
    : enabled[0]?.item.id;
  const focus = (id?: string) => {
    if (id && enabled.some((x) => x.item.id === id)) {
      setActive(id);
      refs.current.get(id)?.focus();
    }
  };
  const toggle = (id: string) => {
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    setOpen(next);
    onExpandedChange?.(next);
  };
  const choose = (item: TreeItem) => {
    if (!item.disabled) {
      setSelection(item.id);
      onValueChange?.(item.id);
    }
  };
  return (
    <div
      className={cn("mt-tree", className)}
      role="tree"
      aria-label={label ?? (zh ? "目录树" : "Tree")}
    >
      {visible.map(({ item, level, parent }) => (
        <div
          ref={(el) => {
            if (el) refs.current.set(item.id, el);
            else refs.current.delete(item.id);
          }}
          key={item.id}
          role="treeitem"
          aria-level={level}
          aria-selected={selected === item.id}
          aria-expanded={
            item.children?.length ? ids.includes(item.id) : undefined
          }
          aria-disabled={item.disabled || undefined}
          tabIndex={!item.disabled && focusId === item.id ? 0 : -1}
          className="mt-tree-item"
          style={{ paddingInlineStart: 8 + (level - 1) * 18 }}
          onFocus={() => setActive(item.id)}
          onClick={() => {
            choose(item);
            if (!item.disabled) focus(item.id);
          }}
          onKeyDown={(e) => {
            if (item.disabled) return;
            const index = enabled.findIndex((x) => x.item.id === item.id);
            if (
              [
                "ArrowDown",
                "ArrowUp",
                "ArrowRight",
                "ArrowLeft",
                "Home",
                "End",
                "Enter",
                " ",
              ].includes(e.key)
            )
              e.preventDefault();
            switch (e.key) {
              case "ArrowDown":
                focus(enabled[index + 1]?.item.id);
                break;
              case "ArrowUp":
                focus(enabled[index - 1]?.item.id);
                break;
              case "Home":
                focus(enabled[0]?.item.id);
                break;
              case "End":
                focus(enabled.at(-1)?.item.id);
                break;
              case "ArrowRight":
                if (item.children?.length) {
                  if (!ids.includes(item.id)) toggle(item.id);
                  else focus(enabled[index + 1]?.item.id);
                }
                break;
              case "ArrowLeft":
                if (ids.includes(item.id) && item.children?.length)
                  toggle(item.id);
                else focus(parent);
                break;
              case "Enter":
              case " ":
                choose(item);
            }
          }}
        >
          {item.children?.length ? (
            <span
              aria-hidden="true"
              className="mt-tree-toggle"
              onClick={(e) => {
                e.stopPropagation();
                if (!item.disabled) toggle(item.id);
              }}
            >
              {ids.includes(item.id) ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </span>
          ) : (
            <span className="mt-tree-toggle" />
          )}
          {item.icon}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export type DatePickerProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  min?: string;
  max?: string;
  disabledDate?: (date: string) => boolean;
  disabled?: boolean;
  label?: string;
  clearable?: boolean;
  className?: string;
  name?: string;
};
/** Native single-date calendar. Calendar presentation/keyboard follow the browser; custom disabledDate is enforced on selection rather than drawn in the native calendar. Values are ISO YYYY-MM-DD. */
export function DatePicker({
  value,
  defaultValue = "",
  onValueChange,
  min,
  max,
  disabledDate,
  disabled,
  label,
  clearable = true,
  className,
  name,
}: DatePickerProps) {
  const zh = useMtone().locale === "zh";
  const [local, setLocal] = React.useState(defaultValue);
  const [error, setError] = React.useState(false);
  const current = value ?? local;
  const id = React.useId();
  const change = (next: string) => {
    const valid =
      !next ||
      (/^\d{4}-\d{2}-\d{2}$/.test(next) &&
        (!min || next >= min) &&
        (!max || next <= max) &&
        !disabledDate?.(next));
    setError(!valid);
    if (valid) {
      setLocal(next);
      onValueChange?.(next);
    }
  };
  return (
    <div className={cn("mt-date-picker", className)}>
      <input
        className="mt-input"
        type="date"
        name={name}
        value={current}
        min={min}
        max={max}
        disabled={disabled}
        aria-label={label ?? (zh ? "选择日期" : "Choose date")}
        aria-invalid={error || undefined}
        aria-describedby={error ? id : undefined}
        onChange={(e) => change(e.target.value)}
      />
      {clearable && current && (
        <Button
          variant="ghost"
          disabled={disabled}
          aria-label={zh ? "清除日期" : "Clear date"}
          onClick={() => change("")}
        >
          ×
        </Button>
      )}
      {error && (
        <span id={id} role="alert" className="mt-error">
          {zh ? "此日期不可选" : "This date is unavailable"}
        </span>
      )}
    </div>
  );
}

export type UploadContext = {
  signal: AbortSignal;
  onProgress: (percent: number) => void;
};
export type UploadAdapter = (
  file: File,
  context: UploadContext,
) => Promise<unknown>;
export type UploadFile = {
  id: string;
  file: File;
  status: "uploading" | "success" | "error" | "cancelled";
  progress: number;
  error?: string;
  validationError?: "type" | "size";
};
export type UploadProps = {
  upload: UploadAdapter;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  onChange?: (files: UploadFile[]) => void;
  className?: string;
  children?: React.ReactNode;
};
export function Upload({
  upload,
  accept,
  maxSize,
  multiple = true,
  disabled,
  onChange,
  className,
  children,
}: UploadProps) {
  const zh = useMtone().locale === "zh";
  const [files, setFiles] = React.useState<UploadFile[]>([]);
  const [drag, setDrag] = React.useState(false);
  const input = React.useRef<HTMLInputElement>(null);
  const current = React.useRef<UploadFile[]>([]);
  const runs = React.useRef(new Map<string, AbortController>());
  const alive = React.useRef(true);
  const changeRef = React.useRef(onChange);
  changeRef.current = onChange;
  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      runs.current.forEach((c) => c.abort());
      runs.current.clear();
    };
  }, []);
  const commit = (next: UploadFile[]) => {
    current.current = next;
    if (alive.current) {
      setFiles(next);
      changeRef.current?.(next);
    }
  };
  const patch = (id: string, p: Partial<UploadFile>) =>
    commit(current.current.map((f) => (f.id === id ? { ...f, ...p } : f)));
  const start = (entry: UploadFile) => {
    if (entry.validationError || disabled) return;
    runs.current.get(entry.id)?.abort();
    const controller = new AbortController();
    runs.current.set(entry.id, controller);
    patch(entry.id, { status: "uploading", progress: 0, error: undefined });
    const valid = () =>
      alive.current &&
      !controller.signal.aborted &&
      runs.current.get(entry.id) === controller;
    const context = {
      signal: controller.signal,
      onProgress: (n: number) => {
        if (valid())
          patch(entry.id, {
            progress: Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0)),
          });
      },
    };
    try {
      Promise.resolve(upload(entry.file, context)).then(
        () => {
          if (valid()) {
            patch(entry.id, { status: "success", progress: 100 });
            runs.current.delete(entry.id);
          }
        },
        (e) => {
          if (valid()) {
            patch(entry.id, {
              status: "error",
              error: e instanceof Error ? e.message : String(e),
            });
            runs.current.delete(entry.id);
          }
        },
      );
    } catch (e) {
      if (valid()) {
        patch(entry.id, {
          status: "error",
          error: e instanceof Error ? e.message : String(e),
        });
        runs.current.delete(entry.id);
      }
    }
  };
  const add = (list: File[]) => {
    if (disabled) return;
    (multiple ? list : list.slice(0, 1)).forEach((file) => {
      const matches =
        !accept ||
        accept.split(",").some((raw) => {
          const rule = raw.trim().toLowerCase();
          return rule.startsWith(".")
            ? file.name.toLowerCase().endsWith(rule)
            : rule.endsWith("/*")
              ? file.type.toLowerCase().startsWith(rule.slice(0, -1))
              : file.type.toLowerCase() === rule;
        });
      const validationError = !matches
        ? "type"
        : maxSize !== undefined && file.size > maxSize
          ? "size"
          : undefined;
      const error = !matches
        ? zh
          ? "文件类型不支持"
          : "Unsupported file type"
        : maxSize !== undefined && file.size > maxSize
          ? zh
            ? "文件太大"
            : "File is too large"
          : undefined;
      const entry: UploadFile = {
        id: globalThis.crypto.randomUUID(),
        file,
        status: error ? "error" : "uploading",
        progress: 0,
        error,
        validationError,
      };
      commit([...current.current, entry]);
      if (!error) start(entry);
    });
  };
  const cancel = (id: string) => {
    runs.current.get(id)?.abort();
    runs.current.delete(id);
    patch(id, { status: "cancelled" });
  };
  return (
    <div className={cn("mt-upload", className)}>
      <div
        className="mt-dropzone"
        data-dragging={drag || undefined}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          add(Array.from(e.dataTransfer.files));
        }}
      >
        <UploadIcon size={22} />
        {children ?? (
          <span>
            {zh
              ? "拖拽文件到此处，或选择文件"
              : "Drop files here, or choose files"}
          </span>
        )}
        <input
          ref={input}
          type="file"
          aria-label={zh ? "选择文件" : "Choose files"}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            add(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>
      <ul className="mt-upload-list">
        {files.map((f) => (
          <li key={f.id}>
            <span className="mt-upload-name">
              {f.file.name}
              <small role={f.status === "error" ? "alert" : "status"}>
                {f.error ??
                  {
                    uploading: zh ? "上传中" : "Uploading",
                    success: zh ? "上传成功" : "Uploaded",
                    cancelled: zh ? "已取消" : "Cancelled",
                    error: zh ? "上传失败" : "Failed",
                  }[f.status]}
              </small>
            </span>
            {f.status === "uploading" && (
              <>
                <progress
                  value={f.progress}
                  max={100}
                  aria-label={`${f.file.name} ${zh ? "进度" : "progress"}`}
                />
                <Button onClick={() => cancel(f.id)}>
                  {zh ? "取消" : "Cancel"}
                </Button>
              </>
            )}
            {(f.status === "cancelled" || f.status === "error") && (
              <Button
                disabled={disabled || !!f.validationError}
                onClick={() => start(f)}
              >
                {zh ? "重试" : "Retry"}
              </Button>
            )}
            <Button
              variant="ghost"
              aria-label={`${zh ? "移除" : "Remove"} ${f.file.name}`}
              onClick={() => {
                runs.current.get(f.id)?.abort();
                runs.current.delete(f.id);
                commit(current.current.filter((x) => x.id !== f.id));
              }}
            >
              ×
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
export const Dropzone = Upload;

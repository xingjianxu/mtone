import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, cn, useMtone, type Locale } from "./basic";
import { Select } from "./interactive";
import {
  addDays,
  dateKey,
  isoWeek,
  parseCalendarDate,
  setMonth,
} from "./calendar-model";
export type CalendarMode = "month" | "year";
export type CalendarSelectInfo = {
  source: "date" | "month" | "year" | "customize";
};
export type CalendarCellInfo = {
  type: "date" | "month";
  originNode: React.ReactElement;
  today: string;
};
export type CalendarHeaderInfo = {
  value: string;
  type: CalendarMode;
  onChange: (value: string) => void;
  onTypeChange: (mode: CalendarMode) => void;
};
export type CalendarSemanticSlot = "root" | "header" | "body" | "cell";
export interface CalendarProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "onSelect" | "defaultValue"
> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  mode?: CalendarMode;
  defaultMode?: CalendarMode;
  onPanelChange?: (value: string, mode: CalendarMode) => void;
  onSelect?: (value: string, info: CalendarSelectInfo) => void;
  validRange?: readonly [string, string];
  disabledDate?: (value: string) => boolean;
  disabled?: boolean;
  fullscreen?: boolean;
  showWeek?: boolean;
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  cellRender?: (value: string, info: CalendarCellInfo) => React.ReactNode;
  fullCellRender?: (value: string, info: CalendarCellInfo) => React.ReactNode;
  headerRender?: (info: CalendarHeaderInfo) => React.ReactNode;
  classNames?: Partial<Record<CalendarSemanticSlot, string>>;
  styles?: Partial<Record<CalendarSemanticSlot, React.CSSProperties>>;
}
export function Calendar({
  value,
  defaultValue,
  onChange,
  onValueChange,
  mode,
  defaultMode = "month",
  onPanelChange,
  onSelect,
  validRange,
  disabledDate,
  disabled = false,
  fullscreen = true,
  showWeek = false,
  locale,
  weekStartsOn,
  cellRender,
  fullCellRender,
  headerRender,
  classNames,
  styles,
  className,
  style,
  ...props
}: CalendarProps) {
  const provider = useMtone();
  const zh = (locale ?? provider.locale) === "zh";
  const start = weekStartsOn ?? (zh ? 1 : 0);
  const now = new Date();
  const today = `${now.getFullYear().toString().padStart(4, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (value !== undefined && !parseCalendarDate(value))
    throw new RangeError("Calendar value must be a valid YYYY-MM-DD date");
  if (defaultValue !== undefined && !parseCalendarDate(defaultValue))
    throw new RangeError(
      "Calendar defaultValue must be a valid YYYY-MM-DD date",
    );
  if (
    validRange &&
    (!parseCalendarDate(validRange[0]) ||
      !parseCalendarDate(validRange[1]) ||
      validRange[0] > validRange[1])
  )
    throw new RangeError(
      "Calendar validRange must be an ordered pair of YYYY-MM-DD dates",
    );
  const clamp = (v: string) =>
    validRange
      ? v < validRange[0]
        ? validRange[0]
        : v > validRange[1]
          ? validRange[1]
          : v
      : v;
  const [local, setLocal] = React.useState(() => clamp(defaultValue ?? today));
  const current = value ?? local;
  const [localMode, setLocalMode] = React.useState(defaultMode);
  const type = mode ?? localMode;
  const [view, setView] = React.useState(() => clamp(current));
  const [focus, setFocus] = React.useState(() => clamp(current));
  const gridFocused = React.useRef(false);
  React.useEffect(() => {
    pending.current = gridFocused.current;
    setView(clamp(current));
    setFocus(clamp(current));
  }, [current, validRange?.[0], validRange?.[1]]);
  const root = React.useRef<HTMLDivElement>(null);
  const pending = React.useRef(false);
  React.useLayoutEffect(() => {
    if (pending.current || gridFocused.current) {
      root.current
        ?.querySelector<HTMLButtonElement>(
          `button[data-date="${focus}"]:not(:disabled), button.mt-calendar-day[tabindex="0"]`,
        )
        ?.focus();
      pending.current = false;
    }
  }, [focus, view, type, disabledDate, disabled]);
  const date = parseCalendarDate(view)!;
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const unavailable = (v: string) =>
    !parseCalendarDate(v) ||
    disabled ||
    Boolean(validRange && (v < validRange[0] || v > validRange[1])) ||
    Boolean(disabledDate?.(v));
  const emit = (
    v: string,
    source: CalendarSelectInfo["source"],
    nextMode = type,
  ) => {
    if (!parseCalendarDate(v) || disabled) return;
    let next = clamp(v);
    if (unavailable(next)) {
      if (source !== "month" && source !== "year") return;
      const candidate = monthCandidate(next);
      if (!candidate) return;
      next = candidate;
    }
    if (value === undefined) setLocal(next);
    if (next !== current) {
      onChange?.(next);
      onValueChange?.(next);
    }
    onSelect?.(next, { source });
    if (
      next.slice(0, type === "month" ? 7 : 4) !==
        view.slice(0, type === "month" ? 7 : 4) ||
      nextMode !== type
    )
      onPanelChange?.(next, nextMode);
    if (value === undefined) {
      setView(next);
      setFocus(next);
    }
  };
  const changeMode = (next: CalendarMode) => {
    if (disabled || next === type) return;
    if (mode === undefined) setLocalMode(next);
    onPanelChange?.(view, next);
  };
  const navigate = (delta: number) =>
    emit(
      setMonth(
        view,
        year + (type === "year" ? delta : 0),
        month + (type === "month" ? delta : 0),
      ),
      type === "year" ? "year" : "month",
    );
  const monthNames = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(zh ? "zh-CN" : "en-US", {
      month: "short",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(2024, i, 1))),
  );
  const first = `${String(year).padStart(4, "0")}-${String(month + 1).padStart(2, "0")}-01`;
  const gridStart = addDays(
    first,
    -((parseCalendarDate(first)!.getUTCDay() - start + 7) % 7),
  );
  const values =
    type === "month"
      ? Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
      : Array.from({ length: 12 }, (_, i) => setMonth(view, year, i));
  const monthCandidate = (v: string) => {
    const d = parseCalendarDate(v);
    if (!d) return null;
    let candidate = setMonth(current, d.getUTCFullYear(), d.getUTCMonth());
    candidate = clamp(candidate);
    if (candidate.slice(0, 7) !== v.slice(0, 7)) return null;
    if (!unavailable(candidate)) return candidate;
    for (let n = 1; n <= 31; n++) {
      const day = `${v.slice(0, 7)}-${String(n).padStart(2, "0")}`;
      if (parseCalendarDate(day) && !unavailable(day)) return day;
    }
    return null;
  };
  const focusValue =
    values.find((v) =>
      type === "month"
        ? !unavailable(v) && v === focus
        : Boolean(monthCandidate(v)) && v.slice(0, 7) === focus.slice(0, 7),
    ) ??
    values.find((v) =>
      type === "month" ? !unavailable(v) : Boolean(monthCandidate(v)),
    );
  const key = (event: React.KeyboardEvent<HTMLButtonElement>, v: string) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    let next: string | undefined;
    const d = parseCalendarDate(v)!;
    const delta = type === "year" ? 3 : 7;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      emit(
        type === "year" ? (monthCandidate(v) ?? v) : v,
        type === "year" ? "month" : "date",
      );
      return;
    }
    const shifts: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -delta,
      ArrowDown: delta,
    };
    if (event.key in shifts)
      next =
        type === "month"
          ? addDays(v, shifts[event.key])
          : setMonth(
              v,
              d.getUTCFullYear(),
              d.getUTCMonth() + shifts[event.key],
            );
    if (event.key === "Home" || event.key === "End") {
      const offset =
        type === "month"
          ? (d.getUTCDay() - start + 7) % 7
          : d.getUTCMonth() % 3;
      const shift = event.key === "Home" ? -offset : delta - 1 - offset;
      next =
        type === "month"
          ? addDays(v, shift)
          : setMonth(v, d.getUTCFullYear(), d.getUTCMonth() + shift);
    }
    if (event.key === "PageUp" || event.key === "PageDown") {
      const n = event.key === "PageUp" ? -1 : 1;
      next = setMonth(
        v,
        d.getUTCFullYear() + (type === "year" || event.shiftKey ? n : 0),
        d.getUTCMonth() + (type === "month" && !event.shiftKey ? n : 0),
      );
    }
    if (!next) return;
    event.preventDefault();
    next = clamp(next);
    const direction = next < v ? -1 : 1;
    let attempts = 0;
    while (
      (type === "month" ? unavailable(next) : !monthCandidate(next)) &&
      attempts++ < 366
    ) {
      const nd = parseCalendarDate(next);
      if (!nd) return;
      const candidate = clamp(
        type === "month"
          ? addDays(next, direction)
          : setMonth(next, nd.getUTCFullYear(), nd.getUTCMonth() + direction),
      );
      if (candidate === next || !parseCalendarDate(candidate)) return;
      next = candidate;
    }
    if (type === "month" ? unavailable(next) : !monthCandidate(next)) return;
    setFocus(next);
    setView(next);
    pending.current = true;
  };
  const cell = (v: string) => {
    const d = parseCalendarDate(v);
    if (!d) return <td role="gridcell" key={v} />;
    const off = type === "month" ? unavailable(v) : !monthCandidate(v);
    const selected =
      type === "month" ? current === v : current.slice(0, 7) === v.slice(0, 7);
    const originNode = (
      <span className="mt-calendar-number">
        {type === "month" ? d.getUTCDate() : monthNames[d.getUTCMonth()]}
      </span>
    );
    const info: CalendarCellInfo = {
      type: type === "month" ? "date" : "month",
      originNode,
      today,
    };
    return (
      <td
        role="gridcell"
        aria-selected={selected}
        key={v}
        className={cn("mt-calendar-cell", classNames?.cell)}
        style={styles?.cell}
      >
        <button
          type="button"
          data-date={v}
          disabled={off}
          tabIndex={!off && v === focusValue ? 0 : -1}
          aria-label={type === "month" ? v : v.slice(0, 7)}
          aria-current={v === today ? "date" : undefined}
          data-selected={selected || undefined}
          data-outside={
            (type === "month" && d.getUTCMonth() !== month) || undefined
          }
          className="mt-calendar-day"
          onKeyDown={(e) => key(e, v)}
          onClick={() =>
            emit(
              type === "year" ? (monthCandidate(v) ?? v) : v,
              type === "year" ? "month" : "date",
            )
          }
        >
          {fullCellRender ? (
            fullCellRender(v, info)
          ) : (
            <>
              {originNode}
              {cellRender && (
                <span className="mt-calendar-content">
                  {cellRender(v, info)}
                </span>
              )}
            </>
          )}
        </button>
      </td>
    );
  };
  const columns = type === "month" ? 7 : 3;
  const minYear = validRange
    ? Number(validRange[0].slice(0, 4))
    : Math.max(1, year - 100);
  const maxYear = validRange
    ? Number(validRange[1].slice(0, 4))
    : Math.min(9999, year + 100);
  const navDisabled = (n: number) => {
    const next = setMonth(
      view,
      year + (type === "year" ? n : 0),
      month + (type === "month" ? n : 0),
    );
    return disabled || clamp(next) === view;
  };
  return (
    <div
      {...props}
      ref={root}
      onFocusCapture={(event) => {
        gridFocused.current = (event.target as HTMLElement).classList.contains(
          "mt-calendar-day",
        );
        props.onFocusCapture?.(event);
      }}
      onBlurCapture={(event) => {
        if (
          !event.relatedTarget ||
          !root.current?.contains(event.relatedTarget as Node)
        )
          gridFocused.current = false;
        props.onBlurCapture?.(event);
      }}
      className={cn(
        "mt-calendar",
        !fullscreen && "mt-calendar-mini",
        className,
        classNames?.root,
      )}
      style={{ ...styles?.root, ...style }}
      data-mode={type}
    >
      <div
        className={cn("mt-calendar-header", classNames?.header)}
        style={styles?.header}
      >
        {headerRender ? (
          headerRender({
            value: view,
            type,
            onChange: (v) => emit(v, "customize"),
            onTypeChange: changeMode,
          })
        ) : (
          <>
            <Button
              size="sm"
              aria-label={
                zh
                  ? `上一${type === "month" ? "月" : "年"}`
                  : `Previous ${type}`
              }
              disabled={navDisabled(-1)}
              onClick={() => navigate(-1)}
            >
              <ChevronLeft size={14} />
            </Button>
            <Select
              label={zh ? "年份" : "Year"}
              value={String(year)}
              disabled={disabled}
              options={Array.from(
                { length: maxYear - minYear + 1 },
                (_, i) => ({
                  value: String(minYear + i),
                  label: String(minYear + i),
                }),
              )}
              onValueChange={(v) =>
                v && emit(setMonth(view, Number(v), month), "year")
              }
            />
            {type === "month" && (
              <Select
                label={zh ? "月份" : "Month"}
                value={String(month)}
                disabled={disabled}
                options={monthNames.map((label, i) => ({
                  value: String(i),
                  label,
                  disabled: validRange
                    ? `${year}-${String(i + 1).padStart(2, "0")}` <
                        validRange[0].slice(0, 7) ||
                      `${year}-${String(i + 1).padStart(2, "0")}` >
                        validRange[1].slice(0, 7)
                    : false,
                }))}
                onValueChange={(v) =>
                  v !== null && emit(setMonth(view, year, Number(v)), "month")
                }
              />
            )}
            <Button
              size="sm"
              aria-label={
                zh ? `下一${type === "month" ? "月" : "年"}` : `Next ${type}`
              }
              disabled={navDisabled(1)}
              onClick={() => navigate(1)}
            >
              <ChevronRight size={14} />
            </Button>
            <span className="mt-calendar-modes">
              {(["month", "year"] as const).map((m) => (
                <Button
                  key={m}
                  size="sm"
                  variant={type === m ? "soft" : "ghost"}
                  aria-pressed={type === m}
                  disabled={disabled}
                  onClick={() => changeMode(m)}
                >
                  {zh
                    ? m === "month"
                      ? "月"
                      : "年"
                    : m === "month"
                      ? "Month"
                      : "Year"}
                </Button>
              ))}
            </span>
          </>
        )}
      </div>
      <table
        role="grid"
        aria-label={
          zh
            ? `${year}年${type === "month" ? `${month + 1}月` : ""}`
            : `${type === "month" ? monthNames[month] + " " : ""}${year}`
        }
        className={cn("mt-calendar-body", classNames?.body)}
        style={styles?.body}
      >
        <thead>
          {type === "month" && (
            <tr>
              {showWeek && <th scope="col">{zh ? "周" : "Week"}</th>}
              {Array.from({ length: 7 }, (_, i) => (
                <th scope="col" key={i}>
                  {new Intl.DateTimeFormat(zh ? "zh-CN" : "en-US", {
                    weekday: "short",
                    timeZone: "UTC",
                  }).format(new Date(Date.UTC(2024, 0, 7 + ((start + i) % 7))))}
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {Array.from({ length: values.length / columns }, (_, row) => (
            <tr key={row}>
              {showWeek && type === "month" && (
                <th scope="row" className="mt-calendar-week">
                  {isoWeek(addDays(values[row * columns], (4 - start + 7) % 7))}
                </th>
              )}
              {values.slice(row * columns, row * columns + columns).map(cell)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

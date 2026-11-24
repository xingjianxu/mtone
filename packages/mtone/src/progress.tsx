import * as React from "react";
import { Check, X } from "lucide-react";

export type ProgressType = "line" | "circle" | "dashboard";
export type ProgressStatus = "normal" | "active" | "success" | "exception";
export type ProgressColor = string | { from: string; to: string };
export interface ProgressProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "color"
> {
  value: number;
  label?: string;
  type?: ProgressType;
  status?: ProgressStatus;
  showInfo?: boolean;
  format?: (value: number, successValue: number) => React.ReactNode;
  size?: "small" | "medium" | number;
  strokeWidth?: number;
  strokeLinecap?: "round" | "butt" | "square";
  color?: ProgressColor;
  trackColor?: string;
  success?: { value: number; color?: string };
  steps?: number | { count: number; gap?: number };
  gapDegree?: number;
  gapPosition?: "top" | "bottom" | "left" | "right";
}
const finite = (n: number | undefined, fallback: number) =>
  n !== undefined && Number.isFinite(n) ? n : fallback;
const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));
const percent = (n: number) => clamp(finite(n, 0), 0, 100);

/** Compact progress indicator. Numeric size is line height or circular diameter in px. */
export function Progress({
  value,
  label = "Progress",
  type = "line",
  status = "normal",
  showInfo = false,
  format,
  size = "medium",
  strokeWidth,
  strokeLinecap = "round",
  color,
  trackColor,
  success,
  steps,
  gapDegree = 75,
  gapPosition = "bottom",
  className,
  style,
  ...props
}: ProgressProps) {
  const id = React.useId().replace(/:/g, "");
  const n = percent(value);
  const completed = Math.min(n, percent(success?.value ?? 0));
  const ring = type !== "line";
  const diameter = clamp(
    finite(
      typeof size === "number" ? size : undefined,
      size === "small" ? 64 : 100,
    ),
    16,
    4096,
  );
  const thickness = clamp(
    finite(
      strokeWidth,
      ring
        ? 6
        : finite(
            typeof size === "number" ? size : undefined,
            size === "small" ? 3 : 5,
          ),
    ),
    1,
    ring ? 30 : 100,
  );
  const count = clamp(
    Math.floor(finite(typeof steps === "number" ? steps : steps?.count, 0)),
    0,
    1000,
  );
  const stepGap = clamp(
    finite(typeof steps === "object" ? steps.gap : undefined, 2),
    0,
    100,
  );
  const fill =
    color ??
    (status === "exception"
      ? "var(--mt-progress-failure-fill, #b6403b)"
      : "var(--mt-progress-fill, #7d9c84)");
  const gradient = typeof fill !== "string";
  const paint = gradient ? `url(#mt-progress-${id})` : fill;
  const background = gradient
    ? `linear-gradient(to right, ${fill.from}, ${fill.to})`
    : fill;
  const successColor =
    success?.color ?? "var(--mt-progress-success-fill, #548164)";
  const info = format ? (
    format(n, completed)
  ) : status === "success" ? (
    <Check size={16} aria-hidden="true" />
  ) : status === "exception" ? (
    <X size={16} aria-hidden="true" />
  ) : (
    `${n}%`
  );
  const infoNode = showInfo && (
    <span className="mt-progress-info" aria-hidden="true">
      {info}
    </span>
  );
  const radius = (100 - thickness) / 2;
  const gap = type === "dashboard" ? clamp(finite(gapDegree, 75), 0, 295) : 0;
  const sweep = 360 - gap;
  const start = gap
    ? { bottom: 90, top: 270, left: 180, right: 0 }[gapPosition] + gap / 2
    : -90;
  const arc = (offset: number, length: number) => {
    const point = (angle: number) => {
      const r = (angle * Math.PI) / 180;
      return `${50 + radius * Math.cos(r)} ${50 + radius * Math.sin(r)}`;
    };
    // Two arcs also represent a complete circle without an SVG coincident-endpoint ambiguity.
    const middle = offset + length / 2;
    return `M ${point(offset)} A ${radius} ${radius} 0 0 1 ${point(middle)} A ${radius} ${radius} 0 0 1 ${point(offset + length)}`;
  };
  const path = (
    offset: number,
    length: number,
    stroke: string,
    key: string,
    cls?: string,
    linecap = strokeLinecap,
  ) =>
    length > 0 ? (
      <path
        key={key}
        className={cls}
        d={arc(offset, length)}
        fill="none"
        stroke={stroke}
        strokeWidth={thickness}
        strokeLinecap={linecap}
      />
    ) : null;
  return (
    <div
      {...props}
      className={["mt-progress", `mt-progress-${type}`, className]
        .filter(Boolean)
        .join(" ")}
      data-status={status}
      role="progressbar"
      aria-label={props["aria-label"] ?? label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={n}
      aria-valuetext={
        props["aria-valuetext"] ??
        (status === "exception"
          ? `${n}% (error)`
          : status === "success"
            ? `${n}% (success)`
            : undefined)
      }
      style={{
        ...(ring ? { width: diameter, height: diameter } : {}),
        ...style,
      }}
    >
      {ring ? (
        <svg
          viewBox="0 0 100 100"
          aria-hidden="true"
          className="mt-progress-svg"
        >
          {gradient && (
            <defs>
              <linearGradient
                id={`mt-progress-${id}`}
                gradientUnits="userSpaceOnUse"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={fill.from} />
                <stop offset="100%" stopColor={fill.to} />
              </linearGradient>
            </defs>
          )}
          {count ? (
            Array.from({ length: count }, (_, i) => {
              const segment = sweep / count;
              const gapAngle =
                (((stepGap * 100) / diameter) * 180) / (Math.PI * radius);
              const capAngle =
                strokeLinecap === "butt"
                  ? 0
                  : (2 * Math.asin(thickness / (2 * radius)) * 180) / Math.PI;
              // Dense steps cannot fit round/square caps: use flat ends rather than overlap.
              const linecap =
                capAngle + gapAngle >= segment * 0.9 ? "butt" : strokeLinecap;
              const padding = Math.min(
                segment * 0.9,
                gapAngle + (linecap === "butt" ? 0 : capAngle),
              );
              const filled = i < Math.round((n / 100) * count);
              const succeeded = i < Math.round((completed / 100) * count);
              return (
                <g key={i} data-progress-step data-filled={filled}>
                  {path(
                    start + i * segment + padding / 2,
                    segment - padding,
                    succeeded
                      ? successColor
                      : filled
                        ? paint
                        : (trackColor ?? "var(--mt-progress-track, #efefed)"),
                    String(i),
                    undefined,
                    linecap,
                  )}
                </g>
              );
            })
          ) : (
            <>
              {path(
                start,
                sweep,
                trackColor ?? "var(--mt-progress-track, #efefed)",
                "track",
              )}
              {path(
                start,
                (sweep * n) / 100,
                paint,
                "fill",
                "mt-progress-arc-fill",
              )}
              {path(
                start,
                (sweep * completed) / 100,
                successColor,
                "success",
                "mt-progress-arc-success",
              )}
            </>
          )}
        </svg>
      ) : (
        <div
          className={`mt-progress-track${count ? " mt-progress-steps" : ""}`}
          style={{
            height: thickness,
            background: count ? undefined : trackColor,
            borderRadius: strokeLinecap === "round" ? thickness : 0,
            gap: count ? stepGap : undefined,
          }}
          aria-hidden="true"
        >
          {count ? (
            Array.from({ length: count }, (_, i) => {
              const filled = i < Math.round((n / 100) * count);
              return (
                <span
                  key={i}
                  data-progress-step
                  data-filled={filled}
                  style={{
                    background:
                      i < Math.round((completed / 100) * count)
                        ? successColor
                        : filled
                          ? background
                          : trackColor,
                    borderRadius: strokeLinecap === "round" ? thickness : 0,
                  }}
                />
              );
            })
          ) : (
            <>
              <span
                className="mt-progress-fill"
                style={{ width: `${n}%`, background }}
              />
              {completed > 0 && (
                <span
                  className="mt-progress-success"
                  style={{ width: `${completed}%`, background: successColor }}
                />
              )}
            </>
          )}
        </div>
      )}
      {infoNode}
    </div>
  );
}

import * as React from "react";
import { cn, Spinner } from "./basic";

export interface LoadingOverlayProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Whether to mount the local overlay. Defaults to false. */
  visible?: boolean;
  /** Optional visible text, also used to name the loading status. */
  label?: string;
  /** Replaces the default Spinner; null intentionally hides the spinner. */
  loader?: React.ReactNode;
  overlayColor?: string;
  /** Surface opacity only; clamped to 0–1. */
  opacity?: number;
  /** Background blur in pixels. */
  blur?: number;
  radius?: React.CSSProperties["borderRadius"];
  zIndex?: number;
}

/** Place inside a positioned parent. Blocks pointers, not keyboard focus. */
export const LoadingOverlay = React.forwardRef<
  HTMLDivElement,
  LoadingOverlayProps
>(function LoadingOverlay(
  {
    visible = false,
    label,
    loader,
    overlayColor = "var(--mt-bg, #fff)",
    opacity = 0.75,
    blur = 0,
    radius = "inherit",
    zIndex = 10,
    className,
    style,
    ...props
  },
  ref,
) {
  if (!visible) return null;
  const statusLabel = label?.trim() || "Loading";
  const visualStyle = {
    "--mt-loading-overlay-color": overlayColor,
    "--mt-loading-overlay-opacity": Number.isFinite(opacity)
      ? Math.max(0, Math.min(1, opacity))
      : 0.75,
    "--mt-loading-overlay-blur": `${Number.isFinite(blur) ? Math.max(0, blur) : 0}px`,
    borderRadius: radius,
    zIndex: Number.isFinite(zIndex) ? zIndex : 10,
    ...style,
  } as React.CSSProperties;
  return (
    <div
      {...props}
      ref={ref}
      className={cn("mt-loading-overlay", className)}
      style={visualStyle}
    >
      <div className="mt-loading-overlay-backdrop" aria-hidden="true" />
      <div
        className="mt-loading-overlay-content"
        role={loader === undefined ? undefined : "status"}
        aria-label={loader === undefined ? undefined : statusLabel}
      >
        {loader === undefined ? <Spinner label={statusLabel} /> : loader}
        {label && <span className="mt-loading-overlay-label">{label}</span>}
      </div>
    </div>
  );
});

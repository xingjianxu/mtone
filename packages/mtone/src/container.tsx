import type { ComponentPropsWithRef, CSSProperties } from "react";
import { isLayoutWidthPreset, layoutWidths } from "./layout-widths";

export interface ContainerProps extends ComponentPropsWithRef<"div"> {
  /** A preset, positive pixel value, CSS size, or "none". Defaults to "md". */
  maxWidth?: number | string;
  /** Inline padding on each side: pixels or a CSS length. Defaults to 16px. */
  paddingInline?: number | string;
}

export function Container({
  maxWidth = "md",
  paddingInline = 16,
  className,
  style,
  ...props
}: ContainerProps) {
  const width = typeof maxWidth === "number"
    ? (Number.isFinite(maxWidth) && maxWidth > 0 ? `${maxWidth}px` : `${layoutWidths.md}px`)
    : isLayoutWidthPreset(maxWidth) ? `${layoutWidths[maxWidth]}px` : maxWidth;
  const padding = typeof paddingInline === "number"
    ? (Number.isFinite(paddingInline) && paddingInline >= 0 ? `${paddingInline}px` : "16px")
    : paddingInline;

  return (
    <div
      {...props}
      className={["mt-container", className].filter(Boolean).join(" ")}
      style={{
        "--mt-container-max-width": width,
        "--mt-container-padding-inline": padding,
        ...style,
      } as CSSProperties}
    />
  );
}

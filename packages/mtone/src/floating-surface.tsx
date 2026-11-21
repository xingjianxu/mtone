import React from "react";
import { Menu as BMenu } from "@base-ui/react/menu";
import { ContextMenu as BContextMenu } from "@base-ui/react/context-menu";
import { Popover as BPopover } from "@base-ui/react/popover";
import { useDirection } from "@base-ui/react/direction-provider";
import { MtoneScope, cn } from "./basic";

export const MenuSurfaceOwnerContext = React.createContext<string | undefined>(
  undefined,
);

type FloatingAlign = "start" | "end" | "left" | "right";
export interface FloatingLayoutProps {
  /** Content-sized by default. Numbers are CSS pixels; strings are CSS widths. */
  width?: React.CSSProperties["width"];
  /** start/end are logical; left/right are physical even in RTL. */
  align?: FloatingAlign;
}
/** Internal surface shared without wrapping Menu in a second interactive root. */
export function FloatingSurface({
  children,
  kind = "popover",
  width,
  align = "start",
  side = "bottom",
  label,
  unstyled,
  finalFocus,
  initialFocus,
}: Omit<FloatingLayoutProps, "align"> & {
  children: React.ReactNode;
  kind?: "popover" | "menu" | "submenu" | "context";
  align?: FloatingAlign | "center";
  side?: "top" | "bottom" | "left" | "right";
  unstyled?: boolean;
  label?: string;
  finalFocus?: boolean | (() => boolean);
  initialFocus?: boolean;
}) {
  const direction = useDirection();
  const owner = React.useContext(MenuSurfaceOwnerContext);
  const rtl =
    direction === "rtl" &&
    !(kind === "popover" && (side === "left" || side === "right"));
  const resolvedAlign =
    align === "left"
      ? rtl
        ? "end"
        : "start"
      : align === "right"
        ? rtl
          ? "start"
          : "end"
        : align;
  const Primitive =
    kind === "popover" ? BPopover : kind === "context" ? BContextMenu : BMenu;
  return (
    <Primitive.Portal keepMounted={kind !== "popover"}>
      <MtoneScope>
        <Primitive.Positioner
          className="mt-positioner"
          side={
            kind === "context"
              ? undefined
              : kind === "submenu"
                ? "inline-end"
                : side
          }
          sideOffset={
            kind === "context" ? undefined : kind === "popover" ? 6 : 4
          }
          align={kind === "submenu" ? "start" : resolvedAlign}
        >
          <Primitive.Popup
            finalFocus={finalFocus}
            initialFocus={initialFocus}
            data-menu-owner={kind === "popover" ? undefined : owner}
            className={cn(
              "mt-popup",
              "mt-floating-popup",
              kind === "popover" ? "mt-popover" : "mt-menu-popup",
              kind === "popover" && unstyled && "mt-popover-unstyled",
            )}
            style={{
              width: width ?? "max-content",
              minWidth: width === undefined ? undefined : 0,
            }}
            aria-label={label}
          >
            {children}
          </Primitive.Popup>
        </Primitive.Positioner>
      </MtoneScope>
    </Primitive.Portal>
  );
}

import React from "react";
import { Menu as BMenu } from "@base-ui/react/menu";
import { ContextMenu as BContextMenu } from "@base-ui/react/context-menu";
import { Popover as BPopover } from "@base-ui/react/popover";
import { useDirection } from "@base-ui/react/direction-provider";
import { MtoneScope, useMtone, cn } from "./basic";
import type { OpenProps } from "./interactive";

export const DropdownOwnerContext = React.createContext<string | undefined>(
  undefined,
);

export type DropdownAlign = "start" | "end" | "left" | "right";
export interface DropdownLayoutProps {
  /** Content-sized by default. Numbers are CSS pixels; strings are CSS widths. */
  width?: React.CSSProperties["width"];
  /** start/end are logical; left/right are physical even in RTL. */
  align?: DropdownAlign;
}
export interface DropdownProps extends OpenProps, DropdownLayoutProps {
  trigger: React.ReactElement;
  content: React.ReactNode;
  /** Accessible name for the nonmodal dialog. */
  label?: string;
}

/** Internal surface shared without wrapping Menu in a second interactive root. */
export function DropdownSurface({
  children,
  kind = "popover",
  width,
  align = "start",
  label,
  finalFocus,
}: DropdownLayoutProps & {
  children: React.ReactNode;
  kind?: "popover" | "menu" | "submenu" | "context";
  label?: string;
  finalFocus?: boolean | (() => boolean);
}) {
  const direction = useDirection();
  const owner = React.useContext(DropdownOwnerContext);
  const resolvedAlign =
    align === "left"
      ? direction === "rtl"
        ? "end"
        : "start"
      : align === "right"
        ? direction === "rtl"
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
                : "bottom"
          }
          sideOffset={kind === "context" ? undefined : 4}
          align={kind === "submenu" ? "start" : resolvedAlign}
        >
          <Primitive.Popup
            finalFocus={finalFocus}
            data-dropdown-owner={owner}
            className={cn(
              "mt-popup",
              "mt-dropdown-popup",
              kind !== "popover" && "mt-menu-popup",
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

export function Dropdown({
  trigger,
  content,
  width,
  align,
  label,
  ...props
}: DropdownProps) {
  const { locale } = useMtone();
  return (
    <BPopover.Root {...props} modal={false}>
      <BPopover.Trigger render={trigger} />
      <DropdownSurface
        width={width}
        align={align}
        label={label ?? (locale === "zh" ? "下拉内容" : "Dropdown content")}
      >
        {content}
      </DropdownSurface>
    </BPopover.Root>
  );
}

"use client";
import * as React from "react";
import { Tooltip as Base } from "@base-ui/react/tooltip";
import type { MtoneAccent } from "./accent-colors";
import { MtoneScope, cn } from "./basic";
import type { OpenProps } from "./interactive";

export interface TooltipProviderProps {
  children?: React.ReactNode;
  delay?: number;
  closeDelay?: number;
  timeout?: number;
}
export type TooltipTrigger = "hover" | "focus" | "click" | "contextMenu";
export type TooltipPart = "trigger" | "positioner" | "popup" | "arrow";
export interface TooltipProps extends OpenProps {
  children: React.ReactElement;
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  trigger?: TooltipTrigger;
  delay?: number;
  closeDelay?: number;
  offset?: number;
  alignOffset?: number;
  avoidCollisions?: boolean;
  shift?: boolean;
  arrow?: boolean;
  arrowPadding?: number;
  disabled?: boolean;
  keepMounted?: boolean;
  container?: Base.Portal.Props["container"];
  zIndex?: number;
  tone?: "default" | MtoneAccent;
  classNames?: Partial<Record<TooltipPart, string>>;
  styles?: Partial<Record<TooltipPart, React.CSSProperties>>;
  /** Enables a focusable wrapper for a child explicitly passed disabled. */
  wrapDisabledTrigger?: boolean;
}

const SharedProviderContext = React.createContext(false);

/** Shares the hover delays and adjacent transition behavior of Base UI Tooltip. */
export function TooltipProvider({ children, delay, closeDelay, timeout }: TooltipProviderProps) {
  return (
    <SharedProviderContext.Provider value>
      <Base.Provider delay={delay} closeDelay={closeDelay} timeout={timeout}>
        {children}
      </Base.Provider>
    </SharedProviderContext.Provider>
  );
}

function hasContent(node: React.ReactNode): boolean {
  if (node == null || typeof node === "boolean") return false;
  if (typeof node === "string") return node.trim().length > 0;
  if (Array.isArray(node)) return node.some(hasContent);
  if (React.isValidElement<{ children?: React.ReactNode }>(node) && node.type === React.Fragment) {
    return hasContent(node.props.children);
  }
  return true;
}

type ChildProps = React.HTMLAttributes<HTMLElement> & { disabled?: boolean };

function TooltipInstance({
  children,
  content,
  side = "top",
  align = "center",
  trigger = "hover",
  delay,
  closeDelay,
  offset = 6,
  alignOffset = 0,
  avoidCollisions = true,
  shift,
  arrow = false,
  arrowPadding,
  disabled = false,
  keepMounted = false,
  container,
  zIndex,
  tone = "default",
  classNames,
  styles,
  wrapDisabledTrigger = false,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: TooltipProps) {
  const id = React.useId();
  const popupId = `${id}-tooltip`;
  const [localOpen, setOpen] = React.useState(defaultOpen);
  const open = controlledOpen ?? localOpen;
  const inactive = disabled || !hasContent(content);
  const child = children as React.ReactElement<ChildProps>;
  const wrap = !inactive && wrapDisabledTrigger && child.props.disabled === true;
  const triggerId = (!wrap && child.props.id) || `${id}-trigger`;
  const oldDescription = child.props["aria-describedby"];
  const description = [oldDescription, !inactive ? popupId : undefined]
    .filter(Boolean)
    .join(" ") || undefined;
  const triggerElement = wrap ? (
    <span
      className="mt-tooltip-disabled-trigger"
      role="group"
      tabIndex={0}
      aria-label={child.props["aria-label"] ?? (typeof child.props.children === "string" ? child.props.children : undefined)}
      aria-labelledby={child.props["aria-labelledby"]}
      aria-describedby={description}
    >
      {children}
    </span>
  ) : React.cloneElement(child, { "aria-describedby": description });

  const changeOpen = (next: boolean) => {
    if (open === next) return;
    if (controlledOpen === undefined) setOpen(next);
    onOpenChange?.(next);
  };
  const collisionAvoidance: Base.Positioner.Props["collisionAvoidance"] = !avoidCollisions
    ? { side: "none", align: "none", fallbackAxisSide: "none" }
    : shift === undefined
      ? undefined
      : { side: "flip", align: shift ? "shift" : "none" };
  const toneStyle = tone === "default" ? undefined : ({
    "--_mt-tooltip-bg": `color-mix(in srgb, var(--mt-accent-${tone}, #62605b) 18%, var(--mt-bg, white))`,
    "--_mt-tooltip-fg": "var(--mt-fg, #37352f)",
  } as React.CSSProperties);

  return (
    <Base.Root
      open={open}
      triggerId={triggerId}
      disabled={inactive}
      onOpenChange={(next, details) => {
        if ((details.reason === "trigger-hover" && trigger !== "hover") ||
          (details.reason === "trigger-focus" && trigger !== "hover" && trigger !== "focus")) {
          details.cancel();
          return;
        }
        changeOpen(next);
      }}
    >
      <Base.Trigger
        render={triggerElement}
        id={triggerId}
        aria-describedby={description}
        className={classNames?.trigger}
        style={styles?.trigger}
        disabled={inactive}
        delay={delay}
        closeDelay={closeDelay}
        closeOnClick={trigger === "hover" || trigger === "focus"}
        onClick={(event) => {
          if (!inactive && trigger === "click" && !event.defaultPrevented) changeOpen(!open);
        }}
        onContextMenu={(event) => {
          if (inactive || trigger !== "contextMenu" || event.defaultPrevented) return;
          event.preventDefault();
          changeOpen(true);
        }}
        onKeyDown={(event) => {
          if (inactive || event.defaultPrevented) return;
          if (trigger === "contextMenu" &&
            (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10"))) {
            event.preventDefault();
            changeOpen(true);
          } else if (trigger === "click" && wrap && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            changeOpen(!open);
          }
        }}
      />
      {!inactive && (
        <Base.Portal keepMounted={keepMounted} container={container}>
          <MtoneScope>
            <Base.Positioner
              className={cn("mt-positioner", classNames?.positioner)}
              style={{ ...(zIndex === undefined ? {} : { zIndex }), ...styles?.positioner }}
              side={side}
              align={align}
              sideOffset={offset}
              alignOffset={alignOffset}
              arrowPadding={arrowPadding}
              collisionAvoidance={collisionAvoidance}
            >
              <Base.Popup
                id={popupId}
                role="tooltip"
                data-tone={tone === "default" ? undefined : tone}
                className={cn("mt-tooltip", classNames?.popup)}
                data-mt-tooltip=""
                style={{ ...toneStyle, ...styles?.popup }}
              >
                {content}
                {arrow && (
                  <Base.Arrow className={cn("mt-tooltip-arrow", classNames?.arrow)} style={styles?.arrow}>
                    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                      <path d="M0 9L5 1L10 9Z" fill="currentColor" />
                    </svg>
                  </Base.Arrow>
                )}
              </Base.Popup>
            </Base.Positioner>
          </MtoneScope>
        </Base.Portal>
      )}
    </Base.Root>
  );
}

export function Tooltip(props: TooltipProps) {
  return React.useContext(SharedProviderContext)
    ? <TooltipInstance {...props} />
    : <Base.Provider><TooltipInstance {...props} /></Base.Provider>;
}

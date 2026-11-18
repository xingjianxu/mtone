import React from "react";
import { PreviewCard } from "@base-ui/react/preview-card";
import { MtoneScope } from "./basic";
import { FloatingOwnerContext, isWithinFloatingOwner } from "./floating-owner";

export interface HoverCardProps {
  /** Use a focusable element; custom components must forward refs and props. */
  trigger: React.ReactElement;
  content: React.ReactNode;
  title?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  width?: React.CSSProperties["width"];
  withArrow?: boolean;
  disabled?: boolean;
}

/** Supplemental rich preview. Essential actions and forms belong in Popover. */
export function HoverCard({
  trigger,
  content,
  title,
  open,
  defaultOpen = false,
  onOpenChange,
  openDelay = 300,
  closeDelay = 150,
  side = "bottom",
  align = "center",
  sideOffset = 6,
  width = 280,
  withArrow = false,
  disabled = false,
}: HoverCardProps) {
  const owner = React.useId();
  const ancestors = React.useContext(FloatingOwnerContext);
  const owners = React.useMemo(() => [...ancestors, owner], [ancestors, owner]);
  const triggerRef = React.useRef<HTMLAnchorElement>(null);
  const blurTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  React.useEffect(
    () => () => clearTimeout(blurTimer.current),
    [disabled, open],
  );
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  React.useEffect(() => {
    if (disabled) setInternalOpen(false);
  }, [disabled]);
  const changeOpen = (next: boolean) => {
    if (disabled) return;
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };
  return (
    <FloatingOwnerContext.Provider value={owners}>
      <PreviewCard.Root
        open={!disabled && (open ?? internalOpen)}
        onOpenChange={(next, details) => {
          if (
            !next &&
            details.reason === "trigger-focus" &&
            isWithinFloatingOwner(
              triggerRef.current?.ownerDocument.activeElement ?? null,
              owner,
            )
          ) {
            details.cancel();
            return;
          }
          changeOpen(next);
        }}
      >
        <PreviewCard.Trigger
          ref={triggerRef}
          render={trigger}
          delay={openDelay}
          closeDelay={closeDelay}
        />
        <PreviewCard.Portal>
          <MtoneScope
            onBlurCapture={(event) => {
              const doc = event.currentTarget.ownerDocument;
              clearTimeout(blurTimer.current);
              blurTimer.current = setTimeout(() => {
                const active = doc.activeElement;
                if (
                  active !== triggerRef.current &&
                  !isWithinFloatingOwner(active, owner)
                )
                  changeOpen(false);
              }, 0);
            }}
          >
            <PreviewCard.Positioner
              className="mt-positioner"
              side={side}
              align={align}
              sideOffset={sideOffset}
            >
              <PreviewCard.Popup
                className="mt-popup mt-popover mt-hover-card"
                style={{ width }}
              >
                {withArrow && (
                  <PreviewCard.Arrow className="mt-hover-card-arrow">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      aria-hidden="true"
                    >
                      <path d="M0 7 6 1 12 7" />
                    </svg>
                  </PreviewCard.Arrow>
                )}
                <div className="mt-hover-card-content">
                  {title && <div className="mt-popup-title">{title}</div>}
                  {content}
                </div>
              </PreviewCard.Popup>
            </PreviewCard.Positioner>
          </MtoneScope>
        </PreviewCard.Portal>
      </PreviewCard.Root>
    </FloatingOwnerContext.Provider>
  );
}

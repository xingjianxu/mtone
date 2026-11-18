import React from "react";
import { PreviewCard } from "@base-ui/react/preview-card";
import { MtoneScope } from "./basic";

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
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  React.useEffect(() => {
    if (disabled) setInternalOpen(false);
  }, [disabled]);
  return (
    <PreviewCard.Root
      open={!disabled && (open ?? internalOpen)}
      onOpenChange={(next) => {
        if (disabled) return;
        if (open === undefined) setInternalOpen(next);
        onOpenChange?.(next);
      }}
    >
      <PreviewCard.Trigger
        render={trigger}
        delay={openDelay}
        closeDelay={closeDelay}
      />
      <PreviewCard.Portal>
        <MtoneScope>
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
                <PreviewCard.Arrow className="mt-hover-card-arrow" />
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
  );
}

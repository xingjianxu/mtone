import * as React from "react";
import { createPortal } from "react-dom";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import { Button, Menu, type MenuEntry } from "@bixlab/mtone";

export function EditorToolbarMenu({
  surface,
  label,
  trigger,
  items,
  open,
  setOpen,
  onEscape,
  colorMenu,
}: {
  surface: React.RefObject<HTMLDivElement | null>;
  label: string;
  trigger: React.ComponentProps<typeof Button>;
  items: MenuEntry[];
  open: boolean;
  setOpen: (open: boolean) => void;
  onEscape: () => void;
  colorMenu?: boolean;
}) {
  const menuId = React.useId();
  const focusOnOpen = React.useRef(false);
  const { context, refs, elements, floatingStyles } = useFloating({
    open,
    onOpenChange: (next, _event, reason) => {
      setOpen(next);
      if (reason === "escape-key") onEscape();
    },
    placement: "bottom-end",
    strategy: "fixed",
    middleware: [
      offset(6),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply: ({ availableHeight, elements }) => {
          elements.floating.style.maxHeight = `${Math.max(0, availableHeight)}px`;
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });
  const dismiss = useDismiss(context, {
    bubbles: { escapeKey: false, outsidePress: false },
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);
  React.useLayoutEffect(() => {
    if (open && elements.floating && focusOnOpen.current) {
      elements.floating.querySelector<HTMLElement>('[role="menu"]')?.focus();
      focusOnOpen.current = false;
    }
  }, [open, elements.floating]);
  const toggle = (keyboard: boolean) => {
    focusOnOpen.current = keyboard && !open;
    setOpen(!open);
  };
  return (
    <>
      <Button
        ref={refs.setReference}
        type="button"
        size="small"
        variant="ghost"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        {...trigger}
        {...getReferenceProps({
          onMouseDown: (event) => event.preventDefault(),
          onClick: (event) => toggle(event.detail === 0),
          onKeyDown: (event) => {
            if (event.key !== "ArrowDown" || open) return;
            event.preventDefault();
            toggle(true);
          },
        })}
      />
      {/* Escape clipping by the scrolling control row, but stay in the
          editor's toolbar DOM so focus never leaves its UI. */}
      {open &&
        surface.current &&
        createPortal(
          <div
            ref={refs.setFloating}
            id={menuId}
            style={floatingStyles}
            className={
              colorMenu
                ? "mt-block-editor-toolbar-menu mt-block-editor-color-panel"
                : "mt-block-editor-toolbar-menu"
            }
            {...getFloatingProps({
              onMouseDown: (event) => {
                if ((event.target as Element).closest('[role^="menuitem"]'))
                  event.preventDefault();
              },
            })}
          >
            <Menu items={items} label={label} onSelect={() => setOpen(false)} />
          </div>,
          surface.current,
        )}
    </>
  );
}

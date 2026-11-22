import { useFieldsetDisabled } from "./fieldset-context";
import React, { useId, useState } from "react";
import { Check, ChevronDown, ChevronRight, Minus, X } from "lucide-react";
import { Checkbox as BCheckbox } from "@base-ui/react/checkbox";
import { Switch as BSwitch } from "@base-ui/react/switch";
import { Radio as BRadio } from "@base-ui/react/radio";
import { RadioGroup as BRadioGroup } from "@base-ui/react/radio-group";
import { Slider as BSlider } from "@base-ui/react/slider";
import { NumberField } from "@base-ui/react/number-field";
import { Menubar as BMenubar } from "@base-ui/react/menubar";
import { Menu as BMenu } from "@base-ui/react/menu";
import { useDirection } from "@base-ui/react/direction-provider";
import { ContextMenu as BContextMenu } from "@base-ui/react/context-menu";
import { Popover as BPopover } from "@base-ui/react/popover";
import { Tooltip as BTooltip } from "@base-ui/react/tooltip";
import { Dialog as BDialog } from "@base-ui/react/dialog";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Drawer as BDrawer } from "@base-ui/react/drawer";
import { Button, MtoneScope, useMtone, cn } from "./basic";
import { runConfirmTransaction } from "./confirm-transaction";
import {
  MenuSurfaceOwnerContext,
  FloatingSurface,
  type FloatingLayoutProps,
} from "./floating-surface";

export interface Option {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}
interface Common {
  className?: string;
  disabled?: boolean;
  name?: string;
  label?: string;
}
interface ValueProps<T> {
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
}
export interface OpenProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export interface CheckboxProps extends Common {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  indeterminate?: boolean;
  children?: React.ReactNode;
}
export function Checkbox({
  label,
  children,
  className,
  ...props
}: CheckboxProps) {
  props = { ...props, disabled: useFieldsetDisabled(props.disabled) };
  return (
    <label className={cn("mt-check-label", className)}>
      <BCheckbox.Root className="mt-checkbox" {...props}>
        <BCheckbox.Indicator className="mt-check-indicator" aria-hidden="true">
          {props.indeterminate ? (
            <Minus size={12} strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <Check size={12} strokeWidth={1.5} aria-hidden="true" />
          )}
        </BCheckbox.Indicator>
      </BCheckbox.Root>
      {label ?? children}
    </label>
  );
}
export function Switch({
  label,
  children,
  className,
  ...props
}: Omit<CheckboxProps, "indeterminate">) {
  props = { ...props, disabled: useFieldsetDisabled(props.disabled) };
  return (
    <label className={cn("mt-check-label", className)}>
      <BSwitch.Root className="mt-switch" {...props}>
        <BSwitch.Thumb className="mt-switch-thumb" />
      </BSwitch.Root>
      {label ?? children}
    </label>
  );
}
export interface RadioGroupProps extends Common, ValueProps<string> {
  options: Option[];
  /** Visual treatment; both modes use the same radio semantics and form behavior. */
  variant?: "default" | "segmented";
  /** Defaults to vertical for standard radios and horizontal for segments. */
  orientation?: "horizontal" | "vertical";
}
export function RadioGroup({
  options,
  label,
  className,
  variant = "default",
  orientation = variant === "segmented" ? "horizontal" : "vertical",
  ...props
}: RadioGroupProps) {
  props = { ...props, disabled: useFieldsetDisabled(props.disabled) };
  const segmented = variant === "segmented";
  return (
    <BRadioGroup
      aria-label={label}
      className={cn(segmented ? "mt-segmented" : "mt-radio-group", `mt-${orientation}`, className)}
      {...props}
    >
      {options.map((option) => {
        const radio = (
          <BRadio.Root
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className={segmented ? "mt-segment" : "mt-radio"}
          >
            {segmented ? option.label : <BRadio.Indicator className="mt-radio-indicator" />}
          </BRadio.Root>
        );
        return segmented ? radio : (
          <label className="mt-check-label" key={option.value}>
            {radio}
            {option.label}
          </label>
        );
      })}
    </BRadioGroup>
  );
}
export { Select } from "./select";
export type { SelectProps, SelectSingleProps, SelectPopupSearchProps, SelectMultipleProps, SelectTagsProps, SelectOption, SelectOptionGroup } from "./select";

export interface SliderProps extends Common, ValueProps<number> {
  min?: number;
  max?: number;
  step?: number;
}
export function Slider({ label, className, ...props }: SliderProps) {
  props = { ...props, disabled: useFieldsetDisabled(props.disabled) };
  return (
    <BSlider.Root className={cn("mt-slider", className)} {...props}>
      <BSlider.Control className="mt-slider-control">
        <BSlider.Track className="mt-slider-track">
          <BSlider.Indicator className="mt-slider-indicator" />
          <BSlider.Thumb className="mt-slider-thumb" aria-label={label} />
        </BSlider.Track>
      </BSlider.Control>
    </BSlider.Root>
  );
}
export interface NumberInputProps
  extends Common, Omit<ValueProps<number | null>, "defaultValue"> {
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
}
export function NumberInput({ label, className, ...props }: NumberInputProps) {
  props = { ...props, disabled: useFieldsetDisabled(props.disabled) };
  const { locale } = useMtone();
  return (
    <NumberField.Root className={cn("mt-number", className)} {...props}>
      <NumberField.Group className="mt-number-group">
        <NumberField.Decrement
          aria-label={locale === "zh" ? "减少" : "Decrease"}
          className="mt-number-step"
        >
          −
        </NumberField.Decrement>
        <NumberField.Input className="mt-number-input" aria-label={label} />
        <NumberField.Increment
          aria-label={locale === "zh" ? "增加" : "Increase"}
          className="mt-number-step"
        >
          +
        </NumberField.Increment>
      </NumberField.Group>
    </NumberField.Root>
  );
}
export { Tabs } from "./tabs";
export type { TabItem, TabsProps, TabsIndicatorColor } from "./tabs";
export interface MenuItem {
  type?: "item";
  icon?: React.ReactNode;
  key: string;
  label: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  shortcut?: string;
  onSelect?: () => void;
  /** Nonempty children open a submenu; parent callbacks are not invoked. */
  children?: MenuEntry[];
}
export interface MenuGroup {
  type: "group";
  key: string;
  label: React.ReactNode;
  children: MenuEntry[];
}
export interface MenuDivider {
  type: "divider";
  key: string;
}
export interface MenuCheckboxItem extends Omit<
  MenuItem,
  "type" | "children" | "onSelect"
> {
  type: "checkbox";
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  closeOnClick?: boolean;
}
export interface MenuRadioGroup {
  type: "radio-group";
  key: string;
  label: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: Omit<MenuItem, "type" | "children" | "onSelect">[];
}
export type MenuEntry =
  MenuItem | MenuGroup | MenuDivider | MenuCheckboxItem | MenuRadioGroup;
export interface MenuProps {
  items: MenuEntry[];
  onSelect?: (key: string) => void;
  /** Accessible name for an inline menu. */
  label?: string;
  className?: string;
}
export interface PopoverMenuProps
  extends OpenProps, FloatingLayoutProps, Omit<MenuProps, "className"> {
  trigger: string | React.ReactElement;
  /** Whether a mouse hover can open the menu in addition to normal presses. */
  triggerMode?: "click" | "hover";
}
const InlineMenuContext = React.createContext(false);

function MenuItemLabel({ item }: { item: Pick<MenuItem, "label" | "icon"> }) {
  return (
    <span className="mt-menu-label">
      <span aria-hidden="true" className="mt-menu-icon">
        {item.icon}
      </span>
      <span className="mt-menu-text">{item.label}</span>
    </span>
  );
}
type InlineRowProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className: string;
};
function InlineMenuButton({ className, ...props }: InlineRowProps) {
  return (
    <button
      {...props}
      type="button"
      role={props.role ?? "menuitem"}
      tabIndex={-1}
      data-disabled={props.disabled ? "" : undefined}
      className={cn(className, "mt-inline-menu-item")}
    />
  );
}
function InlineMenuGroup({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={id} className="mt-menu-group">
      <div className="mt-menu-group-label" id={id}>
        {label}
      </div>
      {children}
    </div>
  );
}
function InlineMenuCheckbox({
  item,
  className,
}: {
  item: MenuCheckboxItem;
  className: string;
}) {
  const [local, setLocal] = useState(item.defaultChecked ?? false);
  const checked = item.checked ?? local;
  return (
    <InlineMenuButton
      className={className}
      role="menuitemcheckbox"
      aria-checked={checked}
      disabled={item.disabled}
      onClick={() => {
        if (item.checked === undefined) setLocal(!checked);
        item.onCheckedChange?.(!checked);
      }}
    >
      <MenuItemLabel item={item} />
      {item.shortcut && <span className="mt-shortcut">{item.shortcut}</span>}
      {checked && <span aria-hidden="true">✓</span>}
    </InlineMenuButton>
  );
}
function InlineMenuRadioGroup({ item }: { item: MenuRadioGroup }) {
  const [local, setLocal] = useState(item.defaultValue);
  return (
    <InlineMenuGroup label={item.label}>
      {item.children.map((option) => {
        const checked = (item.value ?? local) === option.key;
        return (
          <InlineMenuButton
            key={option.key}
            className={cn("mt-menu-item", option.danger && "mt-danger")}
            role="menuitemradio"
            aria-checked={checked}
            disabled={option.disabled}
            onClick={() => {
              if (checked) return;
              if (item.value === undefined) setLocal(option.key);
              item.onValueChange?.(option.key);
            }}
          >
            <MenuItemLabel item={option} />
            {option.shortcut && (
              <span className="mt-shortcut">{option.shortcut}</span>
            )}
            {checked && <span aria-hidden="true">●</span>}
          </InlineMenuButton>
        );
      })}
    </InlineMenuGroup>
  );
}
const inlineMenuItemSelector =
  '[role="menuitem"]:not(:disabled, [data-disabled]), [role="menuitemcheckbox"]:not(:disabled, [data-disabled]), [role="menuitemradio"]:not(:disabled, [data-disabled])';

function InlineSubmenu({
  item,
  className,
  onSelect,
}: {
  item: MenuItem;
  className: string;
  onSelect?: MenuProps["onSelect"];
}) {
  const [open, setOpen] = useState(false);
  const direction = useDirection();
  const popup = React.useRef<HTMLDivElement>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const focusOnOpen = React.useRef(false);
  const restoreOnClose = React.useRef(false);
  const firstItem = () =>
    popup.current?.querySelector<HTMLElement>(inlineMenuItemSelector);
  return (
    <BMenu.Root
      open={open}
      modal={false}
      onOpenChange={(next, details) => {
        if (next) {
          const event = details.event;
          focusOnOpen.current =
            details.reason !== "trigger-hover" &&
            (event instanceof KeyboardEvent ||
              (event instanceof MouseEvent && event.detail === 0));
          restoreOnClose.current = false;
        } else {
          const focused = trigger.current?.ownerDocument.activeElement;
          restoreOnClose.current =
            (details.reason === "escape-key" || details.reason === "item-press") &&
            (focused === trigger.current || !!popup.current?.contains(focused ?? null));
        }
        setOpen(next);
      }}
    >
      <BMenu.Trigger
        ref={trigger}
        disabled={item.disabled}
        openOnHover
        render={({ onKeyDown: _triggerKeys, ...props }) => (
          <InlineMenuButton
            {...props}
            role="menuitem"
            className={className}
            onKeyDown={(event) => {
              if (
                event.key !== (direction === "rtl" ? "ArrowLeft" : "ArrowRight")
              )
                return;
              event.preventDefault();
              focusOnOpen.current = true;
              if (open) firstItem()?.focus();
              else setOpen(true);
            }}
          >
            <MenuItemLabel item={item} />
            <ChevronRight
              className="mt-menu-submenu-arrow"
              aria-hidden="true"
            />
          </InlineMenuButton>
        )}
      />
      <FloatingSurface
        kind="submenu"
        popupRef={popup}
        finalFocus={() => restoreOnClose.current ? trigger.current : false}
        onKeyDown={(event) => {
          if (
            event.key !== (direction === "rtl" ? "ArrowRight" : "ArrowLeft") ||
            !(event.target instanceof Element) ||
            event.target.closest('[role="menu"]') !== event.currentTarget
          )
            return;
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }}
        initialFocus={() =>
          focusOnOpen.current ? (firstItem() ?? true) : false
        }
      >
        <PopupMenuItems items={item.children ?? []} onSelect={onSelect} />
      </FloatingSurface>
    </BMenu.Root>
  );
}
function MenuItems({ items, onSelect }: Pick<MenuProps, "items" | "onSelect">) {
  const inline = React.useContext(InlineMenuContext);
  return (
    <>
      {items.map((item, index) => {
        if (item.type === "divider")
          return inline ? (
            <hr key={item.key} className="mt-menu-divider" />
          ) : (
            <BMenu.Separator key={item.key} className="mt-menu-divider" />
          );
        if (item.type === "group")
          return inline ? (
            <InlineMenuGroup key={item.key} label={item.label}>
              <MenuItems items={item.children} onSelect={onSelect} />
            </InlineMenuGroup>
          ) : (
            <BMenu.Group key={item.key} className="mt-menu-group">
              <BMenu.GroupLabel className="mt-menu-group-label">
                {item.label}
              </BMenu.GroupLabel>
              <MenuItems items={item.children} onSelect={onSelect} />
            </BMenu.Group>
          );
        if (item.type === "radio-group")
          return inline ? (
            <InlineMenuRadioGroup key={item.key} item={item} />
          ) : (
            <BMenu.Group key={item.key} className="mt-menu-group">
              <BMenu.GroupLabel className="mt-menu-group-label">
                {item.label}
              </BMenu.GroupLabel>
              <BMenu.RadioGroup
                value={item.value}
                defaultValue={item.defaultValue}
                onValueChange={(value) => item.onValueChange?.(value)}
              >
                {item.children.map((option) => (
                  <BMenu.RadioItem
                    key={option.key}
                    value={option.key}
                    disabled={option.disabled}
                    className={cn("mt-menu-item", option.danger && "mt-danger")}
                    closeOnClick={false}
                  >
                    <MenuItemLabel item={option} />
                    {option.shortcut && (
                      <span className="mt-shortcut">{option.shortcut}</span>
                    )}
                    <BMenu.RadioItemIndicator>●</BMenu.RadioItemIndicator>
                  </BMenu.RadioItem>
                ))}
              </BMenu.RadioGroup>
            </BMenu.Group>
          );
        // Submenu portals insert focus guards between DOM siblings. Determine
        // row spacing from entries, not that transient DOM adjacency.
        const previous = items[index - 1];
        const spaced =
          previous != null &&
          previous.type !== "divider" &&
          previous.type !== "group" &&
          previous.type !== "radio-group";
        const className = cn(
          "mt-menu-item",
          spaced && "mt-menu-item-spaced",
          item.danger && "mt-danger",
        );
        if (item.type === "checkbox")
          return inline ? (
            <InlineMenuCheckbox
              key={item.key}
              item={item}
              className={className}
            />
          ) : (
            <BMenu.CheckboxItem
              key={item.key}
              className={className}
              disabled={item.disabled}
              checked={item.checked}
              defaultChecked={item.defaultChecked}
              closeOnClick={item.closeOnClick ?? false}
              onCheckedChange={(checked) => item.onCheckedChange?.(checked)}
            >
              <MenuItemLabel item={item} />
              {item.shortcut && (
                <span className="mt-shortcut">{item.shortcut}</span>
              )}
              <BMenu.CheckboxItemIndicator>✓</BMenu.CheckboxItemIndicator>
            </BMenu.CheckboxItem>
          );
        if (item.children?.length)
          return inline ? (
            <InlineSubmenu
              key={item.key}
              item={item}
              className={className}
              onSelect={onSelect}
            />
          ) : (
            <BMenu.SubmenuRoot key={item.key}>
              <BMenu.SubmenuTrigger
                className={className}
                disabled={item.disabled}
              >
                <MenuItemLabel item={item} />
                <ChevronRight
                  aria-hidden="true"
                  className="mt-menu-submenu-arrow"
                />
              </BMenu.SubmenuTrigger>
              <FloatingSurface kind="submenu">
                <MenuItems items={item.children} onSelect={onSelect} />
              </FloatingSurface>
            </BMenu.SubmenuRoot>
          );
        const select = () => {
          item.onSelect?.();
          onSelect?.(item.key);
        };
        return inline ? (
          <InlineMenuButton
            key={item.key}
            className={className}
            disabled={item.disabled}
            onClick={select}
          >
            <MenuItemLabel item={item} />
            {item.shortcut && (
              <span className="mt-shortcut">{item.shortcut}</span>
            )}
          </InlineMenuButton>
        ) : (
          <BMenu.Item
            key={item.key}
            className={className}
            disabled={item.disabled}
            onClick={select}
          >
            <MenuItemLabel item={item} />
            {item.shortcut && (
              <span className="mt-shortcut">{item.shortcut}</span>
            )}
          </BMenu.Item>
        );
      })}
    </>
  );
}
/** Commands in normal document flow, without a trigger or a floating surface. */
export function Menu({ items, onSelect, label, className }: MenuProps) {
  const { locale } = useMtone();
  const [itemFocused, setItemFocused] = useState(false);
  const root = React.useRef<HTMLDivElement>(null);
  const typed = React.useRef({ text: "", time: 0 });
  React.useLayoutEffect(() => {
    const menu = root.current;
    if (menu && !menu.contains(menu.ownerDocument.activeElement))
      setItemFocused(false);
  }, [items]);
  return (
    <div
      ref={root}
      role="menu"
      aria-label={label ?? (locale === "zh" ? "菜单" : "Menu")}
      tabIndex={itemFocused ? -1 : 0}
      className={cn("mt-inline-menu", className)}
      onFocus={(event) => {
        if (event.currentTarget.contains(event.target))
          setItemFocused(event.target !== event.currentTarget);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setItemFocused(false);
      }}
      onKeyDown={(event) => {
        const menu = event.currentTarget;
        if (
          event.defaultPrevented ||
          !(event.target instanceof Element) ||
          event.target.closest('[role="menu"]') !== menu
        )
          return;
        const rows = Array.from(
          menu.querySelectorAll<HTMLElement>(inlineMenuItemSelector),
        ).filter((row) => row.closest('[role="menu"]') === menu);
        if (!rows.length) return;
        const index = rows.findIndex((row) => row === event.target);
        let next: HTMLElement | undefined;
        if (event.key === "ArrowDown") next = rows[(index + 1) % rows.length];
        else if (event.key === "ArrowUp")
          next = rows[index <= 0 ? rows.length - 1 : index - 1];
        else if (event.key === "Home") next = rows[0];
        else if (event.key === "End") next = rows[rows.length - 1];
        else if (
          event.key.length === 1 &&
          event.key !== " " &&
          !event.ctrlKey &&
          !event.altKey &&
          !event.metaKey &&
          !event.nativeEvent.isComposing
        ) {
          const time = Date.now();
          const key = event.key.toLocaleLowerCase();
          const text =
            time - typed.current.time < 500 ? typed.current.text + key : key;
          typed.current = { text, time };
          const repeated = [...text].every((letter) => letter === key);
          const query = repeated ? key : text;
          const start = repeated ? index + 1 : Math.max(0, index);
          for (let offset = 0; offset < rows.length; offset++) {
            const row = rows[(start + offset) % rows.length];
            if (
              row
                .querySelector(".mt-menu-text")
                ?.textContent?.trim()
                .toLocaleLowerCase()
                .startsWith(query)
            ) {
              next = row;
              break;
            }
          }
        }
        if (next) {
          event.preventDefault();
          next.focus();
        }
      }}
    >
      <InlineMenuContext.Provider value={true}>
        <MenuItems items={items} onSelect={onSelect} />
      </InlineMenuContext.Provider>
    </div>
  );
}
function PopupMenuItems(props: Pick<MenuProps, "items" | "onSelect">) {
  return (
    <InlineMenuContext.Provider value={false}>
      <MenuItems {...props} />
    </InlineMenuContext.Provider>
  );
}

function PopoverMenu({
  trigger,
  triggerMode = "click",
  items,
  onOpenChange,
  onSelect,
  width,
  align,
  label,
  ...props
}: PopoverMenuProps) {
  const hover = triggerMode === "hover";
  // Base UI normally focuses the popup; a mouse hover must not move focus.
  const [openedByHover, setOpenedByHover] = useState(false);
  const triggerElement =
    typeof trigger === "string" ? (
      <Button preset="dropdown" style={{ width: "fit-content", maxWidth: "100%" }}>
        {trigger}
      </Button>
    ) : (
      trigger
    );
  const triggerProps = triggerElement.props as {
    disabled?: boolean;
    "aria-disabled"?: boolean | string;
  };
  const disabled = useFieldsetDisabled(triggerProps.disabled);
  const ariaDisabled =
    triggerProps["aria-disabled"] === true ||
    triggerProps["aria-disabled"] === "true";
  React.useEffect(() => {
    // A refused controlled intent must not affect a later programmatic open.
    if (openedByHover && (!hover || props.open === false)) setOpenedByHover(false);
  }, [hover, openedByHover, props.open]);
  const notifyOpenChange: BMenu.Root.Props["onOpenChange"] = onOpenChange;
  const handleHoverOpenChange: BMenu.Root.Props["onOpenChange"] = (next, details) => {
    if (
      next && (disabled || ariaDisabled ||
        details.trigger?.matches(':disabled, [aria-disabled="true"]'))
    ) {
      details.cancel();
      return;
    }
    notifyOpenChange?.(next, details);
    if (!details.isCanceled) {
      setOpenedByHover(next && details.reason === "trigger-hover");
    }
  };
  return (
    <BMenu.Root
      {...props}
      onOpenChange={hover ? handleHoverOpenChange : onOpenChange}
    >
      <BMenu.Trigger
        render={triggerElement}
        openOnHover={hover ? !ariaDisabled : undefined}
        disabled={hover ? disabled : undefined}
      />
      <FloatingSurface
        kind="menu"
        width={width}
        align={align}
        label={label}
        initialFocus={hover && openedByHover ? false : undefined}
      >
        <PopupMenuItems items={items} onSelect={onSelect} />
      </FloatingSurface>
    </BMenu.Root>
  );
}
/** A top-level application menu. Keys must be unique within the bar. */
export interface MenubarMenu extends FloatingLayoutProps {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  items: MenuEntry[];
}
export interface MenubarProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "children">,
    FloatingLayoutProps {
  menus: MenubarMenu[];
  openKey?: string | null;
  defaultOpenKey?: string | null;
  onOpenChange?: (key: string | null) => void;
  onSelect?: (itemKey: string, menuKey: string) => void;
  disabled?: boolean;
  loop?: boolean;
  trigger?: "click" | "hover";
}
/** Coordinated command menus, sharing Menu items and floating surfaces. */
export function Menubar({
  menus,
  openKey,
  defaultOpenKey = null,
  onOpenChange,
  onSelect,
  disabled = false,
  loop = true,
  trigger = "click",
  width,
  align,
  className,
  ...props
}: MenubarProps) {
  const ownerId = useId();
  const barRef = React.useRef<HTMLDivElement>(null);
  const [localKey, setLocalKey] = useState<string | null>(defaultOpenKey);
  const activeKey = openKey === undefined ? localKey : openKey;
  const activeRef = React.useRef(activeKey);
  activeRef.current = activeKey;
  const changeOpen = (key: string | null) => {
    if (openKey === undefined) {
      activeRef.current = key;
      setLocalKey(key);
    }
    onOpenChange?.(key);
  };
  React.useEffect(() => {
    if (trigger !== "hover" || activeKey === null) return;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;
    const cancelClose = () => {
      clearTimeout(closeTimer);
      closeTimer = undefined;
    };
    const onOver = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (
        barRef.current?.contains(target) ||
        target
          .closest("[data-menu-owner]")
          ?.getAttribute("data-menu-owner") === ownerId
      ) {
        cancelClose();
        return;
      }
      // Allow crossing the gap between trigger, popup, and nested popup.
      cancelClose();
      closeTimer = setTimeout(() => changeOpen(null), 180);
    };
    document.addEventListener("mouseover", onOver);
    return () => {
      cancelClose();
      document.removeEventListener("mouseover", onOver);
    };
  }, [trigger, activeKey, openKey, onOpenChange, ownerId]);
  return (
    <MenuSurfaceOwnerContext.Provider value={ownerId}>
      <BMenubar
        ref={barRef}
        {...props}
        className={cn("mt-menubar", className)}
        modal={false}
        disabled={disabled}
        loopFocus={loop}
      >
        {menus.map((menu) => (
          <BMenu.Root
            key={menu.key}
            open={!disabled && !menu.disabled && activeKey === menu.key}
            onOpenChange={(open, details) => {
              if (details.reason === "sibling-open") return;
              // A delayed trigger blur can run after keyboard focus has already
              // reached a portaled submenu. It still belongs to this active menu.
              const focused = barRef.current?.ownerDocument.activeElement;
              if (
                !open && details.reason === "trigger-focus" &&
                activeRef.current === menu.key &&
                focused?.closest("[data-menu-owner]")
                  ?.getAttribute("data-menu-owner") === ownerId
              ) {
                details.cancel();
                return;
              }
              if (open) changeOpen(menu.key);
              else if (activeRef.current === menu.key) changeOpen(null);
            }}
          >
            <BMenu.Trigger
              className="mt-menubar-trigger"
              disabled={disabled || menu.disabled}
              openOnHover={trigger === "hover" ? true : undefined}
              onMouseEnter={() => {
                if (
                  (trigger === "hover" || activeRef.current !== null) &&
                  !disabled &&
                  !menu.disabled
                )
                  changeOpen(menu.key);
              }}
            >
              {menu.icon && (
                <span aria-hidden="true" className="mt-menubar-icon">
                  {menu.icon}
                </span>
              )}
              {menu.label}
            </BMenu.Trigger>
            <FloatingSurface
              kind="menu"
              finalFocus={() => activeRef.current === null}
              width={menu.width ?? width}
              align={menu.align ?? align}
            >
              <PopupMenuItems
                items={menu.items}
                onSelect={(key) => onSelect?.(key, menu.key)}
              />
            </FloatingSurface>
          </BMenu.Root>
        ))}
      </BMenubar>
    </MenuSurfaceOwnerContext.Provider>
  );
}
export function ContextMenu({
  children,
  items,
  onSelect,
  width,
  label,
  ...props
}: OpenProps & Omit<MenuProps, "className"> & {
  children: React.ReactNode;
  width?: FloatingLayoutProps["width"];
}) {
  return (
    <BContextMenu.Root {...props}>
      <BContextMenu.Trigger>{children}</BContextMenu.Trigger>
      <FloatingSurface kind="context" width={width} label={label}>
        <PopupMenuItems items={items} onSelect={onSelect} />
      </FloatingSurface>
    </BContextMenu.Root>
  );
}
export interface PopoverProps
  extends OpenProps, Omit<FloatingLayoutProps, "align"> {
  trigger: string | React.ReactElement;
  content: React.ReactNode;
  title?: React.ReactNode;
  /** Accessible name. Overrides the visible title when supplied. */
  label?: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: FloatingLayoutProps["align"] | "center";
  /** Remove the Popup frame, padding and background, keeping positioning and focus. */
  unstyled?: boolean;
}
function PopoverFrame({
  trigger,
  content,
  title,
  label,
  side = "bottom",
  align = "center",
  width,
  unstyled,
  initialFocus,
  ...props
}: PopoverProps & { initialFocus?: BPopover.Popup.Props["initialFocus"] }) {
  const { locale } = useMtone();
  const hasTitle = title != null && title !== false && title !== "";
  const popupLabel =
    label ?? (hasTitle ? undefined : locale === "zh" ? "浮层内容" : "Popover content");
  const triggerElement =
    typeof trigger === "string" ? (
      <Button preset="dropdown" style={{ width: "fit-content", maxWidth: "100%" }}>
        {trigger}
      </Button>
    ) : trigger;
  return (
    <BPopover.Root {...props} modal={false}>
      <BPopover.Trigger render={triggerElement} />
      <FloatingSurface
        side={side}
        align={align}
        width={width}
        unstyled={unstyled}
        initialFocus={initialFocus}
        label={popupLabel}
      >
        {hasTitle && (label !== undefined ? (
          <h2 className="mt-popup-title">{title}</h2>
        ) : (
          <BPopover.Title className="mt-popup-title">{title}</BPopover.Title>
        ))}
        {content}
      </FloatingSurface>
    </BPopover.Root>
  );
}
function PopoverRoot(props: PopoverProps) {
  return <PopoverFrame {...props} />;
}

export const Popover = Object.assign(PopoverRoot, { Menu: PopoverMenu });

export function Tooltip({
  children,
  content,
  side = "top",
  ...props
}: OpenProps & Pick<PopoverProps, "content" | "side"> & { children: React.ReactElement }) {
  const id = useId();
  return (
    <BTooltip.Provider>
      <BTooltip.Root {...props}>
        <BTooltip.Trigger render={children} aria-describedby={id} />
        <BTooltip.Portal>
          <MtoneScope>
            <BTooltip.Positioner
              className="mt-positioner"
              sideOffset={6}
              side={side}
            >
              <BTooltip.Popup className="mt-tooltip" role="tooltip" id={id}>
                {content}
              </BTooltip.Popup>
            </BTooltip.Positioner>
          </MtoneScope>
        </BTooltip.Portal>
      </BTooltip.Root>
    </BTooltip.Provider>
  );
}
interface DialogFrameProps extends OpenProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  trigger?: React.ReactElement;
  className?: string;
}
export interface DialogProps extends DialogFrameProps {
  /** Whether outside clicks are blocked from dismissing the dialog. Does not change focus trapping, scroll locking, Escape, or the close button. @default true */
  modal?: boolean;
}
export function Dialog({
  modal = true,
  title,
  description,
  children,
  footer,
  trigger,
  className,
  ...props
}: DialogProps) {
  const { locale } = useMtone();
  const hasTitle =
    title !== null && title !== undefined && title !== false && title !== "";
  return (
    <BDialog.Root {...props} modal={true} disablePointerDismissal={modal}>
      {trigger && <BDialog.Trigger render={trigger} />}
      <BDialog.Portal>
        <MtoneScope>
          <BDialog.Backdrop className="mt-backdrop" />
          <BDialog.Popup
            className={cn("mt-modal", "mt-modal-dialog", className)}
          >
            <div className="mt-modal-header">
              <BDialog.Title
                className={cn(
                  "mt-dialog-title",
                  !hasTitle && "mt-modal-title-hidden",
                )}
              >
                {hasTitle ? title : locale === "zh" ? "对话框" : "Dialog"}
              </BDialog.Title>
              <BDialog.Close
                className="mt-dialog-close"
                aria-label={locale === "zh" ? "关闭" : "Close"}
              >
                <X size={18} aria-hidden="true" />
              </BDialog.Close>
            </div>
            {description && (
              <BDialog.Description className="mt-dialog-description">
                {description}
              </BDialog.Description>
            )}
            <div className="mt-dialog-body">{children}</div>
            {footer && <div className="mt-dialog-footer">{footer}</div>}
          </BDialog.Popup>
        </MtoneScope>
      </BDialog.Portal>
    </BDialog.Root>
  );
}

export interface ConfirmDialogProps extends DialogFrameProps {
  onConfirm?: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}
export function ConfirmDialog({
  title,
  description,
  children,
  trigger,
  confirmText,
  cancelText,
  onConfirm,
  danger,
  open,
  defaultOpen,
  onOpenChange,
}: ConfirmDialogProps) {
  const { locale } = useMtone();
  const [localOpen, setOpen] = useState(defaultOpen ?? false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const change = (v: boolean) => {
    setOpen(v);
    onOpenChange?.(v);
  };
  const confirm = () =>
    runConfirmTransaction({
      invoke: () => {
        setError(false);
        return onConfirm?.();
      },
      alwaysPending: true,
      onPending: () => setPending(true),
      onFinish: () => setPending(false),
      onResolve: () => change(false),
      onReject: () => setError(true),
    });
  return (
    <AlertDialog.Root open={open ?? localOpen} onOpenChange={change}>
      {trigger && <AlertDialog.Trigger render={trigger} />}
      <AlertDialog.Portal>
        <MtoneScope>
          <AlertDialog.Backdrop className="mt-backdrop" />
          <AlertDialog.Popup className="mt-modal">
            <AlertDialog.Title className="mt-dialog-title">
              {title}
            </AlertDialog.Title>
            {description && (
              <AlertDialog.Description className="mt-dialog-description">
                {description}
              </AlertDialog.Description>
            )}
            {children}
            {error && (
              <p role="alert">
                {locale === "zh"
                  ? "操作失败，请重试。"
                  : "Something went wrong. Please try again."}
              </p>
            )}
            <div className="mt-dialog-footer">
              <AlertDialog.Close className="mt-action" disabled={pending}>
                {cancelText ?? (locale === "zh" ? "取消" : "Cancel")}
              </AlertDialog.Close>
              <button
                className={cn(
                  "mt-action",
                  "mt-action-primary",
                  danger ? "mt-action-danger" : "",
                )}
                disabled={pending}
                onClick={confirm}
              >
                {pending
                  ? "…"
                  : (confirmText ?? (locale === "zh" ? "确认" : "Confirm"))}
              </button>
            </div>
          </AlertDialog.Popup>
        </MtoneScope>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
export function Drawer({
  title,
  description,
  children,
  footer,
  trigger,
  className,
  ...props
}: DialogFrameProps) {
  const { locale } = useMtone();
  return (
    <BDrawer.Root swipeDirection="right" {...props}>
      {trigger && <BDrawer.Trigger render={trigger} />}
      <BDrawer.Portal>
        <MtoneScope>
          <BDrawer.Backdrop className="mt-backdrop" />
          <BDrawer.Viewport className="mt-drawer-viewport">
            <BDrawer.Popup className={cn("mt-drawer", className)}>
              <BDrawer.Content>
                <BDrawer.Title className="mt-dialog-title">
                  {title}
                </BDrawer.Title>
                {description && (
                  <BDrawer.Description className="mt-dialog-description">
                    {description}
                  </BDrawer.Description>
                )}
                <BDrawer.Close
                  className="mt-dialog-close"
                  aria-label={locale === "zh" ? "关闭" : "Close"}
                >
                  ×
                </BDrawer.Close>
                <div className="mt-dialog-body">{children}</div>
                {footer && <div className="mt-dialog-footer">{footer}</div>}
              </BDrawer.Content>
            </BDrawer.Popup>
          </BDrawer.Viewport>
        </MtoneScope>
      </BDrawer.Portal>
    </BDrawer.Root>
  );
}
export { ToastProvider, useToast } from "./toast";
export type {
  ToastOptions,
  ToastUpdateOptions,
  ToastPromiseOptions,
  ToastPosition,
  ToastType,
  ToastProviderProps,
} from "./toast";

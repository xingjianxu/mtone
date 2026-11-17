import React, { useId, useState } from "react";
import { Check, ChevronDown, ChevronRight, Minus, X } from "lucide-react";
import { Checkbox as BCheckbox } from "@base-ui/react/checkbox";
import { Switch as BSwitch } from "@base-ui/react/switch";
import { Radio as BRadio } from "@base-ui/react/radio";
import { RadioGroup as BRadioGroup } from "@base-ui/react/radio-group";
import { Select as BSelect } from "@base-ui/react/select";
import { Combobox } from "@base-ui/react/combobox";
import { Slider as BSlider } from "@base-ui/react/slider";
import { NumberField } from "@base-ui/react/number-field";
import { Menubar as BMenubar } from "@base-ui/react/menubar";
import { Menu as BMenu } from "@base-ui/react/menu";
import { ContextMenu as BContextMenu } from "@base-ui/react/context-menu";
import { Popover as BPopover } from "@base-ui/react/popover";
import { Tooltip as BTooltip } from "@base-ui/react/tooltip";
import { Dialog as BDialog } from "@base-ui/react/dialog";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Drawer as BDrawer } from "@base-ui/react/drawer";
import { MtoneScope, useMtone, cn } from "./basic";
import {
  DropdownOwnerContext,
  DropdownSurface,
  type DropdownLayoutProps,
} from "./dropdown";

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
  orientation?: "horizontal" | "vertical";
}
export function RadioGroup({
  options,
  label,
  className,
  orientation = "vertical",
  ...props
}: RadioGroupProps) {
  return (
    <BRadioGroup
      aria-label={label}
      className={cn("mt-radio-group", `mt-${orientation}`, className)}
      {...props}
    >
      {options.map((o) => (
        <label className="mt-check-label" key={o.value}>
          <BRadio.Root
            value={o.value}
            disabled={o.disabled}
            className="mt-radio"
          >
            <BRadio.Indicator className="mt-radio-indicator" />
          </BRadio.Root>
          {o.label}
        </label>
      ))}
    </BRadioGroup>
  );
}
interface FieldControlProps {
  id?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
  "aria-busy"?: boolean;
  onBlur?: React.FocusEventHandler<HTMLElement>;
}
export interface SelectProps
  extends Common, ValueProps<string | null>, OpenProps, FieldControlProps {
  options: Option[];
  placeholder?: string;
}
export function Select({
  options,
  label,
  placeholder,
  className,
  id,
  onBlur,
  "aria-invalid": invalid,
  "aria-describedby": describedBy,
  "aria-labelledby": labelledBy,
  "aria-busy": busy,
  ...props
}: SelectProps) {
  const { locale } = useMtone();
  return (
    <BSelect.Root items={options} {...props}>
      <BSelect.Trigger
        id={id}
        onBlur={onBlur}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        aria-labelledby={labelledBy}
        aria-busy={busy}
        aria-label={label}
        className={cn("mt-select", className)}
      >
        <BSelect.Value
          className="mt-select-value"
          placeholder={placeholder ?? (locale === "zh" ? "请选择" : "Select…")}
        />
        <BSelect.Icon className="mt-select-icon">
          <ChevronDown size={16} aria-hidden="true" />
        </BSelect.Icon>
      </BSelect.Trigger>
      <BSelect.Portal>
        <MtoneScope>
          <BSelect.Positioner
            className="mt-positioner"
            sideOffset={4}
            alignItemWithTrigger={false}
          >
            <BSelect.Popup className="mt-popup">
              <BSelect.List>
                {options.map((o) => (
                  <BSelect.Item
                    className="mt-option"
                    key={o.value}
                    value={o.value}
                    disabled={o.disabled}
                  >
                    <BSelect.ItemText>{o.label}</BSelect.ItemText>
                    <BSelect.ItemIndicator
                      className="mt-select-item-indicator"
                      aria-hidden="true"
                    >
                      <Check size={16} strokeWidth={1.5} aria-hidden="true" />
                    </BSelect.ItemIndicator>
                  </BSelect.Item>
                ))}
              </BSelect.List>
            </BSelect.Popup>
          </BSelect.Positioner>
        </MtoneScope>
      </BSelect.Portal>
    </BSelect.Root>
  );
}
Select.formValueType = "nullable" as const;

export interface MultiSelectProps
  extends Common, ValueProps<string[]>, OpenProps, FieldControlProps {
  options: Option[];
  placeholder?: string;
}
export function MultiSelect({
  options,
  label,
  placeholder,
  className,
  id,
  onBlur,
  "aria-invalid": invalid,
  "aria-describedby": describedBy,
  "aria-labelledby": labelledBy,
  "aria-busy": busy,
  ...props
}: MultiSelectProps) {
  const { locale } = useMtone();
  const values = options.map((o) => o.value);
  const labelFor = (v: string) =>
    String(options.find((o) => o.value === v)?.label ?? v);
  return (
    <Combobox.Root
      multiple
      items={values}
      itemToStringLabel={labelFor}
      {...props}
    >
      <Combobox.Chips
        aria-invalid={invalid}
        className={cn("mt-multiselect", className)}
      >
        <Combobox.Value>
          {(selected: string[]) => (
            <>
              {selected.map((v) => (
                <Combobox.Chip className="mt-chip" key={v}>
                  {labelFor(v)}
                  <Combobox.ChipRemove
                    aria-label={`${locale === "zh" ? "移除" : "Remove"} ${labelFor(v)}`}
                    className="mt-chip-remove"
                  >
                    ×
                  </Combobox.ChipRemove>
                </Combobox.Chip>
              ))}
            </>
          )}
        </Combobox.Value>
        <Combobox.Input
          id={id}
          onBlur={onBlur}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          aria-labelledby={labelledBy}
          aria-busy={busy}
          aria-label={label}
          placeholder={placeholder ?? (locale === "zh" ? "搜索…" : "Search…")}
          className="mt-combobox-input"
        />
        <Combobox.Trigger
          className="mt-combobox-trigger"
          aria-label={locale === "zh" ? "展开选项" : "Show options"}
        >
          <ChevronDown size={16} aria-hidden="true" />
        </Combobox.Trigger>
      </Combobox.Chips>
      <Combobox.Portal>
        <MtoneScope>
          <Combobox.Positioner className="mt-positioner" sideOffset={4}>
            <Combobox.Popup className="mt-popup">
              <Combobox.Empty className="mt-combobox-empty">
                {locale === "zh" ? "无匹配结果" : "No results"}
              </Combobox.Empty>
              <Combobox.List>
                {(v: string) => (
                  <Combobox.Item
                    className="mt-option"
                    key={v}
                    value={v}
                    disabled={options.find((o) => o.value === v)?.disabled}
                  >
                    {labelFor(v)}
                    <Combobox.ItemIndicator
                      className="mt-select-item-indicator"
                      aria-hidden="true"
                    >
                      <Check size={16} strokeWidth={1.5} aria-hidden="true" />
                    </Combobox.ItemIndicator>
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </MtoneScope>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
MultiSelect.formValueType = "array" as const;

export interface SliderProps extends Common, ValueProps<number> {
  min?: number;
  max?: number;
  step?: number;
}
export function Slider({ label, className, ...props }: SliderProps) {
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
export type { TabItem, TabsProps } from "./tabs";
export function Segmented({
  options,
  label,
  className,
  ...props
}: RadioGroupProps) {
  return (
    <BRadioGroup
      className={cn("mt-segmented", className)}
      aria-label={label}
      {...props}
    >
      {options.map((o) => (
        <BRadio.Root
          key={o.value}
          value={o.value}
          disabled={o.disabled}
          className="mt-segment"
        >
          {o.label}
        </BRadio.Root>
      ))}
    </BRadioGroup>
  );
}
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
export interface MenuProps extends OpenProps, DropdownLayoutProps {
  trigger: React.ReactElement;
  items: MenuEntry[];
  onSelect?: (key: string) => void;
}
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
function MenuItems({ items, onSelect }: Pick<MenuProps, "items" | "onSelect">) {
  return (
    <>
      {items.map((item) => {
        if (item.type === "divider")
          return <BMenu.Separator key={item.key} className="mt-menu-divider" />;
        if (item.type === "group")
          return (
            <BMenu.Group key={item.key} className="mt-menu-group">
              <BMenu.GroupLabel className="mt-menu-group-label">
                {item.label}
              </BMenu.GroupLabel>
              <MenuItems items={item.children} onSelect={onSelect} />
            </BMenu.Group>
          );
        if (item.type === "radio-group")
          return (
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
        const className = cn("mt-menu-item", item.danger && "mt-danger");
        if (item.type === "checkbox")
          return (
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
          return (
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
              <DropdownSurface kind="submenu">
                <MenuItems items={item.children} onSelect={onSelect} />
              </DropdownSurface>
            </BMenu.SubmenuRoot>
          );
        return (
          <BMenu.Item
            key={item.key}
            className={className}
            disabled={item.disabled}
            onClick={() => {
              item.onSelect?.();
              onSelect?.(item.key);
            }}
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
export function Menu({
  trigger,
  items,
  onSelect,
  width,
  align,
  ...props
}: MenuProps) {
  return (
    <BMenu.Root {...props}>
      <BMenu.Trigger render={trigger} />
      <DropdownSurface kind="menu" width={width} align={align}>
        <MenuItems items={items} onSelect={onSelect} />
      </DropdownSurface>
    </BMenu.Root>
  );
}
/** A top-level application menu. Keys must be unique within the bar. */
export interface MenubarMenu extends DropdownLayoutProps {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  items: MenuEntry[];
}
export interface MenubarProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "children">,
    DropdownLayoutProps {
  menus: MenubarMenu[];
  openKey?: string | null;
  defaultOpenKey?: string | null;
  onOpenChange?: (key: string | null) => void;
  onSelect?: (itemKey: string, menuKey: string) => void;
  disabled?: boolean;
  loop?: boolean;
  trigger?: "click" | "hover";
}
/** Coordinated command menus, sharing Menu items and Dropdown surfaces. */
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
          .closest("[data-dropdown-owner]")
          ?.getAttribute("data-dropdown-owner") === ownerId
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
    <DropdownOwnerContext.Provider value={ownerId}>
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
            <DropdownSurface
              kind="menu"
              finalFocus={() => activeRef.current === null}
              width={menu.width ?? width}
              align={menu.align ?? align}
            >
              <MenuItems
                items={menu.items}
                onSelect={(key) => onSelect?.(key, menu.key)}
              />
            </DropdownSurface>
          </BMenu.Root>
        ))}
      </BMenubar>
    </DropdownOwnerContext.Provider>
  );
}
/** @deprecated Use MenuProps instead. */
export type DropdownMenuProps = MenuProps;
/** @deprecated Use Menu instead. */
export const DropdownMenu = Menu;
export function ContextMenu({
  children,
  items,
  onSelect,
  width,
  ...props
}: Omit<MenuProps, "trigger" | "align"> & { children: React.ReactNode }) {
  return (
    <BContextMenu.Root {...props}>
      <BContextMenu.Trigger>{children}</BContextMenu.Trigger>
      <DropdownSurface kind="context" width={width}>
        <MenuItems items={items} onSelect={onSelect} />
      </DropdownSurface>
    </BContextMenu.Root>
  );
}
export interface PopoverProps extends OpenProps {
  trigger: React.ReactElement;
  content: React.ReactNode;
  title?: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}
export function Popover({
  trigger,
  content,
  title,
  side = "bottom",
  ...props
}: PopoverProps) {
  return (
    <BPopover.Root {...props}>
      <BPopover.Trigger render={trigger} />
      <BPopover.Portal>
        <MtoneScope>
          <BPopover.Positioner
            className="mt-positioner"
            sideOffset={6}
            side={side}
          >
            <BPopover.Popup className="mt-popup mt-popover">
              {title && (
                <BPopover.Title className="mt-popup-title">
                  {title}
                </BPopover.Title>
              )}
              {content}
            </BPopover.Popup>
          </BPopover.Positioner>
        </MtoneScope>
      </BPopover.Portal>
    </BPopover.Root>
  );
}
export function Tooltip({
  children,
  content,
  side = "top",
  ...props
}: Omit<PopoverProps, "trigger" | "title"> & { children: React.ReactElement }) {
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
/** @deprecated Use DialogProps instead. */
export type ModalProps = DialogProps;
/** @deprecated Use Dialog instead. */
export const Modal = Dialog;

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
  const confirm = async () => {
    setPending(true);
    setError(false);
    try {
      await onConfirm?.();
      change(false);
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  };
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
export { Toast, ToastProvider, useToast } from "./toast";
export type {
  ToastOptions,
  ToastUpdateOptions,
  ToastPromiseOptions,
  ToastPosition,
  ToastType,
  ToastProviderProps,
} from "./toast";

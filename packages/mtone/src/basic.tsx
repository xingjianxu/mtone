import { List, ListItem } from "./list";
import { useFieldsetDisabled } from "./fieldset-context";
import { FloatingOwnerContext } from "./floating-owner";
import { Card } from "./card";
import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import {
  LoaderCircle,
  Pin,
  Star,
  X,
  FileText,
  Inbox,
  Info,
  CheckCircle,
  TriangleAlert,
  AlertCircle,
} from "lucide-react";
export const cn = (...v: (string | false | null | undefined)[]) =>
  v.filter(Boolean).join(" ");
export type Locale = "zh" | "en";
export type Tokens = React.CSSProperties &
  Record<`--mt-${string}`, string | number>;
export type MtoneTheme = "light" | "dark" | "system";
type Context = {
  theme: MtoneTheme;
  locale: Locale;
  tokens?: Tokens;
};
const MtoneContext = React.createContext<Context>({
  locale: "zh",
  theme: "light",
});
export const useMtone = () => React.useContext(MtoneContext);
export interface MtoneScopeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Inherits the surrounding mtone theme when omitted. */
  theme?: MtoneTheme;
}
export function MtoneScope({
  children,
  className,
  style,
  theme,
  ...props
}: MtoneScopeProps) {
  const inherited = useMtone();
  const c = React.useMemo(
    () =>
      theme && theme !== inherited.theme ? { ...inherited, theme } : inherited,
    [inherited, theme],
  );
  const floatingOwners = React.useContext(FloatingOwnerContext);
  return (
    <div
      {...props}
      className={cn("mt-scope", className)}
      data-mt-theme={c.theme}
      data-mt-floating-owners={
        floatingOwners.length ? floatingOwners.join(" ") : undefined
      }
      style={{ ...c.tokens, ...style }}
    >
      <MtoneContext.Provider value={c}>{children}</MtoneContext.Provider>
    </div>
  );
}
export type MtoneProviderProps = Partial<Context> & {
  children: React.ReactNode;
};

export function MtoneProvider({
  children,
  locale = "zh",
  tokens,
  theme,
}: MtoneProviderProps) {
  const inherited = useMtone();
  const resolvedTheme = theme ?? inherited.theme;
  const value = React.useMemo(
    () => ({ locale, tokens, theme: resolvedTheme }),
    [locale, tokens, resolvedTheme],
  );
  return (
    <MtoneContext.Provider value={value}>
      <MtoneScope>{children}</MtoneScope>
    </MtoneContext.Provider>
  );
}
/** Visual treatment of an opt-in pressed Button. */
export type ButtonToggleOptions =
  | { mode: "background" }
  | { mode: "icon"; preset: "star" | "pin"; offIcon?: never; onIcon?: never }
  | {
      mode: "icon";
      preset?: never;
      offIcon: React.ReactNode;
      onIcon: React.ReactNode;
    };

export type ButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseButton>,
  "className"
> & {
  className?: string;
  variant?: "blue" | "solid" | "outline" | "soft" | "ghost";
  size?: "sm" | "md" | "lg";
  /** Square icon-only mode. Provide aria-label or aria-labelledby for its accessible name. */
  iconOnly?: boolean;
  danger?: boolean;
  loading?: boolean;
  /** Opt into a persistent pressed state. True uses background mode. */
  toggle?: boolean | ButtonToggleOptions;
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  icon?: React.ReactNode;
  /** Content before the label (inline start). When omitted, icon is used. */
  leftSection?: React.ReactNode;
  /** Content after the label (inline end), including while loading. */
  rightSection?: React.ReactNode;
};

function hasButtonSection(section: React.ReactNode) {
  return section != null && typeof section !== "boolean" && section !== "";
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "outline",
      size = "md",
      iconOnly,
      danger,
      loading,
      toggle,
      pressed,
      defaultPressed = false,
      onPressedChange,
      onClick,
      icon,
      leftSection,
      rightSection,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) {
    const [localPressed, setLocalPressed] = React.useState(defaultPressed);
    const isPressed = pressed ?? localPressed;
    const effectiveDisabled = useFieldsetDisabled(disabled) || loading;
    const mode = toggle === true ? "background" : toggle ? toggle.mode : undefined;
    const iconToggle =
      toggle && typeof toggle === "object" && toggle.mode === "icon"
        ? toggle
        : undefined;
    const Preset =
      iconToggle?.preset === "star"
        ? Star
        : iconToggle?.preset === "pin"
          ? Pin
          : undefined;
    const leading = loading ? (
      <LoaderCircle className="mt-spin" size={14} aria-hidden="true" />
    ) : iconToggle ? (
      Preset ? (
        <Preset size={14} fill={isPressed ? "currentColor" : "none"} />
      ) : isPressed ? (
        iconToggle.onIcon
      ) : (
        iconToggle.offIcon
      )
    ) : leftSection === undefined ? (
      icon
    ) : (
      leftSection
    );
    return (
      <BaseButton
        {...props}
        ref={ref}
        disabled={effectiveDisabled}
        aria-busy={loading || undefined}
        {...(mode ? { "aria-pressed": isPressed, "data-toggle-mode": mode } : {})}
        onClick={
          mode
            ? (event) => {
                if (effectiveDisabled) return;
                onClick?.(event);
                if (event.defaultPrevented) return;
                const next = !isPressed;
                if (pressed === undefined) setLocalPressed(next);
                onPressedChange?.(next);
              }
            : onClick
        }
        className={cn(
          "mt-btn",
          `mt-btn-${variant}`,
          `mt-size-${size}`,
          iconOnly && "mt-icon-btn",
          danger && "mt-danger",
          className,
        )}
      >
        {iconToggle ? (
          <span className="mt-btn-section mt-btn-section-start" aria-hidden="true">
            {leading}
          </span>
        ) : hasButtonSection(leftSection) ? (
          <span className="mt-btn-section mt-btn-section-start">{leading}</span>
        ) : (
          leading
        )}
        {children}
        {hasButtonSection(rightSection) && (
          <span className="mt-btn-section mt-btn-section-end">{rightSection}</span>
        )}
      </BaseButton>
    );
  },
);
export const IconButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "iconOnly"> & { "aria-label": string }
>(function IconButton(p, r) {
  return (
    <Button
      {...p}
      ref={r}
      iconOnly
      className={cn("mt-icon-btn-legacy", p.className)}
    />
  );
});
export type ButtonGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Join adjacent buttons, keeping only the outside corners rounded. */
  connected?: boolean;
};
export const ButtonGroup = ({
  className,
  connected = false,
  ...p
}: ButtonGroupProps) => (
  <div role="group" {...p} className={cn("mt-button-group", connected && "mt-button-group-connected", className)} />
);
export { Input, SearchInput, Textarea } from "./input";
export type { InputProps, InputSearchProps, InputPasswordProps, InputTextAreaProps, InputOTPProps, InputVariant, InputControlSize } from "./input";
export { Form, FormField } from "./form";
export type { FormProps, FormFieldProps, FormRule, FormInstance, FormValues, FormValidationError, FormValidateTrigger } from "./form";
export type Tone = "neutral" | "blue" | "green" | "orange" | "red" | "purple";
export function Badge({
  children,
  tone = "neutral",
  onRemove,
  className,
  ...p
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  onRemove?: () => void;
}) {
  const { locale } = useMtone();
  return (
    <span {...p} className={cn("mt-badge", `mt-tone-${tone}`, className)}>
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={locale === "zh" ? "移除标签" : "Remove tag"}
        >
          <X size={11} />
        </button>
      )}
    </span>
  );
}
export const Status = ({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: Tone;
}) => (
  <span className={cn("mt-status", `mt-tone-${tone}`)}>
    <i />
    {children}
  </span>
);
export { Avatar, AvatarGroup } from "./avatar";
export type { AvatarProps, AvatarGroupProps, AvatarSize, AvatarBreakpoint } from "./avatar";
export { Progress } from "./progress";
export type { ProgressProps, ProgressType, ProgressStatus, ProgressColor } from "./progress";
export { Text } from "./typography";
export { Divider } from "./divider";
export type { DividerProps } from "./divider";
export { Card } from "./card";
export type { CardProps, CardTokens, CardSemantic, CardTabItem, CardMetaProps, CardMetaSemantic, CardGridProps } from "./card";
export { List, ListItem } from "./list";
export type { ListProps, ListItemProps, ListSortHandleProps, ListHandle, ListScrollTarget } from "./list";
export type DocumentItem = {
  id: string;
  title: string;
  description?: string;
  updatedAt?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
};
export function DocumentList({ items }: { items: DocumentItem[] }) {
  return (
    <List>
      {items.map((x) => (
        <ListItem
          key={x.id}
          icon={x.icon || <FileText size={16} />}
          description={x.description}
          actions={<small>{x.updatedAt}</small>}
        >
          <button className="mt-link" type="button" onClick={x.onClick}>
            {x.title}
          </button>
        </ListItem>
      ))}
    </List>
  );
}
export function DocumentCard({
  title,
  description,
  icon,
  updatedAt,
  onClick,
}: DocumentItem) {
  return (
    <Card>
      <div className="mt-doc-icon">{icon || <FileText size={20} />}</div>
      <button type="button" className="mt-link" onClick={onClick}>
        {title}
      </button>
      <p className="mt-muted">{description}</p>
      <small>{updatedAt}</small>
    </Card>
  );
}
export const PropertyList = ({ children }: { children: React.ReactNode }) => (
  <dl className="mt-properties">{children}</dl>
);
export const PropertyItem = ({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div>
    <dt>{label}</dt>
    <dd>{children}</dd>
  </div>
);
export function Alert({
  tone = "info",
  title,
  children,
  onClose,
}: {
  tone?: "info" | "success" | "warning" | "error";
  title?: React.ReactNode;
  children?: React.ReactNode;
  onClose?: () => void;
}) {
  const Icon = {
    info: Info,
    success: CheckCircle,
    warning: TriangleAlert,
    error: AlertCircle,
  }[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("mt-alert", `mt-alert-${tone}`)}
    >
      <Icon size={16} />
      <div>
        {title && <strong>{title}</strong>}
        {children && <div>{children}</div>}
      </div>
      {onClose && (
        <IconButton aria-label="Close" variant="ghost" onClick={onClose}>
          <X size={14} />
        </IconButton>
      )}
    </div>
  );
}
export function Empty({
  title,
  description,
  action,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  const { locale } = useMtone();
  return (
    <div className="mt-empty">
      <Inbox size={28} />
      <strong>{title || (locale === "zh" ? "暂无内容" : "No content")}</strong>
      {description && <span>{description}</span>}
      {action}
    </div>
  );
}
export const Skeleton = ({
  className,
  ...p
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div aria-hidden="true" {...p} className={cn("mt-skeleton", className)} />
);
export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <span className="mt-spinner" role="status" aria-label={label}>
      <LoaderCircle size={16} className="mt-spin" />
    </span>
  );
}

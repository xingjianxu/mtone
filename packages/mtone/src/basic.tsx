import { FloatingOwnerContext } from "./floating-owner";
import { Card } from "./card";
import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { Input as BaseInput } from "@base-ui/react/input";
import {
  LoaderCircle,
  Search,
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
type Context = {
  locale: Locale;
  density: "compact" | "comfortable";
  tokens?: Tokens;
};
const MtoneContext = React.createContext<Context>({
  locale: "zh",
  density: "compact",
});
export const useMtone = () => React.useContext(MtoneContext);
export function MtoneScope({
  children,
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const c = useMtone();
  const floatingOwners = React.useContext(FloatingOwnerContext);
  return (
    <div
      {...props}
      className={cn("mt-scope", className)}
      data-density={c.density}
      data-mt-floating-owners={floatingOwners.length ? floatingOwners.join(" ") : undefined}
      style={{ ...c.tokens, ...style }}
    >
      {children}
    </div>
  );
}
export function MtoneProvider({
  children,
  locale = "zh",
  density = "compact",
  tokens,
}: Partial<Context> & { children: React.ReactNode }) {
  return (
    <MtoneContext.Provider value={{ locale, density, tokens }}>
      <MtoneScope>{children}</MtoneScope>
    </MtoneContext.Provider>
  );
}
export type ButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseButton>,
  "className"
> & {
  className?: string;
  variant?: "blue" | "solid" | "outline" | "soft" | "ghost";
  size?: "sm" | "md" | "lg";
  danger?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
};
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "outline",
      size = "md",
      danger,
      loading,
      icon,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) {
    return (
      <BaseButton
        {...props}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          "mt-btn",
          `mt-btn-${variant}`,
          `mt-size-${size}`,
          danger && "mt-danger",
          className,
        )}
      >
        {loading ? <LoaderCircle className="mt-spin" size={14} /> : icon}
        {children}
      </BaseButton>
    );
  },
);
export const IconButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { "aria-label": string }
>(function IconButton(p, r) {
  return <Button {...p} ref={r} className={cn("mt-icon-btn", p.className)} />;
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
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...p }, r) {
  return <BaseInput {...p} ref={r} className={cn("mt-input mt-input-control", className)} />;
});
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...p }, r) {
  return (
    <textarea
      {...p}
      ref={r}
      className={cn("mt-input mt-textarea", className)}
    />
  );
});
export const SearchInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function SearchInput({ className, ...p }, r) {
  return (
    <span className="mt-search">
      <Search size={15} />
      <BaseInput {...p} ref={r} className={cn("mt-input", className)} />
    </span>
  );
});
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
export function Progress({ value, label }: { value: number; label?: string }) {
  const n = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  return (
    <div
      className="mt-progress"
      role="progressbar"
      aria-label={label || "Progress"}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={n}
    >
      <span style={{ width: `${n}%` }} />
    </div>
  );
}
export { Text } from "./typography";
export { Divider } from "./divider";
export type { DividerProps } from "./divider";
export { Card } from "./card";
export type { CardProps, CardTokens, CardSemantic, CardTabItem, CardMetaProps, CardMetaSemantic, CardGridProps } from "./card";
export const List = ({
  className,
  ...p
}: React.HTMLAttributes<HTMLUListElement>) => (
  <ul {...p} className={cn("mt-list", className)} />
);
export function ListItem({
  children,
  icon,
  description,
  actions,
  ...p
}: React.LiHTMLAttributes<HTMLLIElement> & {
  icon?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <li {...p} className={cn("mt-list-item", p.className)}>
      {icon}
      <div className="mt-list-content">
        <div>{children}</div>
        {description && <small>{description}</small>}
      </div>
      {actions}
    </li>
  );
}
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

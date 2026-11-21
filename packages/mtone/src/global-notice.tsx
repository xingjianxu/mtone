import * as React from "react";
import { ShieldAlert, X } from "lucide-react";
import { Button, cn, useMtone } from "./basic";

export type GlobalNoticeProps = Omit<
  React.ComponentPropsWithRef<"div">,
  "title"
> & {
  title: React.ReactNode;
  icon?: React.ReactNode;
  /** Label for the trailing action; omit it for an icon-only dismiss button. */
  actionLabel?: string;
  actionRef?: React.Ref<HTMLButtonElement>;
  /** The app owns visibility, pending state, and any async side effects. */
  onAction?: () => void;
  loading?: boolean;
  error?: React.ReactNode;
};

export function GlobalNotice({
  title,
  children,
  icon = <ShieldAlert size={16} />,
  actionLabel,
  actionRef,
  onAction,
  loading = false,
  error,
  className,
  ...props
}: GlobalNoticeProps) {
  const titleId = React.useId();
  const { locale } = useMtone();
  const label = actionLabel?.trim();
  const dismissLabel = locale === "zh" ? "关闭通知" : "Dismiss notice";
  const hasContent = (node: React.ReactNode) =>
    node != null && typeof node !== "boolean" && node !== "";
  return (
    <div
      role="region"
      aria-labelledby={props["aria-label"] ? undefined : titleId}
      {...props}
      className={cn("mt-global-notice", className)}
    >
      <div className="mt-global-notice-message">
        {hasContent(icon) && (
          <span className="mt-global-notice-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <div className="mt-global-notice-copy">
          <strong id={titleId} className="mt-global-notice-title">
            {title}
          </strong>
          {hasContent(children) && (
            <div className="mt-global-notice-detail">{children}</div>
          )}
          {hasContent(error) && (
            <div className="mt-global-notice-error" role="alert">
              {error}
            </div>
          )}
        </div>
      </div>
      {onAction && (
        <Button
          ref={actionRef}
          type="button"
          className="mt-global-notice-action"
          size="small"
          iconOnly={!label}
          aria-label={label ? undefined : dismissLabel}
          loading={loading}
          onClick={onAction}
          rightSection={
            label && !loading ? <X size={14} aria-hidden="true" /> : undefined
          }
        >
          {label || (!loading && <X size={14} aria-hidden="true" />)}
        </Button>
      )}
    </div>
  );
}

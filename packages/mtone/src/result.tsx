import * as React from "react";
import {
  CircleCheck,
  CircleX,
  Info,
  TriangleAlert,
  LockKeyhole,
  FileQuestion,
  ServerCrash,
} from "lucide-react";
import { cn } from "./basic";

export type ResultStatus =
  "success" | "error" | "info" | "warning" | "403" | "404" | "500";
export type ResultSemantic =
  "root" | "icon" | "title" | "subTitle" | "extra" | "body";
type SemanticValue<T> =
  | Partial<Record<ResultSemantic, T>>
  | ((info: {
      props: ResultProps & { status: ResultStatus };
    }) => Partial<Record<ResultSemantic, T>>);
export interface ResultProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  status?: ResultStatus;
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  classNames?: SemanticValue<string>;
  styles?: SemanticValue<React.CSSProperties>;
}
const icons = {
  success: CircleCheck,
  error: CircleX,
  info: Info,
  warning: TriangleAlert,
  "403": LockKeyhole,
  "404": FileQuestion,
  "500": ServerCrash,
};
const hasContent = (node: React.ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== true;
/** Static result summary. Opt into role="status" or aria-live only for dynamic announcements. */
export const Result = React.forwardRef<HTMLDivElement, ResultProps>(
  function Result(props, ref) {
    const {
      status = "info",
      title,
      subTitle,
      icon,
      extra,
      children,
      classNames,
      styles,
      className,
      style,
      ...rest
    } = props;
    const info = { props: { ...props, status } };
    const classes =
      typeof classNames === "function" ? classNames(info) : classNames;
    const slotStyles = typeof styles === "function" ? styles(info) : styles;
    const Icon = icons[status] ?? Info;
    const resolvedIcon =
      icon === undefined ? <Icon aria-hidden="true" /> : icon;
    const slot = (key: ResultSemantic, base: string) => ({
      className: cn(base, classes?.[key]),
      style: slotStyles?.[key],
    });
    return (
      <div
        {...rest}
        ref={ref}
        data-status={status}
        className={cn("mt-result", classes?.root, className)}
        style={{ ...slotStyles?.root, ...style }}
      >
        {hasContent(resolvedIcon) && (
          <div {...slot("icon", "mt-result-icon")}>{resolvedIcon}</div>
        )}
        {hasContent(title) && (
          <div {...slot("title", "mt-result-title")}>{title}</div>
        )}
        {hasContent(subTitle) && (
          <div {...slot("subTitle", "mt-result-subtitle")}>{subTitle}</div>
        )}
        {hasContent(extra) && (
          <div {...slot("extra", "mt-result-extra")}>{extra}</div>
        )}
        {hasContent(children) && (
          <div {...slot("body", "mt-result-body")}>{children}</div>
        )}
      </div>
    );
  },
);

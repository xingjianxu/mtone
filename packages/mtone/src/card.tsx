import * as React from "react";
import { cn, Skeleton, useMtone } from "./basic";
import { Tabs, type TabsProps } from "./interactive";

export type CardSemantic =
  "root" | "header" | "title" | "extra" | "cover" | "body" | "actions" | "tabs";
export type CardSemanticValue<K extends string, V, P> =
  Partial<Record<K, V>> | ((info: { props: P }) => Partial<Record<K, V>>);
export interface CardTokens {
  bodyPadding?: number | string;
  bodyPaddingSM?: number | string;
  headerPadding?: number | string;
  headerPaddingSM?: number | string;
  headerHeight?: number | string;
  headerHeightSM?: number | string;
  headerFontSize?: number | string;
  headerFontSizeSM?: number | string;
  headerBg?: string;
  actionsBg?: string;
  actionsPadding?: number | string;
  borderRadius?: number | string;
  gridMinWidth?: number | string;
}
export interface CardTabItem {
  key: string;
  label: React.ReactNode;
  content?: React.ReactNode;
  disabled?: boolean;
}
export interface CardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title?: React.ReactNode;
  /** Native HTML tooltip, formerly supplied through title. */
  htmlTitle?: string;
  extra?: React.ReactNode;
  cover?: React.ReactNode;
  actions?: React.ReactNode[];
  loading?: boolean;
  loadingLabel?: string;
  size?: "medium" | "small";
  variant?: "outlined" | "borderless";
  hoverable?: boolean;
  type?: "inner";
  tabList?: CardTabItem[];
  activeTabKey?: string;
  defaultActiveTabKey?: string;
  onTabChange?: (key: string) => void;
  tabBarExtraContent?: React.ReactNode;
  tabProps?: Pick<TabsProps, "className">;
  classNames?: CardSemanticValue<CardSemantic, string, CardProps>;
  styles?: CardSemanticValue<CardSemantic, React.CSSProperties, CardProps>;
  tokens?: CardTokens;
}
// Respect normal JSX conditionals without evaluating custom components.
function hasContent(value: React.ReactNode): boolean {
  return React.Children.toArray(value).some((child) => {
    if (
      React.isValidElement<{ children?: React.ReactNode }>(child) &&
      child.type === React.Fragment
    ) {
      return hasContent(child.props.children);
    }
    return child !== "";
  });
}
function resolve<K extends string, V, P>(
  value: CardSemanticValue<K, V, P> | undefined,
  props: P,
): Partial<Record<K, V>> {
  return typeof value === "function" ? value({ props }) : (value ?? {});
}
function tokenStyles(tokens: CardTokens | undefined) {
  const result: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(tokens ?? {})) {
    if (value !== undefined)
      result[
        "--mt-card-" + key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
      ] = typeof value === "number" ? value + "px" : value;
  }
  return result as React.CSSProperties;
}
function CardRoot(props: CardProps) {
  const {
    children,
    title,
    htmlTitle,
    extra,
    cover,
    actions,
    loading = false,
    loadingLabel,
    size = "medium",
    variant = "outlined",
    hoverable = false,
    type,
    tabList,
    activeTabKey,
    defaultActiveTabKey,
    onTabChange,
    tabBarExtraContent,
    tabProps,
    classNames,
    styles,
    tokens,
    className,
    style,
    ...native
  } = props;
  const { locale } = useMtone();
  const [localTab, setLocalTab] = React.useState(defaultActiveTabKey);
  const available = tabList ?? [];
  const first = available.find((tab) => !tab.disabled)?.key;
  const selected =
    activeTabKey !== undefined
      ? activeTabKey
      : available.some((tab) => tab.key === localTab && !tab.disabled)
        ? localTab
        : first;
  React.useEffect(() => {
    if (
      activeTabKey === undefined &&
      !available.some((tab) => tab.key === localTab && !tab.disabled) &&
      localTab !== first
    )
      setLocalTab(first);
  }, [activeTabKey, available, localTab, first]);
  // Keep the original DOM and native padding overrides for existing bare cards.
  const structured = [
    "title",
    "extra",
    "cover",
    "actions",
    "loading",
    "loadingLabel",
    "size",
    "variant",
    "hoverable",
    "type",
    "tabList",
    "activeTabKey",
    "defaultActiveTabKey",
    "onTabChange",
    "tabBarExtraContent",
    "tabProps",
    "classNames",
    "styles",
    "tokens",
  ].some((key) => props[key as keyof CardProps] !== undefined);
  if (!structured)
    return (
      <div
        {...native}
        title={htmlTitle}
        className={cn("mt-card", className)}
        style={style}
      >
        {children}
      </div>
    );
  const classes = resolve(classNames, props),
    css = resolve(styles, props);
  const hasHeader = hasContent(title) || hasContent(extra);
  const hasTabs = available.length > 0;
  const loadingText =
    loadingLabel ?? (locale === "zh" ? "正在加载" : "Loading");
  const body = (content: React.ReactNode) => (
    <div className={cn("mt-card-body", classes.body)} style={css.body}>
      {loading ? (
        <div className="mt-card-loading" role="status" aria-label={loadingText}>
          <Skeleton style={{ width: "60%", height: 16 }} />
          <Skeleton style={{ height: 12 }} />
          <Skeleton style={{ width: "80%", height: 12 }} />
        </div>
      ) : (
        content
      )}
    </div>
  );
  return (
    <div
      {...native}
      title={htmlTitle}
      aria-busy={loading || native["aria-busy"]}
      className={cn(
        "mt-card",
        "mt-card-structured",
        size === "small" && "mt-card-small",
        variant === "borderless" && "mt-card-borderless",
        hoverable && "mt-card-hoverable",
        type === "inner" && "mt-card-inner",
        classes.root,
        className,
      )}
      style={{ ...tokenStyles(tokens), ...css.root, ...style }}
    >
      {hasHeader && (
        <div
          className={cn("mt-card-header", classes.header)}
          style={css.header}
        >
          {hasContent(title) && (
            <div
              className={cn("mt-card-title", classes.title)}
              style={css.title}
            >
              {title}
            </div>
          )}
          {hasContent(extra) && (
            <div
              className={cn("mt-card-extra", classes.extra)}
              style={css.extra}
            >
              {extra}
            </div>
          )}
        </div>
      )}
      {hasContent(cover) && (
        <div className={cn("mt-card-cover", classes.cover)} style={css.cover}>
          {cover}
        </div>
      )}
      {hasTabs ? (
        <div
          className={cn("mt-card-tabs-layout", classes.tabs)}
          style={css.tabs}
        >
          <Tabs
            {...tabProps}
            className={cn("mt-card-tabs", tabProps?.className)}
            value={selected ?? ""}
            onValueChange={(key) => {
              if (activeTabKey === undefined) setLocalTab(key);
              onTabChange?.(key);
            }}
            items={available.map((tab) => ({
              value: tab.key,
              label: tab.label,
              disabled: tab.disabled,
              content: body(tab.content === undefined ? children : tab.content),
            }))}
          />
          {hasContent(tabBarExtraContent) && (
            <div className="mt-card-tab-extra">{tabBarExtraContent}</div>
          )}
        </div>
      ) : (
        body(children)
      )}
      {!!actions?.length && (
        <ul
          className={cn("mt-card-actions", classes.actions)}
          style={css.actions}
        >
          {actions.map((action, i) => (
            <li key={i}>{action}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
export type CardMetaSemantic =
  "root" | "section" | "avatar" | "title" | "description";
export interface CardMetaProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  avatar?: React.ReactNode;
  title?: React.ReactNode;
  htmlTitle?: string;
  description?: React.ReactNode;
  classNames?: CardSemanticValue<CardMetaSemantic, string, CardMetaProps>;
  styles?: CardSemanticValue<
    CardMetaSemantic,
    React.CSSProperties,
    CardMetaProps
  >;
}
function CardMeta(props: CardMetaProps) {
  const {
    avatar,
    title,
    htmlTitle,
    description,
    className,
    style,
    classNames,
    styles,
    children,
    ...native
  } = props;
  const classes = resolve(classNames, props),
    css = resolve(styles, props);
  return (
    <div
      {...native}
      title={htmlTitle}
      className={cn("mt-card-meta", classes.root, className)}
      style={{ ...css.root, ...style }}
    >
      {hasContent(avatar) && (
        <div
          className={cn("mt-card-meta-avatar", classes.avatar)}
          style={css.avatar}
        >
          {avatar}
        </div>
      )}
      <div
        className={cn("mt-card-meta-section", classes.section)}
        style={css.section}
      >
        {hasContent(title) && (
          <div
            className={cn("mt-card-meta-title", classes.title)}
            style={css.title}
          >
            {title}
          </div>
        )}
        {hasContent(description) && (
          <div
            className={cn("mt-card-meta-description", classes.description)}
            style={css.description}
          >
            {description}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
export interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}
function CardGrid({ hoverable = true, className, ...props }: CardGridProps) {
  return (
    <div
      {...props}
      className={cn(
        "mt-card-grid",
        hoverable && "mt-card-grid-hoverable",
        className,
      )}
    />
  );
}
export const Card = Object.assign(CardRoot, { Meta: CardMeta, Grid: CardGrid });

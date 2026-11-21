import * as React from "react";
import { Check, Copy, Pencil } from "lucide-react";
import { cn, useMtone } from "./basic";
import { CodeTokens, codeLanguages, type CodeLanguage, type CodeToken } from "./typography-code-tokens";

export type TypographyTone = "secondary" | "success" | "warning" | "danger";
export interface TypographyCopyable {
  text?: string | (() => string | Promise<string>);
  onCopy?: () => void;
  onError?: (error: unknown) => void;
  label?: string;
}
export interface TypographyEditable {
  text?: string;
  editing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  onChange?: (text: string) => void;
  onStart?: () => void;
  onCancel?: () => void;
  maxLength?: number;
  label?: string;
}
export interface TypographyEllipsis {
  rows?: number;
  expandable?: boolean;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  expandLabel?: string;
  collapseLabel?: string;
}
export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  muted?: boolean;
  type?: TypographyTone;
  disabled?: boolean;
  strong?: boolean;
  italic?: boolean;
  underline?: boolean;
  delete?: boolean;
  mark?: boolean;
  code?: boolean;
  keyboard?: boolean;
  copyable?: boolean | TypographyCopyable;
  editable?: boolean | TypographyEditable;
  ellipsis?: boolean | TypographyEllipsis;
}
export interface TitleProps extends TextProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Draws a full-width rule below the heading. Defaults to true only for h2. */
  divider?: boolean;
}
export type ParagraphProps = TextProps;
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  muted?: boolean;
  type?: TypographyTone;
  disabled?: boolean;
}
function plainText(node: React.ReactNode): string {
  return React.Children.toArray(node)
    .map((child) =>
      typeof child === "string" || typeof child === "number"
        ? String(child)
        : React.isValidElement<{ children?: React.ReactNode }>(child)
          ? plainText(child.props.children)
          : "",
    )
    .join("");
}
const Content = React.forwardRef<
  HTMLElement,
  TextProps & { tag: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" }
>(function Content(
  {
    tag,
    children,
    muted,
    type,
    disabled,
    strong,
    italic,
    underline,
    delete: deleted,
    mark,
    code,
    keyboard,
    copyable,
    editable,
    ellipsis,
    className,
    ...props
  },
  ref,
) {
  const { locale } = useMtone();
  const en = locale === "en";
  const copy = typeof copyable === "object" ? copyable : {};
  const edit = typeof editable === "object" ? editable : {};
  const clamp = typeof ellipsis === "object" ? ellipsis : {};
  const source = edit.text ?? plainText(children);
  const [value, setValue] = React.useState(source);
  React.useEffect(() => setValue(source), [source]);
  const [editing, setEditing] = React.useState(false);
  const active = !!editable && !disabled && (edit.editing ?? editing);
  const [draft, setDraft] = React.useState(value);
  const [expanded, setExpanded] = React.useState(
    clamp.defaultExpanded ?? false,
  );
  const isExpanded = clamp.expanded ?? expanded;
  const [status, setStatus] = React.useState<
    "idle" | "pending" | "copied" | "error"
  >("idle");
  const input = React.useRef<HTMLTextAreaElement>(null);
  const editButton = React.useRef<HTMLButtonElement>(null);
  const busy = React.useRef(false);
  const composing = React.useRef(false);
  const ended = React.useRef(false);
  React.useEffect(() => {
    if (active) {
      ended.current = false;
      composing.current = false;
      setDraft(value);
      input.current?.focus();
    }
  }, [active, value]);
  React.useEffect(() => {
    if (status !== "copied" && status !== "error") return;
    const timer = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(timer);
  }, [status]);
  function finish(cancel = false, restoreFocus = true) {
    if (ended.current) return;
    ended.current = true;
    composing.current = false;
    if (cancel) edit.onCancel?.();
    else {
      if (edit.text === undefined) setValue(draft);
      edit.onChange?.(draft);
    }
    setEditing(false);
    edit.onEditingChange?.(false);
    if (restoreFocus) requestAnimationFrame(() => editButton.current?.focus());
  }
  async function doCopy() {
    if (busy.current) return;
    busy.current = true;
    setStatus("pending");
    try {
      const text =
        typeof copy.text === "function"
          ? await copy.text()
          : (copy.text ?? value);
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      copy.onCopy?.();
    } catch (error) {
      setStatus("error");
      copy.onError?.(error);
    } finally {
      busy.current = false;
    }
  }
  let text: React.ReactNode =
    editable && (value !== source || edit.text !== undefined)
      ? value
      : children;
  if (strong) text = <strong>{text}</strong>;
  if (italic) text = <em>{text}</em>;
  if (underline) text = <u>{text}</u>;
  if (deleted) text = <del>{text}</del>;
  if (mark) text = <mark>{text}</mark>;
  if (code) text = <code>{text}</code>;
  if (keyboard) text = <kbd>{text}</kbd>;
  const rows = Number.isFinite(clamp.rows)
    ? Math.max(1, Math.floor(clamp.rows!))
    : 1;
  const copyLabel = copy.label ?? (en ? "Copy" : "复制");
  const editLabel = edit.label ?? (en ? "Edit" : "编辑");
  const content = active ? (
    <textarea
      ref={input}
      className="mt-input mt-typography-editor"
      aria-label={editLabel}
      value={draft}
      rows={tag === "span" ? 1 : 3}
      maxLength={edit.maxLength}
      onChange={(e) => setDraft(e.target.value)}
      onCompositionStart={() => {
        composing.current = true;
      }}
      onCompositionEnd={() => {
        composing.current = false;
      }}
      onBlur={() => finish(false, false)}
      onKeyDown={(e) => {
        if (composing.current || e.nativeEvent.isComposing || e.keyCode === 229)
          return;
        if (e.key === "Escape") {
          e.preventDefault();
          finish(true);
        }
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          finish();
        }
      }}
    />
  ) : (
    <>
      {!ellipsis ? (
        text
      ) : (
        <span
          className={cn(
            "mt-typography-content",
            !!ellipsis && !isExpanded && "mt-typography-clamp",
          )}
          style={
            ellipsis && !isExpanded
              ? {
                  display: rows === 1 ? "inline-block" : "-webkit-box",
                  WebkitLineClamp: rows,
                  WebkitBoxOrient: "vertical",
                  whiteSpace: rows === 1 ? "nowrap" : undefined,
                }
              : undefined
          }
        >
          {text}
        </span>
      )}
      {!!ellipsis && clamp.expandable && (
        <button
          type="button"
          className="mt-typography-action"
          disabled={disabled}
          aria-expanded={isExpanded}
          onClick={() => {
            setExpanded(!isExpanded);
            clamp.onExpandedChange?.(!isExpanded);
          }}
        >
          {isExpanded
            ? (clamp.collapseLabel ?? (en ? "Collapse" : "收起"))
            : (clamp.expandLabel ?? (en ? "Expand" : "展开"))}
        </button>
      )}
      {!!copyable && (
        <button
          type="button"
          className="mt-typography-action"
          disabled={disabled || status === "pending"}
          aria-label={copyLabel}
          title={copyLabel}
          onClick={doCopy}
        >
          {status === "copied" ? <Check size={14} /> : <Copy size={14} />}
        </button>
      )}
      {!!editable && (
        <button
          ref={editButton}
          type="button"
          className="mt-typography-action"
          disabled={disabled}
          aria-label={editLabel}
          title={editLabel}
          onClick={() => {
            setDraft(value);
            setEditing(true);
            edit.onEditingChange?.(true);
            edit.onStart?.();
          }}
        >
          <Pencil size={14} />
        </button>
      )}
      {!!copyable && (
        <span role="status" className="mt-typography-status">
          {status === "copied"
            ? en
              ? "Copied"
              : "已复制"
            : status === "error"
              ? en
                ? "Copy failed"
                : "复制失败"
              : ""}
        </span>
      )}
    </>
  );
  return React.createElement(
    tag,
    {
      ...props,
      ref,
      className: cn(
        "mt-text mt-typography",
        tag === "span" && !!ellipsis && "mt-typography-inline-clamp",
        tag !== "span" && `mt-typography-${tag}`,
        muted && "mt-muted",
        type && `mt-typography-${type}`,
        disabled && "mt-typography-disabled",
        className,
      ),
      "aria-disabled": disabled || undefined,
    },
    content,
  );
});
export const Text = React.forwardRef<HTMLSpanElement, TextProps>(
  (props, ref) => <Content {...props} tag="span" ref={ref} />,
);
export const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(
  ({ level = 1, divider = level === 2, className, ...props }, ref) => (
    <Content
      {...props}
      tag={`h${[1, 2, 3, 4, 5, 6].includes(level) ? level : 1}` as "h1"}
      className={cn(divider && "mt-typography-title-divider", className)}
      ref={ref}
    />
  ),
);
export const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  (props, ref) => <Content {...props} tag="p" ref={ref} />,
);
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      muted,
      type,
      disabled,
      className,
      href,
      onClick,
      tabIndex,
      rel,
      target,
      ...props
    },
    ref,
  ) => (
    <a
      {...props}
      ref={ref}
      href={disabled ? undefined : href}
      target={target}
      rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
      tabIndex={disabled ? -1 : tabIndex}
      aria-disabled={disabled || undefined}
      className={cn(
        "mt-typography-link",
        muted && "mt-muted",
        type && `mt-typography-${type}`,
        disabled && "mt-typography-disabled",
        className,
      )}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
    />
  ),
);
export interface BlockquoteProps extends Omit<
  React.BlockquoteHTMLAttributes<HTMLQuoteElement>,
  "cite" | "color"
> {
  /** Visible attribution; use citeUrl for the HTML source URL. */
  cite?: React.ReactNode;
  citeUrl?: string;
  /** Decorative icon. Keep interactive controls in children or cite instead. */
  icon?: React.ReactNode;
  iconSize?: number | string;
  /** Any CSS color value, including a theme variable. */
  color?: React.CSSProperties["color"];
  radius?: React.CSSProperties["borderRadius"];
  textWrap?: React.CSSProperties["textWrap"];
}
export const Blockquote = React.forwardRef<HTMLQuoteElement, BlockquoteProps>(
  function Blockquote(
    {
      children,
      cite,
      citeUrl,
      icon,
      iconSize = 28,
      color,
      radius = 4,
      textWrap = "wrap",
      className,
      style,
      ...props
    },
    ref,
  ) {
    return (
      <blockquote
        {...props}
        ref={ref}
        cite={citeUrl}
        className={cn("mt-typography mt-blockquote", className)}
        style={
          {
            "--mt-blockquote-color": color,
            "--mt-blockquote-icon-size":
              typeof iconSize === "number" ? `${iconSize}px` : iconSize,
            borderRadius: radius,
            textWrap,
            ...style,
          } as React.CSSProperties
        }
      >
        {icon != null && icon !== false && (
          <span className="mt-blockquote-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <div className="mt-blockquote-body">{children}</div>
        {cite != null && cite !== false && (
          <footer className="mt-blockquote-cite">{cite}</footer>
        )}
      </blockquote>
    );
  },
);

export interface TypographyCodeProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "dangerouslySetInnerHTML"
> {
  /** Render a preformatted block instead of inline code. */
  block?: boolean;
  /** Highlight a supported language in multiline string blocks. */
  language?: string;
}
const Code = React.forwardRef<HTMLElement, TypographyCodeProps>(function Code(
  { block = false, language, children, className, tabIndex, ...props },
  ref,
) {
  const element = React.useRef<HTMLElement | null>(null);
  const setElement = React.useCallback((node: HTMLElement | null) => {
    element.current = node;
  }, []);
  const [overflows, setOverflows] = React.useState(false);
  const [highlight, setHighlight] = React.useState<{
    text: string;
    language: CodeLanguage;
    tokens: CodeToken[];
  }>();
  const candidateLanguage = language?.trim().toLowerCase();
  const supported = block && codeLanguages.find((value) => value === candidateLanguage);
  const text = typeof children === "string" ? children : undefined;
  React.useEffect(() => {
    if (!supported || !text) return;
    let active = true;
    import("./typography-highlight")
      .then(({ highlightCode }) => highlightCode(text, supported))
      .then((tokens) => {
        if (active) setHighlight({ text, language: supported, tokens });
      })
      .catch(() => {
        // Plain code already displays the exact input if the lazy module fails.
      });
    return () => { active = false; };
  }, [supported, text]);
  const tokens = supported && highlight?.language === supported && highlight.text === text ? highlight.tokens : undefined;
  React.useImperativeHandle(ref, () => element.current!, [block]);
  React.useLayoutEffect(() => {
    const node = element.current;
    if (!block || !node || tabIndex !== undefined) return;
    const measure = () => setOverflows(node.scrollWidth > node.clientWidth);
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(node);
    if (node.firstElementChild) observer?.observe(node.firstElementChild);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [block, children, tabIndex, tokens]);

  if (block) {
    return (
      <pre
        {...props}
        ref={setElement}
        tabIndex={tabIndex ?? (overflows ? 0 : undefined)}
        className={cn("mt-typography-code-block", className)}
      ><code>{tokens ? <CodeTokens tokens={tokens} /> : children}</code></pre>
    );
  }
  return (
    <code {...props} ref={setElement} tabIndex={tabIndex} className={cn("mt-typography-code", className)}>
      {children}
    </code>
  );
});

Text.displayName = "Text";
Title.displayName = "Title";
Paragraph.displayName = "Paragraph";
Link.displayName = "Link";
export const Typography = { Text, Title, Paragraph, Link, Blockquote, Code };

import * as React from "react";
import { ArrowDown, ArrowUp, Paperclip, Square, X } from "lucide-react";
import { Button, Textarea, cn, useMtone, type ButtonProps } from "./basic";
import { Select } from "./interactive";

export interface AiChatProps extends React.HTMLAttributes<HTMLDivElement> {
  autoFollow?: boolean;
  bottomThreshold?: number;
  scrollToBottomLabel?: string;
  empty?: React.ReactNode;
  footer?: React.ReactNode;
}
export function AiChat({
  autoFollow = true,
  bottomThreshold = 64,
  scrollToBottomLabel,
  empty,
  footer,
  children,
  className,
  ...props
}: AiChatProps) {
  const { locale } = useMtone();
  const viewport = React.useRef<HTMLDivElement>(null),
    content = React.useRef<HTMLDivElement>(null);
  const follow = React.useRef(true);
  const [atBottom, setAtBottom] = React.useState(true);
  const jump = React.useCallback(() => {
    const el = viewport.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
      follow.current = true;
      setAtBottom(true);
    }
  }, []);
  const update = React.useCallback(() => {
    if (autoFollow && follow.current) jump();
    else {
      const el = viewport.current;
      if (el)
        setAtBottom(
          el.scrollHeight - el.scrollTop - el.clientHeight <=
            Math.max(0, bottomThreshold),
        );
    }
  }, [autoFollow, jump, bottomThreshold]);
  React.useEffect(update, [children, update]);
  React.useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    if (content.current) observer.observe(content.current);
    if (viewport.current) observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [update]);
  return (
    <div {...props} className={cn("mt-ai-chat", className)}>
      <div
        ref={viewport}
        className="mt-ai-chat-viewport"
        role="log"
        aria-label={
          props["aria-label"] ?? (locale === "zh" ? "对话消息" : "Conversation")
        }
        aria-live="off"
        tabIndex={0}
        onScroll={() => {
          const el = viewport.current!;
          const near =
            el.scrollHeight - el.scrollTop - el.clientHeight <=
            Math.max(0, bottomThreshold);
          follow.current = near;
          setAtBottom(near);
        }}
      >
        <div ref={content} className="mt-ai-chat-content">
          {React.Children.toArray(children).length ? children : empty}
        </div>
      </div>
      {!atBottom && (
        <div className="mt-ai-chat-jump">
          <Button
            size="sm"
            onClick={() => {
              jump();
              viewport.current?.focus({ preventScroll: true });
            }}
            icon={<ArrowDown size={14} aria-hidden="true" />}
          >
            {scrollToBottomLabel ??
              (locale === "zh" ? "回到最新消息" : "Jump to latest")}
          </Button>
        </div>
      )}
      {footer != null && <div className="mt-ai-chat-footer">{footer}</div>}
    </div>
  );
}
export interface AiMessageProps extends React.HTMLAttributes<HTMLElement> {
  from: "user" | "assistant" | "system";
  name?: React.ReactNode;
  avatar?: React.ReactNode;
  actions?: React.ReactNode;
  status?: "idle" | "streaming" | "error";
  statusLabel?: string;
}
export function AiMessage({
  from,
  name,
  avatar,
  actions,
  status = "idle",
  statusLabel,
  children,
  className,
  ...props
}: AiMessageProps) {
  const { locale } = useMtone();
  const sender =
    name ??
    {
      user: locale === "zh" ? "你" : "You",
      assistant: locale === "zh" ? "助手" : "Assistant",
      system: locale === "zh" ? "系统" : "System",
    }[from];
  return (
    <article
      {...props}
      className={cn("mt-ai-message", className)}
      data-from={from}
      data-status={status}
    >
      {avatar != null && <div className="mt-ai-message-avatar">{avatar}</div>}
      <div className="mt-ai-message-main">
        <div className="mt-ai-message-name">{sender}</div>
        <div className="mt-ai-message-body">{children}</div>
        {status !== "idle" && (
          <div className="mt-ai-message-status" role="status">
            {statusLabel ??
              (status === "streaming"
                ? locale === "zh"
                  ? "生成中"
                  : "Generating"
                : locale === "zh"
                  ? "生成失败"
                  : "Generation failed")}
          </div>
        )}
        {actions != null && (
          <div className="mt-ai-message-actions">{actions}</div>
        )}
      </div>
    </article>
  );
}
export interface AiPromptAttachment {
  id: string;
  name: string;
  size?: number;
}
export interface AiPromptSubmission {
  text: string;
  attachments: readonly AiPromptAttachment[];
}
export type AiPromptStatus = "ready" | "submitted" | "streaming" | "error";
export interface AiPromptInputProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onSubmit" | "defaultValue"
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit: (submission: AiPromptSubmission) => void | Promise<void>;
  onStop?: () => void;
  status?: AiPromptStatus;
  disabled?: boolean;
  placeholder?: string;
  attachments?: readonly AiPromptAttachment[];
  onFilesSelect?: (files: File[]) => void;
  onAttachmentRemove?: (id: string) => void;
  accept?: string;
  multiple?: boolean;
  toolbar?: React.ReactNode;
  error?: React.ReactNode;
  submitLabel?: string;
  stopLabel?: string;
  attachmentLabel?: string;
}
export function AiPromptInput({
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  onStop,
  status = "ready",
  disabled = false,
  placeholder,
  attachments = [],
  onFilesSelect,
  onAttachmentRemove,
  accept,
  multiple = true,
  toolbar,
  error,
  submitLabel,
  stopLabel,
  attachmentLabel,
  className,
  ...props
}: AiPromptInputProps) {
  const { locale } = useMtone();
  const zh = locale === "zh";
  const [local, setLocal] = React.useState(defaultValue),
    [pending, setPending] = React.useState(false),
    [failed, setFailed] = React.useState(false);
  const lock = React.useRef(false),
    composing = React.useRef(false),
    file = React.useRef<HTMLInputElement>(null);
  const mounted = React.useRef(true);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const text = value ?? local;
  const busy = pending || status === "submitted" || status === "streaming";
  const send = () => {
    if (
      disabled ||
      busy ||
      lock.current ||
      (!text.trim() && !attachments.length)
    )
      return;
    setFailed(false);
    lock.current = true;
    try {
      const result = onSubmit({ text, attachments: [...attachments] });
      if (result && typeof result.then === "function") {
        setPending(true);
        Promise.resolve(result)
          .catch(() => {
            if (mounted.current) setFailed(true);
          })
          .finally(() => {
            lock.current = false;
            if (mounted.current) setPending(false);
          });
      } else lock.current = false;
    } catch {
      lock.current = false;
      setFailed(true);
    }
  };
  const errorId = React.useId();
  const message =
    error ??
    (failed
      ? zh
        ? "发送失败，请重试。"
        : "Could not send. Please retry."
      : null);
  return (
    <div
      {...props}
      className={cn("mt-ai-prompt", className)}
      data-status={status}
      aria-busy={busy}
    >
      {attachments.length > 0 && (
        <ul
          className="mt-ai-prompt-attachments"
          aria-label={zh ? "附件" : "Attachments"}
        >
          {attachments.map((a) => (
            <li key={a.id}>
              <span title={a.name}>{a.name}</span>
              {a.size !== undefined && <small>{Math.max(0, a.size)} B</small>}
              {onAttachmentRemove && (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={disabled || busy}
                  aria-label={`${zh ? "移除" : "Remove"} ${a.name}`}
                  onClick={() => onAttachmentRemove(a.id)}
                >
                  <X size={12} />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      <Textarea
        value={text}
        onChange={(e) => {
          if (value === undefined) setLocal(e.target.value);
          onValueChange?.(e.target.value);
        }}
        rows={3}
        autoSize={{ minRows: 2, maxRows: 8 }}
        disabled={disabled}
        placeholder={placeholder ?? (zh ? "输入消息…" : "Write a message…")}
        aria-label={props["aria-label"] ?? (zh ? "消息" : "Message")}
        aria-describedby={message ? errorId : undefined}
        aria-invalid={message ? true : undefined}
        onCompositionStart={() => {
          composing.current = true;
        }}
        onCompositionEnd={() => {
          composing.current = false;
        }}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            !e.shiftKey &&
            !e.ctrlKey &&
            !e.altKey &&
            !e.metaKey &&
            !composing.current &&
            !e.nativeEvent.isComposing &&
            e.keyCode !== 229
          ) {
            e.preventDefault();
            send();
          }
        }}
      />
      <div className="mt-ai-prompt-toolbar">
        <div className="mt-ai-prompt-tools">
          {onFilesSelect && (
            <>
              <input
                ref={file}
                type="file"
                hidden
                aria-label={zh ? "选择附件" : "Choose attachments"}
                accept={accept}
                multiple={multiple}
                disabled={disabled || busy}
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  if (files.length && !disabled && !busy) onFilesSelect(files);
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                disabled={disabled || busy}
                aria-label={
                  attachmentLabel ?? (zh ? "添加附件" : "Add attachments")
                }
                onClick={() => file.current?.click()}
              >
                <Paperclip size={15} />
              </Button>
            </>
          )}
          {toolbar}
        </div>
        {busy ? (
          <Button
            size="sm"
            disabled={disabled || !onStop}
            onClick={onStop}
            icon={<Square size={12} />}
          >
            {stopLabel ?? (zh ? "停止生成" : "Stop generating")}
          </Button>
        ) : (
          <Button
            size="sm"
            disabled={disabled || (!text.trim() && !attachments.length)}
            onClick={send}
            icon={<ArrowUp size={14} />}
          >
            {submitLabel ?? (zh ? "发送" : "Send")}
          </Button>
        )}
      </div>
      {message != null && (
        <div id={errorId} role="alert" className="mt-ai-prompt-error">
          {message}
        </div>
      )}
    </div>
  );
}
export interface AiSuggestionProps extends Omit<ButtonProps, "onSelect"> {
  prompt: string;
  onSelect?: (prompt: string) => void;
}
export function AiSuggestion({
  prompt,
  onSelect,
  children,
  onClick,
  className,
  ...props
}: AiSuggestionProps) {
  return (
    <Button
      variant="outline"
      {...props}
      className={cn("mt-ai-suggestion", className)}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) onSelect?.(prompt);
      }}
    >
      {children ?? prompt}
    </Button>
  );
}
export interface AiModelOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface AiModelSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  models: AiModelOption[];
  value: string;
  onValueChange: (value: string) => void;
  efforts?: AiModelOption[];
  effort?: string;
  onEffortChange?: (value: string) => void;
  disabled?: boolean;
  modelLabel?: string;
  effortLabel?: string;
}
export function AiModelSelector({
  models,
  value,
  onValueChange,
  efforts,
  effort,
  onEffortChange,
  disabled,
  modelLabel,
  effortLabel,
  className,
  ...props
}: AiModelSelectorProps) {
  const { locale } = useMtone();
  return (
    <div {...props} className={cn("mt-ai-model-selector", className)}>
      <Select
        options={models}
        value={value}
        onValueChange={(v) => {
          if (v !== null) onValueChange(v);
        }}
        disabled={disabled}
        label={modelLabel ?? (locale === "zh" ? "模型" : "Model")}
      />
      {efforts && (
        <Select
          options={efforts}
          value={effort ?? null}
          onValueChange={(v) => {
            if (v !== null) onEffortChange?.(v);
          }}
          disabled={disabled || !onEffortChange}
          label={
            effortLabel ?? (locale === "zh" ? "推理强度" : "Reasoning effort")
          }
        />
      )}
    </div>
  );
}

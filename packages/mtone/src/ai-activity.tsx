import * as React from "react";
import {
  Check,
  ChevronRight,
  Circle,
  CircleAlert,
  LoaderCircle,
  RotateCcw,
  X,
} from "lucide-react";
import { Button, cn, useMtone } from "./basic";

export type AiActivityStatus =
  "pending" | "running" | "completed" | "error" | "cancelled";
export interface AiActivityStep {
  id: string;
  title: string;
  description?: React.ReactNode;
  status?: AiActivityStatus;
}
export interface AiActivityProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  status?: AiActivityStatus;
  statusLabel?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
const statusNames = {
  zh: {
    pending: "待处理",
    running: "进行中",
    completed: "已完成",
    error: "失败",
    cancelled: "已取消",
  },
  en: {
    pending: "Pending",
    running: "Running",
    completed: "Completed",
    error: "Failed",
    cancelled: "Cancelled",
  },
};
function ActivityStatus({
  status,
  label,
}: {
  status: AiActivityStatus;
  label?: string;
}) {
  const { locale } = useMtone();
  const Icon = {
    pending: Circle,
    running: LoaderCircle,
    completed: Check,
    error: CircleAlert,
    cancelled: X,
  }[status];
  return (
    <span className="mt-ai-activity-status" data-status={status}>
      <Icon size={14} aria-hidden="true" />
      <span>{label ?? statusNames[locale === "en" ? "en" : "zh"][status]}</span>
    </span>
  );
}
function ActivityDisclosure({
  title,
  status = "pending",
  statusLabel,
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  className,
  ...props
}: AiActivityProps & { title: string }) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const expanded = open ?? internalOpen;
  const id = React.useId();
  return (
    <div
      {...props}
      className={cn("mt-ai-activity", className)}
      data-status={status}
    >
      <div className="mt-ai-activity-header">
        <button
          type="button"
          className="mt-ai-activity-trigger"
          aria-label={title}
          aria-expanded={expanded}
          aria-controls={`${id}-content`}
          id={`${id}-trigger`}
          onClick={() => {
            if (open === undefined) setInternalOpen(!expanded);
            onOpenChange?.(!expanded);
          }}
        >
          <ChevronRight
            size={14}
            aria-hidden="true"
            className="mt-ai-activity-chevron"
          />
          <span>{title}</span>
        </button>
        <ActivityStatus status={status} label={statusLabel} />
      </div>
      <div
        id={`${id}-content`}
        aria-labelledby={`${id}-trigger`}
        role="region"
        hidden={!expanded}
        className="mt-ai-activity-content"
      >
        {expanded && children}
      </div>
    </div>
  );
}
function ActivitySteps({
  items,
  label,
}: {
  items: AiActivityStep[];
  label?: string;
}) {
  const { locale } = useMtone();
  if (!items.length)
    return (
      <p className="mt-ai-activity-empty">
        {locale === "en" ? "No items" : "暂无事项"}
      </p>
    );
  return (
    <ol className="mt-ai-activity-steps" aria-label={label}>
      {items.map((item) => (
        <li key={item.id}>
          <div className="mt-ai-activity-step-heading">
            <span>{item.title}</span>
            <ActivityStatus status={item.status ?? "pending"} />
          </div>
          {item.description != null && (
            <div className="mt-ai-activity-description">{item.description}</div>
          )}
        </li>
      ))}
    </ol>
  );
}
export interface AiChainOfThoughtProps extends AiActivityProps {
  steps?: AiActivityStep[];
}
/** Displays public summaries and observable steps supplied by the caller, not hidden model reasoning. */
export function AiChainOfThought({
  title,
  steps = [],
  children,
  ...props
}: AiChainOfThoughtProps) {
  const { locale } = useMtone();
  return (
    <ActivityDisclosure
      {...props}
      title={title ?? (locale === "en" ? "Activity summary" : "过程摘要")}
    >
      <ActivitySteps items={steps} />
      {children}
    </ActivityDisclosure>
  );
}
export interface AiTaskProps extends AiActivityProps {
  steps?: AiActivityStep[];
}
export function AiTask({ title, steps = [], children, ...props }: AiTaskProps) {
  const { locale } = useMtone();
  return (
    <ActivityDisclosure
      {...props}
      title={title ?? (locale === "en" ? "Task" : "任务")}
    >
      <ActivitySteps items={steps} />
      {children}
    </ActivityDisclosure>
  );
}
export interface AiReasoningProps extends AiActivityProps {
  text: string;
}
/** The text is a caller-provided public explanation. Does not retrieve or expose private reasoning. */
export function AiReasoning({
  title,
  text,
  children,
  ...props
}: AiReasoningProps) {
  const { locale } = useMtone();
  return (
    <ActivityDisclosure
      {...props}
      title={title ?? (locale === "en" ? "Public explanation" : "公开过程说明")}
    >
      <div className="mt-ai-activity-text">{text}</div>
      {children}
    </ActivityDisclosure>
  );
}
export interface AiPlanProps extends AiActivityProps {
  items: AiActivityStep[];
}
export function AiPlan({
  title,
  items,
  children,
  defaultOpen = true,
  ...props
}: AiPlanProps) {
  const { locale } = useMtone();
  const completed = items.filter((item) => item.status === "completed").length;
  const label = title ?? (locale === "en" ? "Plan" : "计划");
  return (
    <ActivityDisclosure {...props} title={label} defaultOpen={defaultOpen}>
      {!!items.length && (
        <div className="mt-ai-activity-progress">
          <progress
            aria-label={locale === "en" ? `${label} progress` : `${label}进度`}
            value={completed}
            max={items.length}
          />
          <span>
            {completed} / {items.length}
          </span>
        </div>
      )}
      <ActivitySteps items={items} />
      {children}
    </ActivityDisclosure>
  );
}
export interface AiQueueProps extends AiActivityProps {
  items: AiActivityStep[];
}
export function AiQueue({
  title,
  items,
  children,
  defaultOpen = true,
  ...props
}: AiQueueProps) {
  const { locale } = useMtone();
  const en = locale === "en";
  const done = (item: AiActivityStep) =>
    item.status === "completed" || item.status === "cancelled";
  const remaining = items.filter((item) => !done(item)),
    ended = items.filter(done);
  return (
    <ActivityDisclosure
      {...props}
      title={title ?? (en ? "Queue" : "队列")}
      defaultOpen={defaultOpen}
    >
      {!items.length ? (
        <ActivitySteps items={[]} />
      ) : (
        <>
          {!!remaining.length && (
            <div>
              <div className="mt-ai-activity-group-label">
                {en ? "Remaining" : "待完成"}
              </div>
              <ActivitySteps
                items={remaining}
                label={en ? "Remaining" : "待完成"}
              />
            </div>
          )}
          {!!ended.length && (
            <div>
              <div className="mt-ai-activity-group-label">
                {en ? "Finished" : "已结束"}
              </div>
              <ActivitySteps items={ended} label={en ? "Finished" : "已结束"} />
            </div>
          )}
        </>
      )}
      {children}
    </ActivityDisclosure>
  );
}
export interface AiSubagentProps extends AiActivityProps {
  name: string;
  description?: React.ReactNode;
  result?: React.ReactNode;
}
export function AiSubagent({
  name,
  title,
  description,
  result,
  children,
  ...props
}: AiSubagentProps) {
  const { locale } = useMtone();
  return (
    <ActivityDisclosure {...props} title={title ?? name}>
      {description != null && (
        <div className="mt-ai-activity-description">{description}</div>
      )}
      {children}
      {result != null && (
        <div>
          <div className="mt-ai-activity-group-label">
            {locale === "en" ? "Result" : "结果"}
          </div>
          <div className="mt-ai-activity-text">{result}</div>
        </div>
      )}
    </ActivityDisclosure>
  );
}
export interface AiToolProps extends AiActivityProps {
  name: string;
  input?: string;
  output?: string;
}
/** Presentation only. Input and output are escaped plain text; this component never invokes a tool. */
export function AiTool({
  name,
  title,
  input,
  output,
  children,
  ...props
}: AiToolProps) {
  const { locale } = useMtone();
  const en = locale === "en";
  return (
    <ActivityDisclosure {...props} title={title ?? name}>
      {input !== undefined && (
        <div>
          <div className="mt-ai-activity-group-label">
            {en ? "Input" : "输入"}
          </div>
          <pre className="mt-ai-activity-code">{input}</pre>
        </div>
      )}
      {output !== undefined && (
        <div>
          <div className="mt-ai-activity-group-label">
            {en ? "Output" : "输出"}
          </div>
          <pre className="mt-ai-activity-code">{output}</pre>
        </div>
      )}
      {children}
    </ActivityDisclosure>
  );
}
export interface AiCheckpointProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  description?: React.ReactNode;
  onRestore?: () => void;
  restoreLabel?: string;
  disabled?: boolean;
}
export function AiCheckpoint({
  label,
  description,
  onRestore,
  restoreLabel,
  disabled = false,
  children,
  className,
  ...props
}: AiCheckpointProps) {
  const { locale } = useMtone();
  const en = locale === "en";
  return (
    <div
      {...props}
      className={cn("mt-ai-activity mt-ai-checkpoint", className)}
    >
      <div className="mt-ai-checkpoint-copy">
        <div>{label ?? (en ? "Checkpoint" : "检查点")}</div>
        {description != null && (
          <div className="mt-ai-activity-description">{description}</div>
        )}
        {children}
      </div>
      <Button
        type="button"
        size="sm"
        disabled={disabled || !onRestore}
        onClick={() => onRestore?.()}
      >
        <RotateCcw size={14} aria-hidden="true" />
        {restoreLabel ?? (en ? "Restore" : "恢复")}
      </Button>
    </div>
  );
}
export interface AiConfirmationProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: React.ReactNode;
  /** Fully controlled decision. Clicking only calls the corresponding callback. */
  state?: "pending" | "approved" | "rejected";
  busy?: boolean;
  onConfirm?: () => void;
  onReject?: () => void;
  confirmLabel?: string;
  rejectLabel?: string;
}
/** A request UI, not an authorization engine: no automatic decision, execution or persistence. */
export function AiConfirmation({
  title,
  description,
  state = "pending",
  busy = false,
  onConfirm,
  onReject,
  confirmLabel,
  rejectLabel,
  children,
  className,
  ...props
}: AiConfirmationProps) {
  const { locale } = useMtone();
  const en = locale === "en";
  return (
    <div
      {...props}
      className={cn("mt-ai-activity mt-ai-confirmation", className)}
      aria-busy={busy || undefined}
      data-state={state}
    >
      <div className="mt-ai-confirmation-title">
        {title ?? (en ? "Confirmation required" : "需要确认")}
      </div>
      {description != null && (
        <div className="mt-ai-activity-description">{description}</div>
      )}
      {children}
      {state === "pending" ? (
        <div className="mt-ai-confirmation-actions">
          <Button
            type="button"
            size="sm"
            disabled={busy || !onConfirm}
            onClick={() => onConfirm?.()}
          >
            {confirmLabel ?? (en ? "Confirm" : "确认")}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={busy || !onReject}
            onClick={() => onReject?.()}
          >
            {rejectLabel ?? (en ? "Reject" : "拒绝")}
          </Button>
        </div>
      ) : (
        <div role="status" className="mt-ai-activity-description">
          {state === "approved"
            ? en
              ? "Confirmed"
              : "已确认"
            : en
              ? "Rejected"
              : "已拒绝"}
        </div>
      )}
    </div>
  );
}

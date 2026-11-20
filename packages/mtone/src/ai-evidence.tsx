import * as React from "react";
import { File, Folder } from "lucide-react";
import { cn, useMtone } from "./basic";
import { Progress } from "./progress";
import { Tree, type TreeItem } from "./tree";

export interface AiEvidenceAppearance {
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}
const count = (value: number) =>
  Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
function useEvidenceText() {
  const { locale } = useMtone();
  return locale === "en"
    ? {
        context: "Context",
        input: "Input tokens",
        output: "Output tokens",
        cost: "Cost",
        files: "Files",
        noFiles: "No files",
        sources: "Sources",
        noSources: "No sources",
        stack: "Stack trace",
        noFrames: "No stack frames",
        terminal: "Terminal",
        tests: "Test results",
        noTests: "No test results",
        idle: "Idle",
        running: "Running",
        success: "Completed",
        error: "Error",
        passed: "Passed",
        failed: "Failed",
        skipped: "Skipped",
      }
    : {
        context: "上下文",
        input: "输入词元",
        output: "输出词元",
        cost: "费用",
        files: "文件",
        noFiles: "暂无文件",
        sources: "来源",
        noSources: "暂无来源",
        stack: "堆栈信息",
        noFrames: "暂无堆栈帧",
        terminal: "终端输出",
        tests: "测试结果",
        noTests: "暂无测试结果",
        idle: "空闲",
        running: "运行中",
        success: "已完成",
        error: "错误",
        passed: "通过",
        failed: "失败",
        skipped: "跳过",
      };
}
export interface AiContextProps extends AiEvidenceAppearance {
  usedTokens: number;
  maxTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  /** Caller-formatted monetary value; no billing or pricing calculation is performed. */
  cost?: string;
}
export function AiContext({
  usedTokens,
  maxTokens,
  inputTokens,
  outputTokens,
  cost,
  label,
  className,
  style,
}: AiContextProps) {
  const text = useEvidenceText();
  const name = label ?? text.context;
  const used = count(usedTokens);
  const max = maxTokens === undefined ? 0 : count(maxTokens);
  return (
    <section
      aria-label={name}
      className={cn("mt-ai-evidence mt-ai-context", className)}
      style={style}
    >
      <div className="mt-ai-evidence-heading">
        <span>{name}</span>
        <span>
          {used.toLocaleString()}
          {max > 0 ? ` / ${max.toLocaleString()}` : ""}
        </span>
      </div>
      {max > 0 && (
        <Progress value={Math.min(100, (used / max) * 100)} label={name} />
      )}
      {(inputTokens !== undefined ||
        outputTokens !== undefined ||
        cost !== undefined) && (
        <dl className="mt-ai-evidence-metrics">
          {inputTokens !== undefined && (
            <div>
              <dt>{text.input}</dt>
              <dd>{count(inputTokens).toLocaleString()}</dd>
            </div>
          )}
          {outputTokens !== undefined && (
            <div>
              <dt>{text.output}</dt>
              <dd>{count(outputTokens).toLocaleString()}</dd>
            </div>
          )}
          {cost !== undefined && (
            <div>
              <dt>{text.cost}</dt>
              <dd>{cost}</dd>
            </div>
          )}
        </dl>
      )}
    </section>
  );
}

export interface AiFileNode {
  id: string;
  name: string;
  kind?: "file" | "folder";
  children?: AiFileNode[];
  disabled?: boolean;
}
export interface AiFileTreeProps extends AiEvidenceAppearance {
  items: AiFileNode[];
  selectedId?: string | null;
  defaultSelectedId?: string;
  onSelect?: (id: string, node: AiFileNode) => void;
  defaultExpandedIds?: string[];
}
export function AiFileTree({
  items,
  selectedId,
  defaultSelectedId,
  onSelect,
  defaultExpandedIds,
  label,
  className,
  style,
}: AiFileTreeProps) {
  const text = useEvidenceText();
  const [local, setLocal] = React.useState<string | null>(
    defaultSelectedId ?? null,
  );
  const { nodes, data } = React.useMemo(() => {
    const nodes = new Map<string, AiFileNode>();
    const visit = (values: AiFileNode[]): TreeItem[] =>
      values.map((node) => {
        nodes.set(node.id, node);
        return {
          id: node.id,
          label: node.name,
          disabled: node.disabled,
          icon:
            node.kind === "folder" || node.children ? (
              <Folder size={14} aria-hidden />
            ) : (
              <File size={14} aria-hidden />
            ),
          children: node.children ? visit(node.children) : undefined,
        };
      });
    const data = visit(items);
    return { nodes, data };
  }, [items]);
  const selected = selectedId === undefined ? local : selectedId;
  return (
    <section
      aria-label={label ?? text.files}
      className={cn("mt-ai-evidence mt-ai-files", className)}
      style={style}
    >
      <div className="mt-ai-evidence-heading">{label ?? text.files}</div>
      {items.length ? (
        <Tree
          aria-label={label ?? text.files}
          items={data}
          showIcon
          selectedKeys={selected === null ? [] : [selected]}
          defaultExpandedKeys={defaultExpandedIds}
          onSelect={(keys) => {
            const id = keys[0];
            if (typeof id !== "string") return;
            const node = nodes.get(id);
            if (!node || node.disabled) return;
            if (selectedId === undefined) setLocal(id);
            onSelect?.(id, node);
          }}
        />
      ) : (
        <p className="mt-ai-evidence-empty">{text.noFiles}</p>
      )}
    </section>
  );
}

export interface AiSource {
  id: string;
  title: string;
  url?: string;
  description?: string;
}
// Only explicitly supported link forms. Never reinterpret opaque or executable schemes.
function safeSourceUrl(raw?: string): string | undefined {
  if (!raw || raw !== raw.trim() || /[\u0000-\u0020\u007f\\]/.test(raw))
    return undefined;
  if (raw.startsWith("#") || (raw.startsWith("/") && !raw.startsWith("//")))
    return raw;
  try {
    const url = new URL(raw);
    if (
      (url.protocol === "https:" || url.protocol === "http:") &&
      /^https?:\/\//i.test(raw) &&
      !url.username &&
      !url.password
    )
      return raw;
  } catch {
    /* Invalid input is rendered as text. */
  }
  return undefined;
}
export interface AiInlineCitationProps {
  source: AiSource;
  index?: number;
  className?: string;
  style?: React.CSSProperties;
}
export function AiInlineCitation({
  source,
  index,
  className,
  style,
}: AiInlineCitationProps) {
  const url = safeSourceUrl(source.url);
  const name = index === undefined ? source.title : `${index}: ${source.title}`;
  const content = <>{index === undefined ? source.title : index}</>;
  return url ? (
    <a
      className={cn("mt-ai-citation", className)}
      style={style}
      href={url}
      aria-label={name}
      title={source.description ?? source.title}
    >
      {content}
    </a>
  ) : (
    <span
      className={cn("mt-ai-citation", className)}
      style={style}
      aria-label={name}
      title={source.description ?? source.title}
    >
      {content}
    </span>
  );
}
export interface AiSourcesProps extends AiEvidenceAppearance {
  sources: AiSource[];
  defaultOpen?: boolean;
}
export function AiSources({
  sources,
  defaultOpen = false,
  label,
  className,
  style,
}: AiSourcesProps) {
  const text = useEvidenceText();
  return (
    <details
      className={cn("mt-ai-evidence", className)}
      style={style}
      open={defaultOpen || undefined}
    >
      <summary>
        {label ?? text.sources}{" "}
        <span className="mt-ai-evidence-muted">({sources.length})</span>
      </summary>
      {sources.length ? (
        <ol className="mt-ai-sources">
          {sources.map((source) => {
            const url = safeSourceUrl(source.url);
            return (
              <li key={source.id}>
                {url ? (
                  <a href={url}>{source.title}</a>
                ) : (
                  <span>{source.title}</span>
                )}
                {source.description && <p>{source.description}</p>}
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-ai-evidence-empty">{text.noSources}</p>
      )}
    </details>
  );
}

export interface AiStackFrame {
  file: string;
  line?: number;
  column?: number;
  functionName?: string;
}
export interface AiStackTraceProps extends AiEvidenceAppearance {
  message: string;
  frames: AiStackFrame[];
  defaultOpen?: boolean;
}
export function AiStackTrace({
  message,
  frames,
  defaultOpen = false,
  label,
  className,
  style,
}: AiStackTraceProps) {
  const text = useEvidenceText();
  return (
    <details
      className={cn("mt-ai-evidence mt-ai-stack", className)}
      style={style}
      open={defaultOpen || undefined}
    >
      <summary>{label ?? text.stack}</summary>
      <pre className="mt-ai-evidence-code">{message}</pre>
      {frames.length ? (
        <ol className="mt-ai-stack-frames">
          {frames.map((frame, i) => (
            <li key={i}>
              <code>
                {frame.functionName ? `${frame.functionName} — ` : ""}
                {frame.file}
                {frame.line === undefined ? "" : `:${count(frame.line)}`}
                {frame.column === undefined ? "" : `:${count(frame.column)}`}
              </code>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-ai-evidence-empty">{text.noFrames}</p>
      )}
    </details>
  );
}
export type AiTerminalStatus = "idle" | "running" | "success" | "error";
export interface AiTerminalProps extends AiEvidenceAppearance {
  output: string;
  status?: AiTerminalStatus;
}
export function AiTerminal({
  output,
  status = "idle",
  label,
  className,
  style,
}: AiTerminalProps) {
  const text = useEvidenceText();
  return (
    <section
      aria-label={label ?? text.terminal}
      className={cn("mt-ai-evidence mt-ai-terminal", className)}
      style={style}
    >
      <div className="mt-ai-evidence-heading">
        <span>{label ?? text.terminal}</span>
        <span className="mt-ai-evidence-status" data-status={status}>
          {text[status]}
        </span>
      </div>
      <pre
        className="mt-ai-evidence-code"
        tabIndex={0}
        aria-label={label ?? text.terminal}
      >
        {output}
      </pre>
    </section>
  );
}
export type AiTestStatus = "passed" | "failed" | "skipped" | "running";
export interface AiTestResult {
  id: string;
  name: string;
  status: AiTestStatus;
  durationMs?: number;
  details?: string;
}
export interface AiTestResultsProps extends AiEvidenceAppearance {
  results: AiTestResult[];
  defaultOpen?: boolean;
}
export function AiTestResults({
  results,
  defaultOpen = false,
  label,
  className,
  style,
}: AiTestResultsProps) {
  const text = useEvidenceText();
  const statuses: AiTestStatus[] = ["passed", "failed", "skipped", "running"];
  return (
    <details
      className={cn("mt-ai-evidence mt-ai-tests", className)}
      style={style}
      open={defaultOpen || undefined}
    >
      <summary>
        {label ?? text.tests}{" "}
        <span className="mt-ai-evidence-muted">({results.length})</span>
      </summary>
      {results.length ? (
        <>
          <div className="mt-ai-test-counts">
            {statuses.map((status) => (
              <span
                key={status}
                className="mt-ai-evidence-status"
                data-status={status}
              >
                {text[status]}{" "}
                {results.filter((result) => result.status === status).length}
              </span>
            ))}
          </div>
          <ul className="mt-ai-test-list">
            {results.map((result) => {
              const title = (
                <>
                  <span className="mt-ai-test-name">{result.name}</span>
                  <span
                    className="mt-ai-evidence-status"
                    data-status={result.status}
                  >
                    {text[result.status]}
                  </span>
                  {result.durationMs !== undefined && (
                    <span className="mt-ai-evidence-muted">
                      {count(result.durationMs)} ms
                    </span>
                  )}
                </>
              );
              return (
                <li key={result.id}>
                  {result.details ? (
                    <details>
                      <summary>{title}</summary>
                      <pre className="mt-ai-evidence-code">
                        {result.details}
                      </pre>
                    </details>
                  ) : (
                    <div className="mt-ai-test-row">{title}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="mt-ai-evidence-empty">{text.noTests}</p>
      )}
    </details>
  );
}

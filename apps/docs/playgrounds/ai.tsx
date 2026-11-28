import { useState } from "react";
import * as M from "../../../packages/mtone/src";
import {
  choice as c,
  flag as f,
  number as n,
  playground as p,
  text as t,
} from "./frame";

const activityState = c("状态", "running", [
  "pending",
  "running",
  "completed",
  "error",
  "cancelled",
]);
const open = f("初始展开", true);
const steps: M.AiActivityStep[] = [
  { id: "read", title: "读取目录", status: "completed" },
  { id: "compare", title: "比对两份文档", status: "running" },
  { id: "result", title: "生成摘要", status: "pending" },
];
const sources = [
  { id: "one", title: "项目准备说明", description: "示例来源一" },
  { id: "two", title: "原始记录", description: "示例来源二" },
];
const files: M.AiFileNode[] = [
  {
    id: "src",
    name: "src",
    kind: "folder",
    children: [
      { id: "index", name: "index.ts" },
      { id: "tests", name: "index.test.ts" },
    ],
  },
  { id: "readme", name: "README.md" },
];
const frameList = [
  { file: "src/project.ts", line: 24, column: 8, functionName: "readProject" },
  { file: "src/index.ts", line: 8, functionName: "main" },
];

function ChatPreview({
  count,
  footer,
  ...props
}: {
  count: number;
  footer: boolean;
  autoFollow: boolean;
  bottomThreshold: number;
}) {
  const [messages, setMessages] = useState(0);
  return (
    <>
      <M.Button size="sm" onClick={() => setMessages((n) => n + 1)}>
        模拟新消息
      </M.Button>
      <M.AiChat
        {...props}
        style={{ height: 180, width: "100%" }}
        empty={<M.Text muted>暂无消息</M.Text>}
        footer={footer ? <M.Text muted>本地模拟对话</M.Text> : undefined}
      >
        {Array.from({ length: count + messages }, (_, i) => (
          <M.AiMessage key={i} from={i % 2 === 0 ? "user" : "assistant"}>
            {i % 2 === 0 ? "需要核对哪些内容？" : "先确认已更新的文档条目。"}
          </M.AiMessage>
        ))}
      </M.AiChat>
    </>
  );
}
function PromptPreview({
  attach,
  status,
  ...props
}: {
  attach: boolean;
  status: M.AiPromptStatus;
  disabled: boolean;
  placeholder: string;
  multiple: boolean;
}) {
  const [mode, setMode] = useState(status);
  const [answer, setAnswer] = useState("");
  const [attachments, setAttachments] = useState<M.AiPromptAttachment[]>([]);
  return (
    <>
      <M.AiPromptInput
        {...props}
        aria-label="演示消息"
        status={mode}
        onSubmit={({ text }) => {
          setAnswer(text);
          setMode("submitted");
        }}
        onStop={() => setMode("ready")}
        attachments={attach ? attachments : []}
        onFilesSelect={
          attach
            ? (files) =>
                setAttachments(
                  files.map((file, i) => ({ id: String(i), name: file.name })),
                )
            : undefined
        }
        onAttachmentRemove={(id) =>
          setAttachments((list) => list.filter((item) => item.id !== id))
        }
        error={mode === "error" ? "模拟失败，可修改文本后重试。" : undefined}
      />
      <output>{answer}</output>
    </>
  );
}
function ModelPreview({
  effortEnabled,
  disabled,
  withUnavailable,
}: {
  effortEnabled: boolean;
  disabled: boolean;
  withUnavailable: boolean;
}) {
  const [model, setModel] = useState("fast");
  const [effort, setEffort] = useState("normal");
  return (
    <M.AiModelSelector
      disabled={disabled}
      value={model}
      onValueChange={setModel}
      models={[
        { value: "fast", label: "快速" },
        { value: "review", label: "审阅" },
        { value: "offline", label: "离线", disabled: withUnavailable },
      ]}
      efforts={
        effortEnabled
          ? [
              { value: "normal", label: "常规" },
              { value: "deep", label: "深入" },
            ]
          : undefined
      }
      effort={effort}
      onEffortChange={setEffort}
    />
  );
}
function DecisionPreview({
  initial,
  ...props
}: {
  initial: "pending" | "approved" | "rejected";
  busy: boolean;
  confirmLabel: string;
  rejectLabel: string;
}) {
  const [state, setState] = useState(initial);
  return (
    <M.AiConfirmation
      {...props}
      title="保存示例摘要？"
      description="只演示状态变化，不提交任何数据。"
      state={state}
      onConfirm={() => setState("approved")}
      onReject={() => setState("rejected")}
    />
  );
}
function LogAction({
  kind,
  ...props
}: {
  kind: "prompt" | "checkpoint";
  label: string;
  disabled: boolean;
}) {
  const [msg, setMsg] = useState("");
  return (
    <div>
      {kind === "prompt" ? (
        <M.AiSuggestion
          prompt={props.label}
          disabled={props.disabled}
          onSelect={setMsg}
        />
      ) : (
        <M.AiCheckpoint
          {...props}
          description="项目文档检查点（演示）"
          onRestore={() => setMsg("已收到恢复请求")}
        />
      )}
      <output>{msg}</output>
    </div>
  );
}

export const aiPlaygrounds = {
  AiChat: p(
    "AiChat",
    {
      autoFollow: f("跟随新消息", true),
      count: n("起始消息", 4, 0, 12),
      footer: f("底栏", true, true),
      bottomThreshold: n("底部阈值", 48, 8, 96, true, 8),
    },
    (props) => <ChatPreview {...props} />,
    { remountOn: ["count"] },
  ),
  AiMessage: p(
    "AiMessage",
    {
      from: c("角色", "assistant", ["assistant", "user", "system"]),
      status: c("状态", "idle", ["idle", "streaming", "error"]),
      actions: f("操作按钮", true, true),
      name: t("显示名称", "文档助手", true),
      avatar: f("头像", true, true),
      message: t("正文", "正在检查项目记录。", true),
    },
    ({ actions, avatar, message, ...props }) => (
      <M.AiMessage
        {...props}
        avatar={avatar ? <M.Avatar size="sm" name={props.name} /> : undefined}
        actions={
          actions ? <M.Button size="sm">重试（示例）</M.Button> : undefined
        }
      >
        {message}
      </M.AiMessage>
    ),
  ),
  AiPromptInput: p(
    "AiPromptInput",
    {
      status: c("状态", "ready", ["ready", "submitted", "streaming", "error"]),
      attach: f("附件选择", true),
      disabled: f("禁用"),
      multiple: { ...f("多选附件", true, true), disabled: (o) => !o.attach },
      placeholder: t("占位文字", "输入项目问题", true),
    },
    (props) => <PromptPreview {...props} />,
    { remountOn: ["status"] },
  ),
  AiSuggestion: p(
    "AiSuggestion",
    { label: t("提示词", "整理项目要点"), disabled: f("禁用") },
    (props) => <LogAction {...props} kind="prompt" />,
  ),
  AiModelSelector: p(
    "AiModelSelector",
    {
      effortEnabled: f("推理强度", true),
      withUnavailable: f("禁用一个选项", true),
      disabled: f("禁用全部"),
    },
    (props) => <ModelPreview {...props} />,
  ),
  AiPlan: p(
    "AiPlan",
    {
      status: activityState,
      defaultOpen: open,
      done: f("所有步骤完成", false, true),
    },
    ({ done, ...props }) => (
      <M.AiPlan
        {...props}
        title="整理文档"
        items={done ? steps.map((s) => ({ ...s, status: "completed" })) : steps}
      />
    ),
    { remountOn: ["defaultOpen"] },
  ),
  AiReasoning: p(
    "AiReasoning",
    {
      status: activityState,
      defaultOpen: open,
      text: t("说明", "比较记录编号与更新时间；结果仍需人工核对。", true),
    },
    (props) => <M.AiReasoning {...props} />,
    { remountOn: ["defaultOpen"] },
  ),
  AiTask: p(
    "AiTask",
    {
      status: activityState,
      defaultOpen: open,
      details: f("步骤明细", true, true),
    },
    ({ details, ...props }) => (
      <M.AiTask {...props} title="核对版本" steps={details ? steps : []} />
    ),
    { remountOn: ["defaultOpen"] },
  ),
  AiQueue: p(
    "AiQueue",
    {
      status: activityState,
      defaultOpen: open,
      count: n("任务条数", 3, 0, 3, true),
    },
    ({ count, ...props }) => (
      <M.AiQueue {...props} items={steps.slice(0, count)} />
    ),
    { remountOn: ["defaultOpen"] },
  ),
  AiSubagent: p(
    "AiSubagent",
    {
      status: activityState,
      defaultOpen: open,
      name: t("名称", "文档校对", true),
      details: f("说明与结果", true, true),
    },
    ({ details, ...props }) => (
      <M.AiSubagent
        {...props}
        description={details ? "核对目录和页码" : undefined}
        result={details ? "发现一处需要核实的页码。" : undefined}
      />
    ),
    { remountOn: ["defaultOpen"] },
  ),
  AiTool: p(
    "AiTool",
    {
      status: activityState,
      defaultOpen: open,
      showInput: f("输入", true, true),
      showOutput: f("输出", true, true),
      name: t("名称", "检索示例", true),
    },
    ({ showInput, showOutput, ...props }) => (
      <M.AiTool
        {...props}
        input={showInput ? '{"keyword":"文档"}' : undefined}
        output={showOutput ? "匹配到 2 条示例记录" : undefined}
      />
    ),
    { remountOn: ["defaultOpen"] },
  ),
  AiCheckpoint: p(
    "AiCheckpoint",
    { label: t("标签", "整理前"), disabled: f("禁用恢复") },
    (props) => <LogAction {...props} kind="checkpoint" />,
  ),
  AiConfirmation: p(
    "AiConfirmation",
    {
      initial: c("起始状态", "pending", ["pending", "approved", "rejected"]),
      busy: f("处理中"),
      confirmLabel: t("确认文字", "确认", true),
      rejectLabel: t("拒绝文字", "拒绝", true),
    },
    (props) => <DecisionPreview {...props} />,
    { remountOn: ["initial"] },
  ),
  AiSources: p(
    "AiSources",
    {
      defaultOpen: open,
      count: n("来源数", 2, 0, 2),
      label: t("标题", "引用来源", true),
    },
    ({ count, ...props }) => (
      <M.AiSources {...props} sources={sources.slice(0, count)} />
    ),
    { remountOn: ["defaultOpen"] },
  ),
  AiInlineCitation: p(
    "AiInlineCitation",
    {
      numbered: f("编号", true),
      index: n("编号数值", 1, 1, 10),
      source: t("来源标题", "项目准备说明", true),
      link: f("链接到来源示例", false, true),
    },
    ({ numbered, index, source, link }) => (
      <p>
        整理前请核对原始记录。{" "}
        <M.AiInlineCitation
          index={numbered ? index : undefined}
          source={{
            id: "source",
            title: source,
            url: link ? "#/components/AiSources?section=ai-sources" : undefined,
          }}
        />
      </p>
    ),
  ),
  AiContext: p(
    "AiContext",
    {
      usedTokens: n("已用词元", 4200, 0, 12000, false, 100),
      maxTokens: n("词元上限", 8000, 1000, 16000, false, 1000),
      metrics: f("分项指标", true, true),
      showCost: f("示例费用", true, true),
    },
    ({ metrics, showCost, ...props }) => (
      <M.AiContext
        {...props}
        inputTokens={metrics ? Math.round(props.usedTokens * 0.75) : undefined}
        outputTokens={
          metrics
            ? props.usedTokens - Math.round(props.usedTokens * 0.75)
            : undefined
        }
        cost={showCost ? "¥0.08（模拟）" : undefined}
      />
    ),
  ),
  AiFileTree: p(
    "AiFileTree",
    {
      expanded: f("初始展开", true),
      selected: f("初始选中文件"),
      empty: f("空目录", false, true),
    },
    ({ expanded, selected, empty }) => (
      <M.AiFileTree
        items={empty ? [] : files}
        defaultExpandedIds={expanded ? ["src"] : []}
        defaultSelectedId={selected ? "index" : undefined}
      />
    ),
    { remountOn: ["expanded", "selected"] },
  ),
  AiStackTrace: p(
    "AiStackTrace",
    {
      defaultOpen: open,
      count: n("堆栈帧数", 2, 0, 2),
      message: t("错误内容", "Error: Missing project name", true),
    },
    ({ count, ...props }) => (
      <M.AiStackTrace {...props} frames={frameList.slice(0, count)} />
    ),
    { remountOn: ["defaultOpen"] },
  ),
  AiTerminal: p(
    "AiTerminal",
    {
      status: c("状态", "success", ["idle", "running", "success", "error"]),
      output: t("输出", "$ npm test\nPASS 3 tests", true),
    },
    (props) => <M.AiTerminal {...props} />,
  ),
  AiTestResults: p(
    "AiTestResults",
    {
      defaultOpen: open,
      status: c("第二条结果", "failed", [
        "passed",
        "failed",
        "skipped",
        "running",
      ]),
      details: f("失败详情", true, true),
    },
    ({ status, details, ...props }) => (
      <M.AiTestResults
        {...props}
        results={[
          { id: "title", name: "保存标题", status: "passed", durationMs: 15 },
          {
            id: "empty",
            name: "空记录提示",
            status,
            details:
              details && status === "failed" ? "期望显示空状态" : undefined,
          },
        ]}
      />
    ),
    { remountOn: ["defaultOpen"] },
  ),
};

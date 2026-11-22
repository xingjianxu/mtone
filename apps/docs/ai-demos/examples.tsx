import { useState } from "react";
import {
  AiChat,
  AiCheckpoint,
  AiConfirmation,
  AiContext,
  AiFileTree,
  AiInlineCitation,
  AiMessage,
  AiModelSelector,
  AiPlan,
  AiPromptInput,
  AiQueue,
  AiReasoning,
  AiSources,
  AiStackTrace,
  AiSubagent,
  AiSuggestion,
  AiTask,
  AiTerminal,
  AiTestResults,
  AiTool,
  Button,
} from "../../../packages/mtone/src";

function DemoAiChat() {
  return (
    <AiChat style={{ height: 180, width: "100%" }} aria-label="项目讨论">
      <AiMessage from="user">下一步做什么？</AiMessage>
      <AiMessage from="assistant">先把待确认事项列出来。</AiMessage>
    </AiChat>
  );
}

function DemoAiMessage() {
  return (
    <AiMessage
      from="assistant"
      status="streaming"
      actions={<Button size="sm">复制（示例）</Button>}
    >
      正在整理记录。
    </AiMessage>
  );
}

function DemoAiPromptInput() {
  const [text, setText] = useState("");
  const [sent, setSent] = useState("");
  return (
    <div style={{ width: "100%" }}>
      <AiPromptInput
        aria-label="演示消息"
        value={text}
        onValueChange={setText}
        onSubmit={(submission) => {
          setSent(submission.text);
          setText("");
        }}
      />
      <p role="status">{sent}</p>
    </div>
  );
}

function DemoAiSuggestion() {
  const [text, setText] = useState("");
  return (
    <div>
      <AiSuggestion prompt="整理项目要点" onSelect={setText}>
        建议：整理项目
      </AiSuggestion>
      <p role="status">{text}</p>
    </div>
  );
}

function DemoAiModelSelector() {
  const [model, setModel] = useState("fast");
  const [effort, setEffort] = useState("normal");
  return (
    <AiModelSelector
      models={[
        { value: "fast", label: "快速（模拟）" },
        { value: "review", label: "审阅（模拟）" },
      ]}
      value={model}
      onValueChange={setModel}
      efforts={[
        { value: "normal", label: "常规" },
        { value: "deep", label: "深入" },
      ]}
      effort={effort}
      onEffortChange={setEffort}
    />
  );
}

function DemoAiPlan() {
  return (
    <AiPlan
      title="整理文档"
      status="running"
      items={[
        { id: "read", title: "读取目录", status: "completed" },
        { id: "write", title: "整理提纲", status: "running" },
      ]}
    />
  );
}

function DemoAiReasoning() {
  return (
    <AiReasoning
      defaultOpen
      status="completed"
      text="只比较发布时间和记录编号，结果仍需人工核对。"
    />
  );
}

function DemoAiTask() {
  return (
    <AiTask
      title="核对版本"
      defaultOpen
      status="running"
      steps={[
        { id: "tag", title: "查看发布标签", status: "completed" },
        { id: "file", title: "比对内容", status: "running" },
      ]}
    />
  );
}

function DemoAiQueue() {
  return (
    <AiQueue
      items={[
        { id: "first", title: "整理目录", status: "completed" },
        { id: "second", title: "检查引用", status: "pending" },
      ]}
    />
  );
}

function DemoAiSubagent() {
  return (
    <AiSubagent
      name="文档校对"
      status="completed"
      defaultOpen
      description="核对目录和页码"
      result="发现一处需要核实的页码。"
    />
  );
}

function DemoAiTool() {
  return (
    <AiTool
      name="检索示例"
      defaultOpen
      status="completed"
      input={JSON.stringify({ keyword: "目录" })}
      output="匹配到 2 条示例记录"
    />
  );
}

function DemoAiCheckpoint() {
  const [restored, setRestored] = useState(false);
  return (
    <div>
      <AiCheckpoint
        label="整理前"
        description="演示检查点"
        onRestore={() => setRestored(true)}
      />
      {restored && <p role="status">已收到恢复请求（模拟）。</p>}
    </div>
  );
}

function DemoAiConfirmation() {
  const [state, setState] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );
  return (
    <AiConfirmation
      title="保存示例摘要？"
      description="仅演示确认界面，不会保存文件。"
      state={state}
      onConfirm={() => setState("approved")}
      onReject={() => setState("rejected")}
    />
  );
}

function DemoAiSources() {
  return (
    <AiSources
      defaultOpen
      sources={[
        { id: "one", title: "项目准备说明", description: "示例来源一" },
        { id: "two", title: "当前文档", url: "#/components/AiSources" },
      ]}
    />
  );
}

function DemoAiInlineCitation() {
  return (
    <p>
      整理前请核对原始记录。{" "}
      <AiInlineCitation
        index={1}
        source={{
          id: "one",
          title: "查看来源示例",
          url: "#/components/AiSources?section=ai-sources",
        }}
      />
    </p>
  );
}

function DemoAiContext() {
  return (
    <AiContext
      usedTokens={4200}
      maxTokens={8000}
      inputTokens={3200}
      outputTokens={1000}
      cost="¥0.08（模拟）"
    />
  );
}

function DemoAiFileTree() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div>
      <AiFileTree
        items={[
          {
            id: "src",
            name: "src",
            kind: "folder",
            children: [
              { id: "main", name: "main.tsx" },
              { id: "test", name: "main.test.tsx" },
            ],
          },
        ]}
        defaultExpandedIds={["src"]}
        selectedId={selected}
        onSelect={setSelected}
      />
      <p role="status">{selected ? "已选：" + selected : "请选择文件"}</p>
    </div>
  );
}

function DemoAiStackTrace() {
  return (
    <AiStackTrace
      defaultOpen
      message="Error: Missing project name"
      frames={[
        {
          file: "src/project.ts",
          line: 24,
          column: 8,
          functionName: "readProject",
        },
      ]}
    />
  );
}

function DemoAiTerminal() {
  return <AiTerminal status="success" output={"$ npm test\nPASS 3 tests"} />;
}

function DemoAiTestResults() {
  return (
    <AiTestResults
      defaultOpen
      results={[
        { id: "one", name: "保存标题", status: "passed", durationMs: 15 },
        {
          id: "two",
          name: "空记录提示",
          status: "failed",
          details: "期望看到空状态提示",
        },
      ]}
    />
  );
}

export const aiExamples: Record<string, React.ComponentType> = {
  AiChat: DemoAiChat,
  AiMessage: DemoAiMessage,
  AiPromptInput: DemoAiPromptInput,
  AiSuggestion: DemoAiSuggestion,
  AiModelSelector: DemoAiModelSelector,
  AiPlan: DemoAiPlan,
  AiReasoning: DemoAiReasoning,
  AiTask: DemoAiTask,
  AiQueue: DemoAiQueue,
  AiSubagent: DemoAiSubagent,
  AiTool: DemoAiTool,
  AiCheckpoint: DemoAiCheckpoint,
  AiConfirmation: DemoAiConfirmation,
  AiSources: DemoAiSources,
  AiInlineCitation: DemoAiInlineCitation,
  AiContext: DemoAiContext,
  AiFileTree: DemoAiFileTree,
  AiStackTrace: DemoAiStackTrace,
  AiTerminal: DemoAiTerminal,
  AiTestResults: DemoAiTestResults,
};

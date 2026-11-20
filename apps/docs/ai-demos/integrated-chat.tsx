import { useEffect, useRef, useState } from "react";
import {
  AiChat,
  AiInlineCitation,
  AiMessage,
  AiModelSelector,
  AiPlan,
  AiPromptInput,
  AiSources,
  AiSuggestion,
  Button,
  type AiPromptAttachment,
  type AiPromptSubmission,
} from "../../../packages/mtone/src";

const source = {
  id: "guide",
  title: "示例：记录整理说明",
  description: "先记录结论，再为每条结论保留出处。",
  url: "#/components/AiSources?section=ai-sources",
};
const response =
  "先梳理记录中的问题、决定和下一步，再把每项结果关联到一条可以核对的来源。";
const models = [
  { value: "fast", label: "快速（模拟）" },
  { value: "review", label: "审阅（模拟）" },
];
type Turn = {
  id: number;
  question: string;
  model: string;
  attachments: readonly AiPromptAttachment[];
  answer: string;
  status: "streaming" | "done" | "stopped";
};

export default function IntegratedChat() {
  const [text, setText] = useState("");
  const [model, setModel] = useState("fast");
  const [attachments, setAttachments] = useState<AiPromptAttachment[]>([]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const serial = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopTimer = () => {
    if (timer.current !== null) clearInterval(timer.current);
    timer.current = null;
  };

  useEffect(() => stopTimer, []);

  const send = ({ text, attachments }: AiPromptSubmission) => {
    if (timer.current !== null) return;
    const id = ++serial.current;
    setTurns((all) => [
      ...all,
      {
        id,
        question: text,
        model,
        attachments,
        answer: "",
        status: "streaming",
      },
    ]);
    setText("");
    setAttachments([]);
    setActive(id);
    let length = 0;
    timer.current = setInterval(() => {
      length += 4;
      const answer = response.slice(0, length);
      const complete = length >= response.length;
      setTurns((all) =>
        all.map((turn) =>
          turn.id === id
            ? { ...turn, answer, status: complete ? "done" : "streaming" }
            : turn,
        ),
      );
      if (complete) {
        stopTimer();
        setActive(null);
      }
    }, 80);
  };

  return (
    <AiChat
      aria-label="模拟 AI 对话"
      style={{ width: "100%", height: 420 }}
      empty={
        <AiMessage from="assistant">输入问题，或点击下面的建议开始。</AiMessage>
      }
      footer={
        <AiPromptInput
          aria-label="模拟对话输入"
          value={text}
          onValueChange={setText}
          status={active === null ? "ready" : "streaming"}
          onSubmit={send}
          onStop={() => {
            stopTimer();
            setTurns((all) =>
              all.map((turn) =>
                turn.id === active ? { ...turn, status: "stopped" } : turn,
              ),
            );
            setActive(null);
          }}
          attachments={attachments}
          onFilesSelect={(files) =>
            setAttachments((all) => [
              ...all,
              ...files.map((file) => ({
                id: String(++serial.current),
                name: file.name,
                size: file.size,
              })),
            ])
          }
          onAttachmentRemove={(id) =>
            setAttachments((all) => all.filter((item) => item.id !== id))
          }
          toolbar={
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AiModelSelector
                models={models}
                value={model}
                onValueChange={setModel}
                disabled={active !== null}
              />
              <AiSuggestion
                prompt="帮我整理一份研究记录"
                onSelect={setText}
                disabled={active !== null}
              >
                试试整理研究记录
              </AiSuggestion>
            </div>
          }
        />
      }
    >
      {turns.map((turn) => (
        <div key={turn.id} style={{ display: "grid", gap: 8 }}>
          <AiMessage from="user">
            {turn.question}
            {turn.attachments.length > 0 && (
              <div>
                附件：{turn.attachments.map((file) => file.name).join("、")}
              </div>
            )}
          </AiMessage>
          <AiMessage
            from="assistant"
            name={models.find((choice) => choice.value === turn.model)?.label}
            status={turn.status === "streaming" ? "streaming" : "idle"}
            actions={
              turn.status === "done" && (
                <Button size="sm" onClick={() => setText(turn.question)}>
                  再次编辑问题
                </Button>
              )
            }
          >
            <AiPlan
              title="记录整理"
              status={
                turn.status === "done"
                  ? "completed"
                  : turn.status === "stopped"
                    ? "cancelled"
                    : "running"
              }
              defaultOpen={false}
              items={[
                { id: "outline", title: "提取可见要点", status: "completed" },
                {
                  id: "write",
                  title: "组织回答",
                  status:
                    turn.status === "done"
                      ? "completed"
                      : turn.status === "stopped"
                        ? "cancelled"
                        : "running",
                },
              ]}
            />
            <p>
              {turn.answer}
              {turn.status === "done" && (
                <>
                  {" "}
                  <AiInlineCitation source={source} index={1} />
                </>
              )}
            </p>
            {turn.status === "done" && <AiSources sources={[source]} />}
            {turn.status === "stopped" && <small>模拟生成已停止。</small>}
          </AiMessage>
        </div>
      ))}
    </AiChat>
  );
}

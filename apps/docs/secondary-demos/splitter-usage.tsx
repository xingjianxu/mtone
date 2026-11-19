import React, { useState } from "react";
import { BookOpen, FileText, RotateCcw } from "lucide-react";
import { Badge, Button, Splitter, Text } from "../../../packages/mtone/src";

const pane: React.CSSProperties = {
  padding: 14,
  display: "grid",
  gap: 10,
  alignContent: "start",
};

/** Local-only demonstration. Layout changes are not persisted. */

export default function Demo() {
  const [generation, setGeneration] = useState(0);
  const [sizes, setSizes] = useState<
    Array<number | `${number}%` | `${number}px`>
  >(["32%", "68%"]);
  const [disabled, setDisabled] = useState(false);
  const [notice, setNotice] = useState(
    "拖动调整大小；双击分隔条或聚焦后按 Enter，循环收起导航、恢复初始比例、收起正文。",
  );
  const [vertical, setVertical] = useState(false);
  const [selection, setSelection] = useState("设计原则");
  return (
    <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: 720 }}>
      <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: 720 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          <Button
            icon={<RotateCcw size={14} />}
            onClick={() => {
              setSizes(["32%", "68%"]);
              setGeneration((value) => value + 1);
              setNotice("已重置为 32% / 68%。");
            }}
          >
            重置分栏
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setSizes(["32%", "68%"]);
              setVertical((value) => !value);
            }}
          >
            {vertical ? "切换横向" : "切换纵向"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setDisabled((value) => !value)}
          >
            {disabled ? "解锁调整" : "锁定分栏"}
          </Button>
          <Badge>受控示例</Badge>
        </div>
        <Splitter
          key={generation + String(vertical)}
          orientation={vertical ? "vertical" : "horizontal"}
          sizes={sizes}
          onResize={setSizes}
          onResizeEnd={(values) =>
            setNotice(
              "调整完成：" +
                values.map((value) => Math.round(value) + "px").join(" / "),
            )
          }
          disabled={disabled}
          style={{
            height: 320,
            border: "1px solid var(--mt-border, #e9e9e7)",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <Splitter.Panel
            id="library"
            label="知识库导航"
            defaultSize="32%"
            min="20%"
            collapsible
          >
            <div style={pane}>
              <strong style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <BookOpen size={16} />
                知识库
              </strong>
              {["设计原则", "组件约定", "版本记录"].map((name) => (
                <Button
                  key={name}
                  variant={selection === name ? "soft" : "ghost"}
                  style={{ justifyContent: "flex-start" }}
                  onClick={() => setSelection(name)}
                >
                  {name}
                </Button>
              ))}
            </div>
          </Splitter.Panel>
          <Splitter.Panel id="document" label="文档正文" min="30%" collapsible>
            <div style={pane}>
              <FileText size={24} aria-hidden="true" />
              <strong>{selection}</strong>
              <Text muted>
                双击分隔条或按 Enter：收起导航 → 恢复初始比例 → 收起正文 →
                再次收起导航。
              </Text>
              <p style={{ margin: 0 }}>
                先保持内容结构清晰，再逐步增加有价值的信息。面板中的交互与布局调整彼此独立。
              </p>
            </div>
          </Splitter.Panel>
        </Splitter>
        <div
          role="status"
          style={{ fontSize: 12, color: "var(--mt-muted, #787774)" }}
        >
          {notice}
        </div>
        <Text muted>
          没有额外折叠按钮，触屏可双击分隔条；拖动后下一次循环从收起导航开始，初始比例仍为
          32% / 68%。布局与文档选择仅影响当前示例，刷新后重置。
        </Text>
      </div>
    </div>
  );
}

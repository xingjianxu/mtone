import { useState } from "react";
import { Button, Calendar } from "../../../packages/mtone/src";

export default function Demo() {
  const [value, setValue] = useState("2026-11-16");
  return (
    <div style={{ display: "grid", gap: 24, width: "100%", minWidth: 0 }}>
      <Calendar
        aria-label="自定义日历"
        defaultValue="2026-11-16"
        fullscreen={false}
        headerRender={({ value: current, type, onChange, onTypeChange }) => (
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <strong>{current.slice(0, 7)}</strong>
            <Button onClick={() => onChange("2026-11-16")}>返回示例日期</Button>
            <Button
              onClick={() => onTypeChange(type === "month" ? "year" : "month")}
            >
              {type === "month" ? "查看全年" : "查看本月"}
            </Button>
          </div>
        )}
        fullCellRender={(date, info) => (
          <span>
            {info.type === "date"
              ? Number(date.slice(-2))
              : `${Number(date.slice(5, 7))}月`}
            {date === "2026-11-16" ? " ★" : ""}
          </span>
        )}
      />
      <p>
        完整单元格渲染只替换按钮内部内容。请勿嵌套链接、按钮或输入框；需要可交互日程请在日历之外展示详情。
      </p>
    </div>
  );
}

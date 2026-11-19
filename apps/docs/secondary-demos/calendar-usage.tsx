import { useState } from "react";
import { Calendar, Text } from "../../../packages/mtone/src";

export default function Demo() {
  const [value, setValue] = useState("2026-11-16");
  const events: Record<string, string> = {
    "2026-11-09": "设计评审",
    "2026-11-16": "版本计划",
    "2026-11-25": "发布检查",
  };
  return (
    <div style={{ display: "grid", gap: 24, width: "100%", minWidth: 0 }}>
      <Calendar
        aria-label="项目日历"
        value={value}
        onChange={setValue}
        showWeek
        cellRender={(date, info) =>
          info.type === "date" && events[date] ? (
            <span>{events[date]}</span>
          ) : null
        }
      />
      <Text data-testid="calendar-value" muted>
        当前日期：{value}
      </Text>
      <p>
        方向键移动焦点，Enter 或空格选择；Page Up / Page Down
        翻页。日程内容仅用于展示，不发送网络请求。
      </p>
    </div>
  );
}

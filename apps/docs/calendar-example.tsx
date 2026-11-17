import React, { useState } from "react";
import { Button, Calendar, Text } from "../../packages/mtone/src";

export function CalendarExample({ compact = false }: { compact?: boolean }) {
  const [value, setValue] = useState("2026-11-16");
  const events: Record<string, string> = {
    "2026-11-09": "设计评审",
    "2026-11-16": "版本计划",
    "2026-11-25": "发布检查",
  };
  return (
    <div style={{ display: "grid", gap: 24, width: "100%", minWidth: 0 }}>
      <section>
        {!compact && <h3>月历与日程内容</h3>}
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
      </section>
      {!compact && (
        <>
          <section>
            <h3>范围限制与卡片模式</h3>
            <div style={{ maxWidth: 420 }}>
              <Calendar
                aria-label="可预约日期"
                fullscreen={false}
                defaultValue="2026-11-16"
                validRange={["2026-11-05", "2026-12-20"]}
                disabledDate={(date) =>
                  [0, 6].includes(new Date(`${date}T12:00:00Z`).getUTCDay())
                }
              />
            </div>
            <p>仅允许 2026-11-05 至 2026-12-20 的工作日；边界包含当天。</p>
          </section>
          <section>
            <h3>年度概览与英文</h3>
            <Calendar
              aria-label="Year overview"
              defaultValue="2026-11-16"
              defaultMode="year"
              locale="en"
              cellRender={(date, info) =>
                info.type === "month" ? (
                  <span>
                    {date.slice(5, 7) === "11" ? "Release month" : "Planning"}
                  </span>
                ) : null
              }
            />
            <p>年视图选择月份后保留年视图；使用头部切换回月视图查看日期。</p>
          </section>
          <section>
            <h3>自定义头部与完整单元格</h3>
            <Calendar
              aria-label="自定义日历"
              defaultValue="2026-11-16"
              fullscreen={false}
              headerRender={({
                value: current,
                type,
                onChange,
                onTypeChange,
              }) => (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <strong>{current.slice(0, 7)}</strong>
                  <Button onClick={() => onChange("2026-11-16")}>
                    返回示例日期
                  </Button>
                  <Button
                    onClick={() =>
                      onTypeChange(type === "month" ? "year" : "month")
                    }
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
          </section>
        </>
      )}
    </div>
  );
}

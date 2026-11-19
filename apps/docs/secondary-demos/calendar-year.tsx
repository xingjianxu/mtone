import { Calendar } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 24, width: "100%", minWidth: 0 }}>
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
    </div>
  );
}

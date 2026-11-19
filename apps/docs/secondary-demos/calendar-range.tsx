import { Calendar } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 24, width: "100%", minWidth: 0 }}>
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
    </div>
  );
}

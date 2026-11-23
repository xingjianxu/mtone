import { Select } from "../../../packages/mtone/src";

const statuses = [
  { value: "all", label: "全部" },
  { value: "active", label: "处理中" },
  { value: "review", label: "等待项目负责人审核" },
];

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "start", width: "100%", minWidth: 0 }}>
      <Select label="按内容设宽" placeholder="状态" options={statuses} defaultValue="all" clearable />
      <div style={{ width: "min(250px, 100%)" }}>
        <style>{".select-demo-fill { width: 100%; }"}</style>
        <Select label="铺满容器" className="select-demo-fill" placeholder="选择状态" options={statuses} />
      </div>
    </div>
  );
}

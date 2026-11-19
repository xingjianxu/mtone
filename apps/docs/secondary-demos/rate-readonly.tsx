import { Rate } from "../../../packages/mtone/src";

const hints = ["不满意", "一般", "还不错", "满意", "非常满意"];

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 24, minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 20,
        }}
      >
        <Rate aria-label="只读评分" disabled defaultValue={4.5} allowHalf />
        <Rate
          aria-label="不可清除评分"
          defaultValue={3}
          allowClear={false}
          tooltips={hints}
        />
      </div>
      <p>
        disabled 保留显示但禁止操作；allowClear=false
        仅禁止通过交互清零，不强制初始值非零。
      </p>
    </div>
  );
}

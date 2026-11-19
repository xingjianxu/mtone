import { AvatarGroup } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <AvatarGroup
        size={32}
        max={3}
        items={[
          { name: "林老师" },
          { name: "陈同学" },
          { name: "王同学" },
          { name: "李同学" },
          { name: "周同学" },
        ]}
      />
      <p>点击 +N 或使用键盘打开其他成员名单。</p>
    </div>
  );
}

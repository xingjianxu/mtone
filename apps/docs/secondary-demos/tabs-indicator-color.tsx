import { MtoneProvider, Tabs, type TabItem } from "../../../packages/mtone/src";

const items: TabItem[] = [
  { value: "overview", label: "概览", content: "项目概览" },
  { value: "history", label: "历史", content: "变更记录" },
];

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Tabs label="主题预设色" items={items} indicatorColor="blue" />
      <Tabs label="自定义 CSS 颜色" items={items} indicatorColor="#b54b81" />
      <MtoneProvider tokens={{ "--mt-accent-teal": "#25686c" }}>
        <Tabs label="应用覆盖主题色" items={items} indicatorColor="teal" />
      </MtoneProvider>
    </div>
  );
}

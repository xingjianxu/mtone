import { Breadcrumb } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Breadcrumb
        items={[
          { label: "首页", href: "#/" },
          { label: "组件", href: "#/components" },
          { label: "Breadcrumb" },
        ]}
      />
    </div>
  );
}

import { Slash } from "lucide-react";
import { Breadcrumb, Text } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Breadcrumb
        separator="/"
        items={[
          { label: "首页", href: "#/" },
          { label: "文档", separator: <Slash size={12} /> },
          { label: "基础", separator: "→" },
          { label: "组件" },
        ]}
      />
      <Text muted>
        支持全局 separator 和单项 separator；单项作用于其后，null 隐藏该分隔符。
      </Text>
    </div>
  );
}

import { useState } from "react";
import { Folder } from "lucide-react";
import { Breadcrumb, Text } from "../../../packages/mtone/src";

export default function Demo() {
  const [project, setProject] = useState("产品设计");
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Breadcrumb
        items={[
          { label: "工作空间", href: "#/" },
          {
            label: project,
            icon: <Folder />,
            menu: {
              items: [
                {
                  key: "design",
                  label: "产品设计",
                  onSelect: () => setProject("产品设计"),
                },
                {
                  key: "engineering",
                  label: "技术文档",
                  onSelect: () => setProject("技术文档"),
                },
                { type: "divider", key: "divider" },
                { key: "archive", label: "已归档", disabled: true },
              ],
            },
          },
          { label: "概览" },
        ]}
      />
      <Text muted>
        复用 Menu 的键盘操作、分组和二级菜单；当前目录：{project}。
      </Text>
    </div>
  );
}

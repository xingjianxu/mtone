import { BookOpen, Folder, Home } from "lucide-react";
import { Breadcrumb } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Breadcrumb
        items={[
          { label: null, icon: <Home />, href: "#/", "aria-label": "首页" },
          { label: "知识库", icon: <Folder />, href: "#/components" },
          { label: "组件规范", icon: <BookOpen /> },
        ]}
      />
    </div>
  );
}

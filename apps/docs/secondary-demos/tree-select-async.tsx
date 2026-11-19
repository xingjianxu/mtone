import { useState } from "react";
import { TreeSelect, type TreeItem } from "../../../packages/mtone/src";

const items: TreeItem[] = [
  {
    id: "design",
    label: "设计资源",
    children: [
      { id: "colors", label: "色彩系统" },
      { id: "type", label: "字体规范" },
      { id: "archived", label: "归档资料（禁用）", disabled: true },
    ],
  },
  {
    id: "research",
    label: "研究资料",
    children: [
      { id: "notes", label: "研究笔记" },
      { id: "reports", label: "项目报告" },
    ],
  },
];

export default function Demo() {
  const [lazy, setLazy] = useState<TreeItem[]>([
    { id: "remote", label: "项目文件", isLeaf: false },
  ]);
  const [loadError, setLoadError] = useState("");
  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 560, width: "100%" }}>
      <TreeSelect
        items={lazy}
        aria-label="异步项目文件"
        allowClear
        loadData={async (node) => {
          setLoadError("");
          await new Promise((resolve) => setTimeout(resolve, 400));
          setLazy((current) =>
            current.map((item) =>
              item.id === node.id
                ? {
                    ...item,
                    children: [
                      { id: "proposal", label: "项目方案", isLeaf: true },
                      { id: "delivery", label: "交付记录", isLeaf: true },
                    ],
                  }
                : item,
            ),
          );
        }}
        onLoadError={() => setLoadError("加载失败，请再次展开重试。")}
      />
      {loadError && <p role="alert">{loadError}</p>}
      <p>
        展开“项目文件”加载子节点。loadData 完成时由应用更新
        items；搜索不会发起远程加载。
      </p>
    </div>
  );
}

import * as React from "react";
import { Tree, type TreeItem } from "../../../packages/mtone/src";

export default function Demo() {
  const [lazy, setLazy] = React.useState<TreeItem[]>([
    { id: "remote", label: "展开加载本地示例", isLeaf: false },
  ]);
  const [loadMessage, setLoadMessage] = React.useState("");
  return (
    <div style={{ display: "grid", gap: 24, width: "100%", minWidth: 0 }}>
      <Tree
        label="异步示例"
        items={lazy}
        loadData={async (node) => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          setLazy((current) =>
            current.map((item) =>
              item.id === node.id
                ? {
                    ...item,
                    children: [
                      {
                        id: "remote-a",
                        label: "已加载：项目说明",
                        isLeaf: true,
                      },
                      {
                        id: "remote-b",
                        label: "已加载：会议记录",
                        isLeaf: true,
                      },
                    ],
                  }
                : item,
            ),
          );
        }}
        onLoad={() => setLoadMessage("子节点已由应用写入 items。")}
        onLoadError={() => setLoadMessage("加载失败，可重新展开重试。")}
      />
      <p>
        {loadMessage ||
          "这是本地延时演示，不发送网络请求。loadData 完成后仍需应用更新数据。"}
      </p>
    </div>
  );
}

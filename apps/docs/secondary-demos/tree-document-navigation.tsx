import { useRef, useState } from "react";
import { BookOpen, FileText, FolderArchive } from "lucide-react";
import { Sidebar, Tag, Text, Tree, type TreeItem, type TreeKey } from "../../../packages/mtone/src";

const initialDocs: TreeItem[] = [
  {
    id: "guide",
    label: "使用指南",
    icon: <BookOpen size={15} />,
    count: 2,
    children: [
      { id: "start", label: "快速开始", icon: <FileText size={15} />, count: 0, isLeaf: true },
      {
        id: "long",
        label: "如何在狭窄侧边栏中整理、维护和查阅标题很长的组件文档",
        icon: "📝",
        count: 12,
        isLeaf: true,
      },
    ],
  },
  { id: "archive", label: "归档文档", icon: <FolderArchive size={15} />, count: 1, isLeaf: false },
];

export default function Demo() {
  const [docs, setDocs] = useState(initialDocs);
  const [selected, setSelected] = useState<TreeKey[]>(["start"]);
  const [current, setCurrent] = useState("快速开始");
  const [message, setMessage] = useState("");
  const attempts = useRef(0);

  return (
    <div style={{ inlineSize: "100%", maxInlineSize: 252, minInlineSize: 0 }}>
      <Sidebar aria-label="文档导航侧栏" header={<strong>项目文档</strong>}>
        <Tree
          label="文档目录"
          items={docs}
          selectedKeys={selected}
          onSelect={(keys, { node }) => {
            setSelected(keys);
            if (keys.length) setCurrent(String(node.label));
          }}
          defaultExpandedKeys={["guide"]}
          defaultLoadedKeys={["guide"]}
          directory
          expandAction={false}
          showLine
          indent={26}
          titleRender={(node) => <span title={String(node.label)}>{node.label}</span>}
          endContent={({ node }) =>
            typeof node.count === "number" ? <Tag>{node.count}</Tag> : null
          }
          loadData={async (node) => {
            // A simulated request shows how the app handles a failure and retry.
            if (node.id !== "archive") return;
            setMessage("正在加载归档文档…");
            await new Promise((resolve) => setTimeout(resolve, 350));
            if (++attempts.current === 1) throw new Error("模拟首次加载失败");
            setDocs((items) => items.map((item) => item.id === node.id
              ? { ...item, children: [{ id: "history", label: "历史版本", icon: "📦", count: 4, isLeaf: true }] }
              : item));
          }}
          onLoad={() => setMessage("归档子节点已由应用写入数据。")}
          onLoadError={() => setMessage("归档加载失败，按右方向键或点击箭头重试。")}
        />
      </Sidebar>
      <Text style={{ marginBlockStart: 8 }} muted>当前文档：{current}</Text>
      <div role="status"><Text muted>{message}</Text></div>
    </div>
  );
}

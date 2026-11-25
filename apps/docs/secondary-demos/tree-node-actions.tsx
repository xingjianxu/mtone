import { useRef, useState, type CSSProperties } from "react";
import { BookOpen, Ellipsis, FileText, Plus } from "lucide-react";
import {
  Button,
  Popover,
  Text,
  Tree,
  type TreeItem,
} from "../../../packages/mtone/src";

const initialNodes: TreeItem[] = [
  {
    id: "manual",
    label: "项目手册",
    icon: <BookOpen size={15} />,
    children: [
      {
        id: "intro",
        label: "快速入门与项目协作流程说明",
        icon: <FileText size={15} />,
        isLeaf: true,
      },
    ],
  },
  {
    id: "references",
    label: "参考资料",
    icon: <BookOpen size={15} />,
    children: [
      {
        id: "resources",
        label: "阅读清单",
        icon: <FileText size={15} />,
        isLeaf: true,
      },
    ],
  },
  {
    id: "desktop",
    label: "从电脑桌面端开始：完整的项目文档、协作流程和发布检查",
    icon: <FileText size={15} />,
    isLeaf: true,
  },
  {
    id: "formatted",
    label: "项目发布记录与团队交接清单",
    isLeaf: true,
  },
];

const compact = { "--mt-height": "24px" } as CSSProperties;

export default function Demo() {
  const [items, setItems] = useState(initialNodes);
  const [pinned, setPinned] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const number = useRef(0);

  function addChild(node: TreeItem) {
    const id = String(++number.current);
    setItems((current) =>
      current.map((item) =>
        item.id === node.id
          ? {
              ...item,
              children: [
                ...(item.children ?? []),
                {
                  id: `new-${id}`,
                  label: `新文档 ${id}`,
                  icon: <FileText size={15} />,
                  isLeaf: true,
                },
              ],
            }
          : item,
      ),
    );
    setMessage(`已在「${String(node.label)}」下添加新文档 ${id}。`);
  }

  return (
    <div style={{ inlineSize: "min(100%, 256px)" }}>
      <Tree
        label="文档节点操作"
        items={items}
        titleRender={(node) =>
          node.id === "formatted" ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <FileText size={14} aria-hidden />
              <span>{node.label}</span>
              <Text muted style={{ fontSize: 11 }}>已更新</Text>
              <a href="#/components/Tree?section=document-navigation">示例</a>
            </span>
          ) : node.label
        }
        directory
        expandAction="click"
        defaultSelectedKeys={["manual"]}
        defaultExpandedKeys={["references"]}
        showLine
        endContent={({ node }) =>
          pinned.includes(String(node.id)) ? (
            <Text muted style={{ fontSize: 11 }}>
              已标记
            </Text>
          ) : null
        }
        actions={({ node }) => [
          {
            visibility: node.id === "manual" ? "always" : undefined,
            content: (
              <Popover.Menu
                trigger={
                  <Button
                    iconOnly
                    size="sm"
                    variant="ghost"
                    style={compact}
                    aria-label={`更多操作：${String(node.label)}`}
                  >
                    <Ellipsis size={15} aria-hidden />
                  </Button>
                }
                items={[
                  {
                    key: "pin",
                    label: pinned.includes(String(node.id))
                      ? "取消标记"
                      : "标记为常用",
                  },
                ]}
                onSelect={() => {
                  const id = String(node.id);
                  const wasPinned = pinned.includes(id);
                  setPinned((current) =>
                    wasPinned
                      ? current.filter((key) => key !== id)
                      : [...current, id],
                  );
                  setMessage(
                    `「${String(node.label)}」${wasPinned ? "已取消标记" : "已标记为常用"}。`,
                  );
                }}
              />
            ),
          },
          ...(!node.isLeaf
            ? [
                {
                  visibility: "active" as const,
                  content: (
                    <Button
                      iconOnly
                      size="sm"
                      variant="ghost"
                      style={compact}
                      aria-label={`添加子文档：${String(node.label)}`}
                      onClick={() => addChild(node)}
                    >
                      <Plus size={15} aria-hidden />
                    </Button>
                  ),
                },
              ]
            : []),
        ]}
      />
      <div role="status" style={{ minBlockSize: 20, marginBlockStart: 8 }}>
        <Text muted>{message}</Text>
      </div>
    </div>
  );
}

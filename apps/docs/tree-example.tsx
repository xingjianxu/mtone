import * as React from "react";
import {
  Button,
  Input,
  Tree,
  DirectoryTree,
  type TreeItem,
  type TreeKey,
  type TreeRef,
} from "../../packages/mtone/src";
import { FileText, Folder } from "lucide-react";

const documents: TreeItem[] = [
  {
    id: "root",
    label: "知识库",
    children: [
      {
        id: "design",
        label: "设计规范",
        children: [
          { id: "color", label: "色彩系统" },
          { id: "type", label: "字体规范" },
        ],
      },
      { id: "research", label: "研究笔记" },
      { id: "locked", label: "归档资料（禁用）", disabled: true },
    ],
  },
];
const many: TreeItem[] = Array.from({ length: 1000 }, (_, i) => ({
  id: `doc-${i}`,
  label: `文档 ${String(i + 1).padStart(4, "0")}`,
}));

export function TreeExample({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = React.useState<TreeKey[]>(["research"]);
  const [checked, setChecked] = React.useState<TreeKey[]>(["color"]);
  const [strict, setStrict] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [lazy, setLazy] = React.useState<TreeItem[]>([
    { id: "remote", label: "展开加载本地示例", isLeaf: false },
  ]);
  const [loadMessage, setLoadMessage] = React.useState("");
  const [dragItems, setDragItems] = React.useState<TreeItem[]>([
    { id: "draft", label: "草稿" },
    { id: "review", label: "评审" },
    { id: "done", label: "完成" },
  ]);
  const [dropMessage, setDropMessage] =
    React.useState("拖到条目前后可调整顺序。");
  const treeRef = React.useRef<TreeRef>(null);
  if (compact)
    return (
      <Tree
        items={documents}
        defaultExpanded={["root", "design"]}
        defaultValue="research"
        showLine
      />
    );
  return (
    <div style={{ display: "grid", gap: 24, width: "100%", minWidth: 0 }}>
      <section>
        <h3>受控多选与连线</h3>
        <Tree
          label="多选知识库"
          items={documents}
          defaultExpandAll
          multiple
          selectedKeys={selected}
          onSelect={setSelected}
          showLine
          showIcon
          icon={({ node }) =>
            node.children ? <Folder size={15} /> : <FileText size={15} />
          }
        />
        <p>
          已选：{selected.join("、") || "无"}。普通 Tree
          多选时点击切换选中状态。
        </p>
      </section>
      <section>
        <h3>级联勾选与独立勾选</h3>
        <Button
          onClick={() => {
            setStrict(!strict);
            setChecked([]);
          }}
        >
          切换为{strict ? "级联" : "独立"}勾选
        </Button>
        <Tree
          style={{ marginTop: 8 }}
          label="勾选资料"
          items={documents}
          defaultExpandAll
          checkable
          checkStrictly={strict}
          checkedKeys={checked}
          onCheck={(keys) =>
            setChecked(Array.isArray(keys) ? keys : keys.checked)
          }
        />
        <p>
          {strict
            ? "父子节点分别勾选。"
            : "父子节点自动关联，部分选中时显示半选。"}
          已勾选：{checked.join("、") || "无"}。
        </p>
      </section>
      <section>
        <h3>搜索高亮</h3>
        <Input
          aria-label="搜索树节点"
          placeholder="输入“设计”或“字体”"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Tree
          label="搜索结果高亮"
          style={{ marginTop: 8 }}
          items={documents}
          defaultExpandAll
          filterTreeNode={(node) =>
            !!query.trim() && String(node.label).includes(query.trim())
          }
        />
        <p>高亮只标记命中节点，不过滤数据；需要过滤时由应用生成新的 items。</p>
      </section>
      <section>
        <h3>目录模式</h3>
        <DirectoryTree
          label="目录选择"
          items={documents}
          multiple
          defaultExpandedKeys={["root"]}
          expandAction="doubleClick"
        />
        <p>
          双击目录展开；Ctrl / Command 点击追加选择，Shift 点击选择可见区间。
        </p>
      </section>
      <section>
        <h3>异步加载</h3>
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
      </section>
      <section>
        <h3>虚拟滚动与定位</h3>
        <Button
          onClick={() =>
            treeRef.current?.scrollTo({ key: "doc-899", align: "top" })
          }
        >
          定位第 900 条
        </Button>
        <Tree
          ref={treeRef}
          label="一千条文档"
          items={many}
          height={180}
          itemHeight={30}
          style={{
            marginTop: 8,
            border: "1px solid var(--mt-border, #e5e5e3)",
            borderRadius: 6,
          }}
        />
        <p>使用固定行高。方向键及 Home / End 可跨虚拟窗口移动。</p>
      </section>
      <section>
        <h3>拖放排序</h3>
        <Tree
          label="拖动调整流程"
          items={dragItems}
          draggable
          allowDrop={({ dropPosition }) => dropPosition !== 0}
          onDrop={({ dragNode, node, dropPosition }) => {
            setDragItems((current) => {
              const moving = current.find((item) => item.id === dragNode.id);
              if (!moving) return current;
              const next = current.filter((item) => item.id !== dragNode.id);
              const at = next.findIndex((item) => item.id === node.id);
              if (at < 0) return current;
              next.splice(at + (dropPosition === 1 ? 1 : 0), 0, moving);
              return next;
            });
            setDropMessage(
              `已将“${dragNode.label}”移到“${node.label}”${dropPosition === -1 ? "前" : "后"}。`,
            );
          }}
        />
        <p aria-live="polite">{dropMessage}</p>
        <p>此例由 onDrop 更新 items；Tree 只报告拖放意图，不修改传入数据。</p>
      </section>
    </div>
  );
}

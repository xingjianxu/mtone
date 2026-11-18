import React, { useState } from "react";
import {
  TreeSelect,
  type TreeItem,
  type TreeKey,
} from "../../packages/mtone/src";

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
export function TreeSelectExample({ compact = false }: { compact?: boolean }) {
  const [value, setValue] = useState<TreeKey | null>(null);
  const [multiple, setMultiple] = useState<TreeKey[]>(["colors"]);
  const [lazy, setLazy] = useState<TreeItem[]>([
    { id: "remote", label: "项目文件", isLeaf: false },
  ]);
  const [loadError, setLoadError] = useState("");
  const basic = (
    <TreeSelect
      items={items}
      value={value}
      onValueChange={setValue}
      aria-label="资料分类"
      placeholder="选择一个分类或资料"
      defaultExpandAll
      allowClear
    />
  );
  if (compact) return basic;
  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 560, width: "100%" }}>
      <section>
        <h3>单选与清空</h3>
        {basic}
        <p>当前值：{value ?? "未选择"}。父节点和叶节点均可选择。</p>
      </section>
      <section>
        <h3>多选与父子联动</h3>
        <TreeSelect
          items={items}
          multiple
          value={multiple}
          onValueChange={setMultiple}
          aria-label="多选资料"
          defaultExpandAll
          allowClear
          showCheckedStrategy="parent"
          maxTagCount={3}
        />
        <p>
          选中父节点会勾选其可用后代，禁用节点不参与联动。标签合并展示父级，不改变回调中的全部勾选键。
        </p>
        <small>勾选键：{JSON.stringify(multiple)}</small>
      </section>
      <section>
        <h3>搜索节点</h3>
        <TreeSelect
          items={items}
          searchable
          multiple
          aria-label="搜索资料"
          placeholder="搜索并勾选资料"
          allowClear
          showCheckedStrategy="leaf"
        />
        <p>
          搜索保留匹配节点及祖先。筛选期间勾选父级仍按完整数据联动，不会只选择当前可见结果。
        </p>
      </section>
      <section>
        <h3>独立勾选</h3>
        <TreeSelect
          items={items}
          multiple
          checkStrictly
          aria-label="独立选择资料"
          defaultExpandAll
          allowClear
          defaultValue={["design"]}
        />
        <p>父子节点互不影响，适合每个层级都是独立选项的场景。</p>
      </section>
      <section>
        <h3>异步加载</h3>
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
      </section>
      <section>
        <h3>禁用与校验状态</h3>
        <div style={{ display: "grid", gap: 8 }}>
          <TreeSelect
            items={items}
            aria-label="禁用树选择"
            disabled
            defaultValue="colors"
          />
          <TreeSelect
            items={items}
            aria-label="只读树选择"
            readOnly
            defaultValue="notes"
          />
          <TreeSelect
            items={items}
            aria-label="错误状态树选择"
            status="error"
            placeholder="请选择资料"
          />
          <TreeSelect
            items={items}
            aria-label="小尺寸树选择"
            size="sm"
            placeholder="小尺寸"
          />
        </div>
      </section>
      <p>
        键盘：上下键移动，左右键展开或折叠，Enter / 空格选择，Escape
        关闭弹层并返回触发器。
      </p>
    </div>
  );
}

import React, { useState } from "react";
import { Tabs, Button, type TabItem } from "../../packages/mtone/src";
import { FileText, Settings } from "lucide-react";
export function TabsExample({ compact = false }: { compact?: boolean }) {
  const [items, setItems] = useState<TabItem[]>([
    {
      value: "notes",
      label: "笔记",
      icon: <FileText />,
      content: <input className="mt-input" placeholder="切换后保留输入" />,
    },
    {
      value: "settings",
      label: "设置",
      icon: <Settings />,
      content: "设置面板",
    },
    { value: "locked", label: "只读", content: "不可关闭", closable: false },
  ]);
  const [value, setValue] = useState("notes");
  const [count, setCount] = useState(1);
  const base = [
    { value: "overview", label: "概览", content: "项目内容概览" },
    { value: "history", label: "历史", content: "变更记录" },
    { value: "disabled", label: "未开放", content: "", disabled: true },
  ];
  if (compact) return <Tabs items={base} />;
  return (
    <div style={{ display: "grid", gap: 24, minWidth: 0 }}>
      <section>
        <h3>基础与附加操作</h3>
        <Tabs items={base} extraEnd={<Button size="sm">操作</Button>} />
      </section>
      <section>
        <h3>编辑与排序</h3>
        <p>
          卡片标签项外高32px（含边框），默认文字与图标均为14px，文字与图标间距6px；顶部圆角，底部直角。关闭/新增由应用更新 items；Alt+Shift+方向键可调整顺序。切换保留输入。
        </p>
        <Tabs
          items={items}
          value={value}
          onValueChange={setValue}
          variant="editable-card"
          destroyOnHidden={false}
          reorderable
          onOrderChange={(values) =>
            setItems(values.map((v) => items.find((i) => i.value === v)!))
          }
          onEdit={(action, key) => {
            if (action === "add") {
              const id = `new-${count}`;
              setCount(count + 1);
              setItems([
                ...items,
                {
                  value: id,
                  label: `新标签 ${count}`,
                  content: `新内容 ${count}`,
                },
              ]);
              setValue(id);
            } else {
              const next = items.filter((i) => i.value !== key);
              setItems(next);
              if (value === key) setValue(next[0]?.value ?? "");
            }
          }}
        />
      </section>
      <section>
        <h3>位置与尺寸</h3>
        {(["top", "bottom", "start", "end"] as const).map((placement) => (
          <div key={placement} style={{ marginBottom: 20 }}>
            <Tabs
              label={`${placement} 标签`}
              items={base}
              placement={placement}
              size="small"
            />
          </div>
        ))}
      </section>
      <section>
        <h3>溢出导航</h3>
        <Tabs
          items={Array.from({ length: 16 }, (_, n) => ({
            value: String(n),
            label: `文档 ${n + 1}`,
            content: `第 ${n + 1} 个文档`,
          }))}
        />
      </section>
    </div>
  );
}

import { useState } from "react";
import { Tabs, type TabItem } from "../../../packages/mtone/src";
import { FileText, Settings } from "lucide-react";

export default function Demo() {
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
  return (
    <div style={{ display: "grid", gap: 24, minWidth: 0 }}>
      <p>
        默认卡片外框高28px，14px文字与图标、间距6px；顶部圆角，底部直角。关闭/新增由应用更新
        items；Alt+Shift+方向键可调整顺序。切换保留输入。
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
    </div>
  );
}

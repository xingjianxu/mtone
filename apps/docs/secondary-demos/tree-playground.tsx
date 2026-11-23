import { useState } from "react";
import { BookOpen, FileText, Folder } from "lucide-react";
import {
  Button,
  NumberInput,
  Switch,
  Text,
  Tree,
  type TreeItem,
  type TreeKey,
} from "../../../packages/mtone/src";

const items: TreeItem[] = [
  {
    id: "docs",
    label: "项目文档",
    icon: <BookOpen size={15} />,
    children: [
      { id: "start", label: "快速开始", icon: <FileText size={15} /> },
      {
        id: "design",
        label: "组件设计",
        icon: <Folder size={15} />,
        children: [
          { id: "styles", label: "样式规范", icon: <FileText size={15} /> },
          {
            id: "accessibility",
            label: "可访问性",
            icon: <FileText size={15} />,
          },
        ],
      },
    ],
  },
  { id: "release", label: "发布记录", icon: <FileText size={15} /> },
];

const defaults = {
  showLine: false,
  showIcon: true,
  checkable: false,
  multiple: false,
  itemHeight: 32,
  gap: 2,
};
const toggles = [
  ["showLine", "连接线"],
  ["showIcon", "节点图标"],
  ["checkable", "复选框"],
  ["multiple", "多选"],
] as const;

export default function Demo() {
  const [options, setOptions] = useState(defaults);
  const [selected, setSelected] = useState<TreeKey[]>([]);
  const [resetKey, setResetKey] = useState(0);

  function reset() {
    setOptions(defaults);
    setSelected([]);
    setResetKey((key) => key + 1);
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        width: "min(100%, 34rem)",
        minWidth: 0,
      }}
    >
      <div
        role="group"
        aria-label="树形配置"
        style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px" }}
      >
        {toggles.map(([key, label]) => (
          <Switch
            key={key}
            label={label}
            checked={options[key]}
            onCheckedChange={(checked) => {
              setOptions((current) => ({ ...current, [key]: checked }));
              if (key === "multiple" && !checked)
                setSelected((keys) => keys.slice(0, 1));
            }}
          />
        ))}
      </div>
      <div
        role="group"
        aria-label="节点尺寸"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px 12px",
          alignItems: "end",
        }}
      >
        {(
          [
            ["itemHeight", "行高（px）", 24, 56],
            ["gap", "间距（px）", 0, 16],
          ] as const
        ).map(([key, label, min, max]) => (
          <div key={key} style={{ display: "grid", gap: 4, width: 104 }}>
            <Text muted>{label}</Text>
            <NumberInput
              label={label}
              value={options[key]}
              min={min}
              max={max}
              onValueChange={(value) => {
                if (value !== null)
                  setOptions((current) => ({ ...current, [key]: value }));
              }}
            />
          </div>
        ))}
        <Button variant="ghost" onClick={reset}>
          恢复默认
        </Button>
      </div>
      <div
        style={{
          minWidth: 0,
          border: "1px solid var(--mt-border)",
          borderRadius: 8,
          padding: 6,
        }}
      >
        <Tree
          {...options}
          key={resetKey}
          label="树形配置预览"
          items={items}
          defaultExpandedKeys={["docs", "design"]}
          selectedKeys={selected}
          onSelect={setSelected}
          height={224}
        />
      </div>
    </div>
  );
}

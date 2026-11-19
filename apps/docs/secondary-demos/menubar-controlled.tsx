import { useState } from "react";
import { FileText, FolderOpen, Save } from "lucide-react";
import {
  Button,
  Menubar,
  Text,
  type MenubarMenu,
} from "../../../packages/mtone/src";

export default function Demo() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [sidebar, setSidebar] = useState(true);
  const [density, setDensity] = useState("compact");
  const [notice, setNotice] = useState("选择菜单命令，或用方向键浏览。");
  const menus: MenubarMenu[] = [
    {
      key: "file",
      label: "文件",
      items: [
        {
          type: "group",
          key: "document",
          label: "文档",
          children: [
            {
              key: "new",
              label: "新建文档",
              icon: <FileText />,
              shortcut: "⌘N",
              onSelect: () => setNotice("已选择：新建文档"),
            },
            {
              key: "recent",
              label: "最近打开",
              icon: <FolderOpen />,
              children: [
                {
                  key: "design",
                  label: "设计规范",
                  onSelect: () => setNotice("已选择：设计规范"),
                },
                {
                  key: "notes",
                  label: "会议记录",
                  onSelect: () => setNotice("已选择：会议记录"),
                },
              ],
            },
            {
              key: "save",
              label: "保存",
              icon: <Save />,
              shortcut: "⌘S",
              onSelect: () => setNotice("已选择：保存"),
            },
          ],
        },
        { type: "divider", key: "separator" },
        {
          key: "export",
          label: "导出",
          children: [
            {
              key: "markdown",
              label: "Markdown",
              onSelect: () => setNotice("已选择：导出 Markdown"),
            },
            { key: "pdf", label: "PDF（不可用）", disabled: true },
          ],
        },
        {
          key: "delete",
          label: "移至回收站",
          danger: true,
          onSelect: () => setNotice("已选择：移至回收站（演示，不删除数据）"),
        },
      ],
    },
    {
      key: "edit",
      label: "编辑",
      items: [
        {
          key: "undo",
          label: "撤销",
          shortcut: "⌘Z",
          onSelect: () => setNotice("已选择：撤销"),
        },
        { key: "redo", label: "重做", shortcut: "⇧⌘Z", disabled: true },
        { type: "divider", key: "separator" },
        {
          key: "copy",
          label: "复制",
          shortcut: "⌘C",
          onSelect: () => setNotice("已选择：复制"),
        },
      ],
    },
    {
      key: "view",
      label: "视图",
      width: 220,
      items: [
        {
          type: "checkbox",
          key: "sidebar",
          label: "显示侧边栏",
          checked: sidebar,
          onCheckedChange: setSidebar,
        },
        { type: "divider", key: "separator" },
        {
          type: "radio-group",
          key: "density",
          label: "内容密度",
          value: density,
          onValueChange: setDensity,
          children: [
            { key: "compact", label: "紧凑" },
            { key: "comfortable", label: "舒适" },
          ],
        },
      ],
    },
    { key: "collaborate", label: "协作", disabled: true, items: [] },
  ];
  return (
    <div
      style={{
        display: "grid",
        gap: 20,
        width: "100%",
        maxWidth: 560,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Button onClick={() => setOpenKey("file")}>打开文件菜单</Button>
        <Button onClick={() => setOpenKey(null)}>关闭菜单</Button>
        <Text muted>当前：{openKey ?? "全部关闭"}</Text>
      </div>
      <Menubar
        aria-label="受控菜单"
        menus={menus.slice(0, 2)}
        openKey={openKey}
        onOpenChange={setOpenKey}
        width={220}
        align="right"
      />
    </div>
  );
}

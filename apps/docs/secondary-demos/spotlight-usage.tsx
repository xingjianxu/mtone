import { useState } from "react";
import { BookOpen, Plus, Search, Settings } from "lucide-react";
import { Button, Spotlight, Text } from "../../../packages/mtone/src";

export default function Demo() {
  const [page, setPage] = useState("知识库");
  const [drafts, setDrafts] = useState(0);
  const [result, setResult] = useState("尚未执行操作");
  return (
    <div style={{ display: "grid", gap: 10, maxWidth: 460 }}>
      <div style={{ display: "grid", gap: 10, maxWidth: 460 }}>
        <Spotlight
          shortcut={false}
          title="工作空间快捷操作"
          placeholder="搜索：知识库、设置、新建、create…"
          trigger={<Button icon={<Search size={15} />}>搜索页面与操作</Button>}
          nothingFound={<Text muted>没有匹配项，试试“新建”或“设置”。</Text>}
          actions={[
            {
              id: "library",
              label: "打开知识库",
              description: "切换当前示例页面",
              keywords: ["文档", "library"],
              group: "页面",
              icon: <BookOpen size={17} />,
              onSelect: () => setPage("知识库"),
            },
            {
              id: "settings",
              label: "打开设置",
              description: "查看本地设置示例",
              keywords: "settings",
              group: "页面",
              icon: <Settings size={17} />,
              onSelect: () => setPage("设置"),
            },
            {
              id: "create",
              label: "新建草稿",
              description: "增加一个本地示例草稿",
              keywords: ["create", "new"],
              group: "操作",
              icon: <Plus size={17} />,
              rightSection: "本地",
              onSelect: () => setDrafts((value) => value + 1),
            },
            {
              id: "publish",
              label: "发布到团队",
              description: "当前示例不可用",
              group: "操作",
              disabled: true,
            },
          ]}
          onActionSelect={(action) => setResult(`已执行：${action.label}`)}
        />
        <div role="status" style={{ fontSize: 12, lineHeight: 1.6 }}>
          当前页面：{page} · 草稿数：{drafts}
          <br />
          {result}
        </div>
        <Text muted>
          输入不存在的关键词可查看空状态。此示例禁用全局快捷键，操作只更新本地状态。
        </Text>
      </div>
    </div>
  );
}

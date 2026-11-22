import { useState } from "react";
import {
  Tag,
  Button,
  DataList,
  Select,
  Text,
} from "../../../packages/mtone/src";

const records = [
  {
    id: "guide",
    title: "知识库使用指南",
    status: "active",
    detail: "介绍目录、搜索及版本记录。",
  },
  {
    id: "notes",
    title: "研究笔记",
    status: "active",
    detail: "整理研究问题、素材与下一步计划。",
  },
  {
    id: "design",
    title: "组件设计规范",
    status: "active",
    detail: "涵盖组件样式、键盘操作及可访问名称。",
  },
  {
    id: "archive",
    title: "旧版发布记录",
    status: "archived",
    detail: "归档记录可以查看，但不可批量选择。",
  },
] as const;
const statuses = [
  { value: "all", label: "全部状态" },
  { value: "active", label: "使用中" },
  { value: "archived", label: "已归档" },
];

export default function LocalDataListDemo() {
  const [status, setStatus] = useState("all");
  const [notice, setNotice] = useState("");
  return (
    <div style={{ width: "100%", maxWidth: 680, display: "grid", gap: 8 }}>
      <DataList
        aria-label="本地文档列表"
        items={records}
        getKey={(item) => item.id}
        getLabel={(item) => item.title}
        search={{
          placeholder: "搜索文档标题",
          match: (item, query) =>
            item.title.toLowerCase().includes(query.trim().toLowerCase()),
        }}
        filters={
          <Select
            label="文档状态"
            options={statuses}
            value={status}
            onValueChange={(value) => setStatus(value ?? "all")}
          />
        }
        filter={(item) => status === "all" || item.status === status}
        toolbar={<Text>文档管理</Text>}
        pagination={{ pageSize: 2 }}
        selection={{ getDisabled: (item) => item.status === "archived" }}
        renderBatchActions={({ selectedKeys, clearSelection }) => (
          <Button
            onClick={() => {
              setNotice(`已处理 ${selectedKeys.length} 个选中条目（演示）`);
              clearSelection();
            }}
          >
            批量处理
          </Button>
        )}
        expansion={{ renderDetail: (item) => <Text muted>{item.detail}</Text> }}
        renderItem={(item) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <Text>{item.title}</Text>
            <Tag>{item.status === "active" ? "使用中" : "已归档"}</Tag>
          </div>
        )}
        renderActions={(item) => (
          <Button
            size="sm"
            aria-label={`预览 ${item.title}`}
            onClick={() => setNotice(`预览：${item.title}`)}
          >
            预览
          </Button>
        )}
      />
      <Text role="status" muted>
        {notice}
      </Text>
    </div>
  );
}

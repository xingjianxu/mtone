import { useState } from "react";
import { CircleCheck, CircleDot, List, Rows3 } from "lucide-react";
import {
  Button,
  DataList,
  Select,
  Tag,
  Text,
} from "../../../packages/mtone/src";

const issues = [
  {
    id: 24,
    title: "补充报告导出预览",
    type: "enhancement",
    owner: "林澈",
    open: true,
  },
  {
    id: 21,
    title: "修正窄屏下的日期换行",
    type: "task",
    owner: "余晓",
    open: true,
  },
  {
    id: 18,
    title: "整理首次使用说明",
    type: "task",
    owner: "林澈",
    open: false,
  },
] as const;
const statuses = [
  { value: "open", label: "待处理（2）" },
  { value: "closed", label: "已完成（1）" },
  { value: "all", label: "全部状态（3）" },
];

export default function IssueListDemo() {
  const [status, setStatus] = useState("open");
  const [compact, setCompact] = useState(false);

  return (
    <div style={{ width: "100%", maxWidth: 760 }}>
      <DataList
        aria-label="事项列表"
        items={issues}
        getKey={(item) => item.id}
        getLabel={(item) => item.title}
        selection={{}}
        filter={(item) => status === "all" || item.open === (status === "open")}
        filters={
          <Select
            label="事项状态"
            options={statuses}
            value={status}
            onValueChange={(value) => setStatus(value ?? "all")}
          />
        }
        toolbar={
          <div
            role="group"
            aria-label="事项列表视图"
            style={{ display: "flex", gap: 2 }}
          >
            <Button
              iconOnly
              variant={compact ? "ghost" : "soft"}
              aria-pressed={!compact}
              aria-label="详细视图"
              onClick={() => setCompact(false)}
            >
              <Rows3 size={16} />
            </Button>
            <Button
              iconOnly
              variant={compact ? "soft" : "ghost"}
              aria-pressed={compact}
              aria-label="紧凑视图"
              onClick={() => setCompact(true)}
            >
              <List size={16} />
            </Button>
          </div>
        }
        renderItem={(item) => {
          const Status = item.open ? CircleDot : CircleCheck;
          return (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <Status
                size={16}
                aria-label={item.open ? "待处理" : "已完成"}
                role="img"
                style={{
                  flex: "none",
                  marginTop: 2,
                  color: item.open ? "var(--mt-success)" : "var(--mt-muted)",
                }}
              />
              <div style={{ minWidth: 0, display: "grid", gap: 4 }}>
                <strong>{item.title}</strong>
                {!compact && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Tag tone={item.type === "enhancement" ? "blue" : "orange"}>
                      {item.type === "enhancement" ? "改进" : "任务"}
                    </Tag>
                    <Text muted>
                      #{item.id} · {item.owner}
                    </Text>
                  </div>
                )}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}

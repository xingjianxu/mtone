import { useState } from "react";
import { LayoutGrid, Rows3 } from "lucide-react";
import { Button, ButtonGroup, Select, Tag, Text, Toolbar } from "../../../packages/mtone/src";

const owners = [
  { value: "all", label: "负责人" },
  { value: "me", label: "仅看我的" },
  { value: "team", label: "团队负责" },
];
const labels = [
  { value: "all", label: "标签" },
  { value: "bug", label: "缺陷" },
  { value: "feature", label: "功能" },
];

export default function Demo() {
  const [status, setStatus] = useState<"open" | "closed">("open");
  const [owner, setOwner] = useState("all");
  const [label, setLabel] = useState("all");
  const [view, setView] = useState<"list" | "grid">("list");

  return (
    <div style={{ width: "100%", minWidth: 0, display: "grid", gap: 8 }}>
      <Toolbar
        aria-label="事项筛选与视图"
        start={<>
          <Button aria-pressed={status === "open"} onClick={() => setStatus("open")} rightSection={<Tag>8</Tag>}>待处理</Button>
          <Button aria-pressed={status === "closed"} onClick={() => setStatus("closed")} rightSection={<Tag>12</Tag>}>已完成</Button>
          <Select label="按负责人筛选" options={owners} value={owner} onValueChange={(value) => setOwner(value ?? "all")} />
          <Select label="按标签筛选" options={labels} value={label} onValueChange={(value) => setLabel(value ?? "all")} />
        </>}
        end={
          <ButtonGroup connected aria-label="事项视图">
            <Button iconOnly aria-label="列表视图" aria-pressed={view === "list"}
              variant={view === "list" ? "soft" : "outline"} onClick={() => setView("list")}>
              <Rows3 size={16} aria-hidden="true" />
            </Button>
            <Button iconOnly aria-label="网格视图" aria-pressed={view === "grid"}
              variant={view === "grid" ? "soft" : "outline"} onClick={() => setView("grid")}>
              <LayoutGrid size={16} aria-hidden="true" />
            </Button>
          </ButtonGroup>
        }
      />
      <Text muted role="status">
        {status === "open" ? "待处理" : "已完成"} · {owner === "all" ? "全部负责人" : owners.find(({ value }) => value === owner)?.label}
        {" · "}{label === "all" ? "全部标签" : labels.find(({ value }) => value === label)?.label}
        {" · "}{view === "list" ? "列表视图" : "网格视图"}
      </Text>
    </div>
  );
}

import { useState } from "react";
import { Ellipsis, Folder, Pencil, Star } from "lucide-react";
import { IconButton, NavGroup, NavItem } from "../../../packages/mtone/src";

export default function Demo() {
  const [current, setCurrent] = useState("研究资料");
  const [operation, setOperation] = useState("");
  return (
    <div style={{ width: "min(100%, 280px)" }}>
      <NavGroup label="工作空间">
        {["研究资料", "阅读记录"].map((label) => <NavItem
          key={label}
          active={current === label}
          icon={<Folder size={16} aria-hidden="true" />}
          onClick={() => setCurrent(label)}
          actions={[
            { content: <IconButton size="sm" variant="ghost" aria-label={`更多操作：${label}`} onClick={() => setOperation(`更多操作：${label}`)}><Ellipsis size={15} /></IconButton> },
            { visibility: "hover", content: <IconButton size="sm" variant="ghost" aria-label={`编辑：${label}`} onClick={() => setOperation(`编辑：${label}`)}><Pencil size={14} /></IconButton> },
            { visibility: "active", content: <IconButton size="sm" variant="ghost" aria-label={`收藏：${label}`} onClick={() => setOperation(`收藏：${label}`)}><Star size={14} /></IconButton> },
          ]}
        >{label}</NavItem>)}
      </NavGroup>
      <output style={{ display: "block", minHeight: 20, marginTop: 8 }}>{operation}</output>
    </div>
  );
}

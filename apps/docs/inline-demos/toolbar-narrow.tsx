import { useState } from "react";
import { Download, Plus } from "lucide-react";
import { Button, Input, Popover, Status, Table, Toolbar } from "../../../packages/mtone/src";

const initialRows = [
  { id: 1, name: "组件文档整理", status: "进行中" },
  { id: 2, name: "界面规范更新", status: "已完成" },
];
const statuses = ["全部状态", "进行中", "已完成"];

export default function Demo() {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(statuses[0]);
  const shown = rows.filter((row) => row.name.includes(query.trim()) && (status === statuses[0] || row.status === status));
  return (
    <div style={{ width: 344, maxWidth: "100%", border: "1px solid var(--mt-border)", borderRadius: 8 }}>
      <Toolbar
        aria-label="窄容器项目操作"
        background="gray"
        search={<Input.Search aria-label="搜索项目" placeholder="搜索项目" value={query} onChange={(event) => setQuery(event.target.value)} />}
        start={<Popover.Menu trigger={status === statuses[0] ? "状态" : status} items={statuses.map((key) => ({ key, label: key }))} onSelect={setStatus} />}
        end={<>
          <Button render={<a download="projects.csv" href={"data:text/csv;charset=utf-8," + encodeURIComponent(shown.map((row) => [row.name, row.status].join(",")).join("\n"))} />}
            nativeButton={false} leftSection={<Download size={16} aria-hidden="true" />}>导出</Button>
          <Button variant="solid" leftSection={<Plus size={16} aria-hidden="true" />} onClick={() => {
            setRows((current) => [...current, { id: current.length + 1, name: `新项目 ${current.length - 1}`, status: "进行中" }]);
            setQuery("");
            setStatus(statuses[0]);
          }}>新建</Button>
        </>}
      />
      <Table rowKey="id" rowSelection={{}} pagination={false} dataSource={shown}
        columns={[
          { title: "项目名称", dataIndex: "name" },
          { title: "状态", dataIndex: "status", render: (value: string) => <Status tone={value === "进行中" ? "blue" : "green"}>{value}</Status> },
        ]}
      />
    </div>
  );
}

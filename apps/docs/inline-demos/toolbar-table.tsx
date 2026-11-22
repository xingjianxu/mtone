import { useState } from "react";
import { Download, Plus } from "lucide-react";
import { Button, Input, Popover, Status, Table, Toolbar } from "../../../packages/mtone/src";

const initialProjects = [
  { id: 1, name: "组件文档整理", owner: "林杉", status: "进行中", updated: "11月22日" },
  { id: 2, name: "界面规范更新", owner: "陈宁", status: "已完成", updated: "11月20日" },
  { id: 3, name: "设计资源归档", owner: "周景", status: "待开始", updated: "11月18日" },
];
const statuses = ["全部状态", "进行中", "已完成", "待开始"];

export default function Demo() {
  const [projects, setProjects] = useState(initialProjects);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(statuses[0]);
  const shown = projects.filter((project) =>
    project.name.includes(query.trim()) && (status === statuses[0] || project.status === status),
  );

  function exportProjects() {
    const file = document.createElement("a");
    file.href = "data:text/csv;charset=utf-8," + encodeURIComponent(
      ["项目名称,负责人,状态,更新时间", ...shown.map(({ name, owner, status, updated }) => [name, owner, status, updated].join(","))].join("\n"),
    );
    file.download = "projects.csv";
    file.click();
  }

  function addProject() {
    setProjects((current) => [...current, { id: current.length + 1, name: `新项目 ${current.length - 2}`, owner: "林杉", status: "待开始", updated: "刚刚" }]);
    setQuery("");
    setStatus(statuses[0]);
  }

  return (
    <div style={{ width: "100%", minWidth: 0, border: "1px solid var(--mt-border)", borderRadius: 8 }}>
      <Toolbar
        aria-label="项目表格操作"
        search={<Input.Search aria-label="搜索项目" placeholder="搜索项目" value={query} onChange={(event) => setQuery(event.target.value)} />}
        start={<Popover.Menu trigger={status === statuses[0] ? "状态" : status} items={statuses.map((key) => ({ key, label: key }))} onSelect={setStatus} />}
        end={<>
          <Button leftSection={<Download size={16} aria-hidden="true" />} onClick={exportProjects}>导出</Button>
          <Button variant="solid" leftSection={<Plus size={16} aria-hidden="true" />} onClick={addProject}>新建</Button>
        </>}
      />
      <Table
        rowKey="id"
        rowSelection={{}}
        pagination={false}
        dataSource={shown}
        columns={[
          { title: "项目名称", dataIndex: "name" },
          { title: "负责人", dataIndex: "owner" },
          { title: "状态", dataIndex: "status", render: (value: string) => <Status tone={value === "进行中" ? "blue" : value === "已完成" ? "green" : "neutral"}>{value}</Status> },
          { title: "更新时间", dataIndex: "updated" },
        ]}
      />
    </div>
  );
}

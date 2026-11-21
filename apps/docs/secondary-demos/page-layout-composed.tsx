import { useState } from "react";
import { FileText } from "lucide-react";
import { Badge, Button, PageLayout, Tabs } from "../../../packages/mtone/src";

export default function Demo() {
  const [saved, setSaved] = useState(false);
  const [revision, setRevision] = useState(1);
  return (
    <PageLayout
      headingLevel={3}
      maxWidth={520}
      title="跨部门协同与项目交付记录"
      subtitle="项目管理"
      icon={<FileText size={22} aria-hidden="true" />}
      actions={<>
        <Button variant="solid" onClick={() => setSaved(true)}>保存草稿</Button>
        <Button onClick={() => { setRevision((value) => value + 1); setSaved(false); }}>新建版本</Button>
      </>}
      description="查看当前进度和历史版本。"
      extra={<Badge>{saved ? "已保存" : "未保存"}</Badge>}
      tabs={<Tabs items={[
        { value: "overview", label: "概览", content: <p>当前为第 {revision} 版。</p> },
        { value: "history", label: "历史", content: <p>共有 {revision} 个版本。</p> },
      ]} />}
    />
  );
}

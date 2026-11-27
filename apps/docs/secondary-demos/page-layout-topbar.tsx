import { useState } from "react";
import { Breadcrumb, Button, PageLayout, Tag, Topbar } from "../../../packages/mtone/src";

export default function Demo() {
  const [reviewed, setReviewed] = useState(false);
  return (
    <PageLayout
      title="交付记录"
      headingLevel={3}
      subtitle="研发工作台"
      topbar={
        <Topbar
          as="div"
          style={{ paddingInline: 0 }}
          breadcrumb={<Breadcrumb items={[{ label: "项目" }, { label: "交付记录" }]} />}
          extra={
            reviewed
              ? <Tag tone="green">已审阅</Tag>
              : <Button size="small" onClick={() => setReviewed(true)}>标记已审阅</Button>
          }
        />
      }
    >
      <p>这里汇总交付任务与评审进展。</p>
    </PageLayout>
  );
}

import { useState } from "react";
import { Ellipsis } from "lucide-react";
import { Button, Divider, PageLayout, Popover, Toolbar } from "../../../packages/mtone/src";

export default function Demo() {
  const [published, setPublished] = useState(false);
  const [preview, setPreview] = useState(false);
  return (
    <div style={{ width: "100%", maxWidth: 580, padding: 16, border: "1px solid var(--mt-border)", borderRadius: 8 }}>
      <PageLayout title="发布说明" headingLevel={3} subtitle={published ? "已发布" : "最近保存于 14:20"}>
        <Divider />
        <Toolbar
          aria-label="发布说明操作"
          background="white"
          start={<Popover.Menu trigger={published ? "已发布" : "草稿"} items={[
            { key: "draft", label: "草稿" }, { key: "published", label: "已发布" },
          ]} onSelect={(key) => setPublished(key === "published")} />}
          end={<>
            <Button toggle pressed={preview} onClick={() => setPreview((current) => !current)}>预览</Button>
            <Button variant="solid" onClick={() => setPublished(true)} disabled={published}>发布</Button>
            <Popover.Menu trigger={<Button iconOnly aria-label="更多发布操作"><Ellipsis size={16} aria-hidden="true" /></Button>}
              items={[{ key: "reset", label: "还原草稿" }]}
              onSelect={() => { setPublished(false); setPreview(false); }} />
          </>}
        />
        <Divider />
        <section>
          <h4>本次更新</h4>
          <p>{preview ? "预览：已更新项目归档流程与资料共享权限。" : "已更新项目归档流程与资料共享权限。"}</p>
        </section>
      </PageLayout>
    </div>
  );
}

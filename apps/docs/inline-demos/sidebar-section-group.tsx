import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";
import { CheckCircle2, RefreshCw } from "lucide-react";

export default function Demo() {
  const [checked, setChecked] = useState(false);

  return (
    <M.Sidebar aria-label="项目概览" style={{ maxWidth: 280, width: "100%", padding: 12 }}>
      <M.SectionGroup>
        <M.SectionGroup.Section title="版本发布" actions={<M.Tag>8</M.Tag>}>
          <M.Typography.Text>mtone 0.9.0</M.Typography.Text>
        </M.SectionGroup.Section>
        <M.SectionGroup.Section
          title="部署"
          actions={
            <M.Button
              iconOnly
              size="sm"
              variant="ghost"
              aria-label="检查部署状态"
              onClick={() => setChecked(true)}
            >
              <RefreshCw size={14} aria-hidden="true" />
            </M.Button>
          }
        >
          <div
            role="status"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <CheckCircle2 size={15} aria-hidden="true" />
            {checked ? "已检查，站点正常" : "文档站已上线"}
          </div>
        </M.SectionGroup.Section>
        <M.SectionGroup.Section title="软件包">
          <M.Typography.Code>@bixlab/mtone</M.Typography.Code>
        </M.SectionGroup.Section>
      </M.SectionGroup>
    </M.Sidebar>
  );
}

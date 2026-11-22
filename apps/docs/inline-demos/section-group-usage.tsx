import React from "react";
import * as M from "../../../packages/mtone/src";
import { CheckCircle2 } from "lucide-react";

export default function Demo() {
  return (
    <M.SectionGroup style={{ maxWidth: 320, width: "100%" }}>
      <M.SectionGroup.Section title="版本发布" actions={<M.Tag>8</M.Tag>}>
        mtone 0.9.0
      </M.SectionGroup.Section>
      <M.SectionGroup.Section
        title="部署"
        actions={<CheckCircle2 size={16} aria-label="已上线" role="img" />}
      >
        文档站已上线
      </M.SectionGroup.Section>
    </M.SectionGroup>
  );
}

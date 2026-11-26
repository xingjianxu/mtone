import * as React from "react";
import { Share2 } from "lucide-react";
import {
  Breadcrumb,
  Button,
  ButtonGroup,
  Tag,
  Topbar,
} from "../../../packages/mtone/src";

export default function Demo() {
  const [mode, setMode] = React.useState("编辑");
  const [shared, setShared] = React.useState(false);
  return (
    <>
      <Topbar
        breadcrumb={<Breadcrumb items={[{ label: "设计文档" }]} />}
        status={<Tag>草稿</Tag>}
        center={
          <ButtonGroup connected aria-label="文档模式" size="small">
            {["编辑", "预览"].map((name) => (
              <Button
                key={name}
                aria-pressed={mode === name}
                variant={mode === name ? "soft" : "outline"}
                onClick={() => setMode(name)}
              >
                {name}
              </Button>
            ))}
          </ButtonGroup>
        }
        extra={
          <Button
            variant="ghost"
            iconOnly
            aria-label="分享"
            onClick={() => setShared(true)}
          >
            <Share2 size={16} aria-hidden />
          </Button>
        }
      />
      <p role="status" style={{ paddingInline: 12 }}>
        {shared ? "已选择分享" : `当前模式：${mode}`}
      </p>
    </>
  );
}

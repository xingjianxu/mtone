import React from "react";
import { ArrowRight, Download, Image } from "lucide-react";
import { Button } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Button leftSection={<Image size={14} aria-hidden="true" />}>图库</Button>
      <Button
        variant="solid"
        rightSection={<Download size={14} aria-hidden="true" />}
      >
        下载
      </Button>
      <Button
        variant="soft"
        leftSection={<Image size={14} aria-hidden="true" />}
        rightSection={<ArrowRight size={14} aria-hidden="true" />}
      >
        查看图库
      </Button>
    </div>
  );
}

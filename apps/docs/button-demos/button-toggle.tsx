import React from "react";
import { Bookmark } from "lucide-react";
import { Button, IconButton } from "../../../packages/mtone/src";

export default function Demo() {
  const [pinned, setPinned] = React.useState(false);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <Button toggle>仅显示未读</Button>
      <IconButton aria-label="收藏" toggle={{ mode: "icon", preset: "star" }} />
      <Button
        toggle={{ mode: "icon", preset: "pin" }}
        pressed={pinned}
        onPressedChange={setPinned}
      >
        置顶
      </Button>
      <Button
        toggle={{
          mode: "icon",
          offIcon: <Bookmark size={14} />,
          onIcon: <Bookmark size={14} fill="currentColor" />,
        }}
        defaultPressed
      >
        书签
      </Button>
    </div>
  );
}

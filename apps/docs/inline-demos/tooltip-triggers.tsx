import { useState } from "react";
import { Button, Tooltip, TooltipProvider } from "../../../packages/mtone/src";

export default function Demo() {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider delay={350} closeDelay={100}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Tooltip content="悬停 350ms 后显示；键盘聚焦也可查看">
          <Button>悬停或聚焦</Button>
        </Tooltip>
        <Tooltip delay={150} content="更快显示；可以覆盖公共延迟">
          <Button>较短延迟</Button>
        </Tooltip>
        <Tooltip trigger="focus" content="按 Tab 聚焦此按钮查看">
          <Button>仅聚焦</Button>
        </Tooltip>
        <Tooltip trigger="click" open={open} onOpenChange={setOpen} content="再点一次或按 Escape 关闭">
          <Button>点按切换</Button>
        </Tooltip>
        <Tooltip trigger="contextMenu" content="也可用菜单键或 Shift+F10 查看">
          <Button>右键提示</Button>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

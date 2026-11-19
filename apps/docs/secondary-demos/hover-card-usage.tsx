import { Button, HoverCard } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      <HoverCard
        trigger={<Button>作者预览</Button>}
        title="mtone"
        withArrow
        content={
          <>
            <p style={{ margin: "0 0 8px" }}>
              简约、紧凑的 React
              组件库。将鼠标移入卡片后，可以继续阅读或使用链接。
            </p>
            <a href="#/components/Button">浏览 Button 文档</a>
          </>
        }
      />
    </div>
  );
}

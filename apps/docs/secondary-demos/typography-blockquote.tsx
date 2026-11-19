import { Quote } from "lucide-react";
import { Typography } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div
      style={{
        display: "grid",
        gap: 28,
        minWidth: 0,
        width: "100%",
        maxWidth: 640,
      }}
    >
      <div style={{ display: "grid", gap: 20 }}>
        <Typography.Blockquote>
          让内容成为主角。默认无图标和署名，使用中性灰底和细左边框。
        </Typography.Blockquote>
        <Typography.Blockquote cite="— mtone 设计笔记">
          减少装饰，不减少信息。署名可包含作者、作品名称或来源链接。
        </Typography.Blockquote>
        <Typography.Blockquote
          icon={<Quote />}
          color="var(--mt-focus, #5378aa)"
          radius={4}
          textWrap="balance"
          cite={
            <Typography.Link href="#/components/Typography">
              mtone 排版指南
            </Typography.Link>
          }
          citeUrl="#/components/Typography"
        >
          用克制的色彩与一致的间距建立层次。图标是装饰元素，正文支持 React
          内容。
        </Typography.Blockquote>
      </div>
      <p>
        cite 是可见署名，citeUrl 是原生 blockquote 的来源 URL。color 接受 CSS
        颜色；不设置时沿用主题中性色。radius、iconSize 支持数字（px）或 CSS
        长度。
      </p>
    </div>
  );
}

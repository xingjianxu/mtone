import * as React from "react";
import {
  Button,
  Image,
  ImageGroup,
  ImagePreview,
  type ImageItem,
} from "../../packages/mtone/src";

// Self-contained fixtures: no image requests to third-party hosts.
function landscape(sky: string, hill: string, title: string) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="800" height="500" fill="${sky}"/><circle cx="630" cy="100" r="42" fill="#fff7dc"/><path d="M0 430L180 190L350 360L550 150L800 400V500H0Z" fill="${hill}"/><path d="M0 430Q200 370 410 440T800 420V500H0Z" fill="#abc4c4"/><text x="36" y="62" font-family="sans-serif" font-size="26" fill="#37474f">${title}</text></svg>`)}`;
}
const items: ImageItem[] = [
  { src: landscape("#e7edf0", "#9caea3", "Mountain"), alt: "山间湖泊" },
  { src: landscape("#f1e9df", "#b5a693", "Sunset"), alt: "落日山谷" },
  { src: landscape("#e4e8ef", "#8e9bae", "Morning"), alt: "晨间远山" },
];
export function ImageExample({
  compact = false,
  variant = "Image",
}: {
  compact?: boolean;
  variant?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const opener = React.useRef<HTMLButtonElement>(null);
  const external = (
    <>
      <Button ref={opener} onClick={() => setOpen(true)}>
        打开图片预览
      </Button>
      <ImagePreview
        items={items}
        open={open}
        onOpenChange={setOpen}
        current={current}
        onCurrentChange={setCurrent}
        returnFocus={opener}
      />
    </>
  );
  if (compact) {
    if (variant === "ImageGroup")
      return (
        <ImageGroup items={items} thumbnailWidth={96} thumbnailHeight={64} />
      );
    if (variant === "ImagePreview") return external;
    return (
      <Image src={items[0].src} alt={items[0].alt} width={220} height={138} />
    );
  }
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section>
        <h4>单图预览</h4>
        <p>点击图片，体验缩放、旋转、翻转和拖动。Escape 关闭。</p>
        <Image src={items[0].src} alt={items[0].alt} width={320} height={200} />
      </section>
      <section>
        <h4>图片组</h4>
        <p>点击任一缩略图打开，左右方向键切换；首尾不会循环。</p>
        <ImageGroup items={items} />
      </section>
      <section>
        <h4>独立受控预览</h4>
        <p>无需先渲染缩略图，由业务按钮打开。</p>
        {external}
      </section>
      <section>
        <h4>加载失败与备用图</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Image
            src="data:image/png;base64,invalid"
            fallback={items[1].src}
            alt="备用风景图"
            width={200}
            height={125}
          />
          <Image
            src="data:image/png;base64,invalid"
            alt="加载失败示例"
            width={200}
            height={125}
            preview={false}
          />
        </div>
      </section>
      <section>
        <h4>仅展示，不启用预览</h4>
        <Image
          src={items[2].src}
          alt={items[2].alt}
          width={260}
          height={140}
          fit="contain"
          preview={false}
          loading="lazy"
        />
      </section>
    </div>
  );
}

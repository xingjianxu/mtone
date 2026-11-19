import { Image, type ImageItem } from "../../../packages/mtone/src";

// Self-contained fixtures: no image requests to third-party hosts.
function landscape(sky: string, hill: string, title: string) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="800" height="500" fill="${sky}"/><circle cx="630" cy="100" r="42" fill="#fff7dc"/><path d="M0 430L180 190L350 360L550 150L800 400V500H0Z" fill="${hill}"/><path d="M0 430Q200 370 410 440T800 420V500H0Z" fill="#abc4c4"/><text x="36" y="62" font-family="sans-serif" font-size="26" fill="#37474f">${title}</text></svg>`)}`;
}
const items: ImageItem[] = [
  { src: landscape("#e7edf0", "#9caea3", "Mountain"), alt: "山间湖泊" },
  { src: landscape("#f1e9df", "#b5a693", "Sunset"), alt: "落日山谷" },
  { src: landscape("#e4e8ef", "#8e9bae", "Morning"), alt: "晨间远山" },
];

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
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
    </div>
  );
}

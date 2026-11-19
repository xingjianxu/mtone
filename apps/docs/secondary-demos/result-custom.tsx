import { Result } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Result
        icon={
          <span aria-label="庆祝" role="img">
            ✦
          </span>
        }
        title="自定义图标"
        subTitle="沿用项目配色，也可以单独调整语义区域。"
        classNames={{ title: "result-custom-title" }}
        styles={{ icon: { color: "#8064a2" } }}
      />
    </div>
  );
}

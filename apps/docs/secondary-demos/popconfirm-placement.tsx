import {
  Button,
  Popconfirm,
  type PopconfirmPlacement,
} from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {(
          [
            "topLeft",
            "top",
            "topRight",
            "leftTop",
            "left",
            "leftBottom",
            "rightTop",
            "right",
            "rightBottom",
            "bottomLeft",
            "bottom",
            "bottomRight",
          ] as PopconfirmPlacement[]
        ).map((placement) => (
          <Popconfirm
            key={placement}
            placement={placement}
            trigger={<Button size="sm">{placement}</Button>}
            title="确认操作？"
            description="浮层会在接近屏幕边缘时自动避让。"
          />
        ))}
      </div>
    </div>
  );
}

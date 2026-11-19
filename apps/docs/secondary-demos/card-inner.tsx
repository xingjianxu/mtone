import { Card, Text } from "../../../packages/mtone/src";

/** All actions below are local demo state; no account or server is changed. */

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: 560 }}>
      <Card type="inner" variant="borderless" title="嵌套内容" size="small">
        <Text muted>
          inner 样式和无边框变体可独立组合。悬浮样式不会把普通 div 变成按钮。
        </Text>
      </Card>
    </div>
  );
}

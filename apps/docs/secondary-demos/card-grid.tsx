import { Card, Text } from "../../../packages/mtone/src";

/** All actions below are local demo state; no account or server is changed. */

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: 560 }}>
      <Card title="快速入口" size="small">
        <Card.Grid>
          <strong>设计原则</strong>
          <div>
            <Text muted>简洁、清楚、可组合</Text>
          </div>
        </Card.Grid>
        <Card.Grid>
          <strong>组件约定</strong>
          <div>
            <Text muted>一致的交互与反馈</Text>
          </div>
        </Card.Grid>
        <Card.Grid hoverable={false}>
          <strong>版本记录</strong>
          <div>
            <Text muted>无悬浮提升的网格项</Text>
          </div>
        </Card.Grid>
      </Card>
    </div>
  );
}

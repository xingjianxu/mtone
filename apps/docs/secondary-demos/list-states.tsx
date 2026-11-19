import { useState } from "react";
import { List } from "../../../packages/mtone/src";

export default function Demo() {
  const [loading, setLoading] = useState(false);
  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <List items={[]} emptyContent="暂无记录" />
      <List items={[]} loading />
    </div>
  );
}

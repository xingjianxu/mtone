import React from "react";
import { Button, Popconfirm } from "../../../packages/mtone/src";

export default function Demo() {
  const [fail, setFail] = React.useState(false);
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <label>
        <input
          type="checkbox"
          checked={fail}
          onChange={(e) => setFail(e.target.checked)}
        />{" "}
        模拟失败
      </label>
      <Popconfirm
        trigger={<Button>异步保存</Button>}
        title="保存更改？"
        description="等待约 800ms；执行期间禁止重复提交与关闭。"
        onConfirm={() =>
          new Promise<void>((resolve, reject) =>
            setTimeout(
              () => (fail ? reject(new Error("demo")) : resolve()),
              800,
            ),
          )
        }
        errorText="模拟保存失败，请关闭后取消勾选，再次重试。"
      />
    </div>
  );
}

import * as React from "react";
import { Button, Result } from "../../../packages/mtone/src";

export default function Demo() {
  const [retried, setRetried] = React.useState(false);
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Result
        status={retried ? "success" : "error"}
        title={retried ? "重试成功" : "提交失败"}
        subTitle="支持详细说明与可交互的操作区域。"
        extra={
          <Button onClick={() => setRetried((v) => !v)}>
            {retried ? "重置示例" : "重新提交"}
          </Button>
        }
      >
        <ul>
          <li>请检查必填信息是否完整。</li>
          <li>操作由业务代码处理，Result 只展示反馈。</li>
        </ul>
      </Result>
    </div>
  );
}

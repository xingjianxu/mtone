import * as React from "react";
import { Button, Result, type ResultStatus } from "../../packages/mtone/src";
export function ResultExample({ compact = false }: { compact?: boolean }) {
  const [retried, setRetried] = React.useState(false);
  if (compact)
    return (
      <Result
        status="success"
        title="保存成功"
        subTitle="内容已保存，可以继续编辑。"
        extra={<Button>继续编辑</Button>}
      />
    );
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Result
        status="success"
        title="保存成功"
        subTitle="内容已保存，可以继续编辑。"
        extra={<Button>继续编辑</Button>}
      />
      {(["info", "warning", "403", "404", "500"] as ResultStatus[]).map(
        (status) => (
          <Result
            key={status}
            status={status}
            title={status}
            subTitle={
              status === "403"
                ? "当前账号没有访问权限。"
                : status === "404"
                  ? "没有找到此页面。"
                  : status === "500"
                    ? "服务暂时不可用，请稍后再试。"
                    : "请根据提示继续处理。"
            }
          />
        ),
      )}
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

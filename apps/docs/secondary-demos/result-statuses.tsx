import { Result, type ResultStatus } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
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
    </div>
  );
}

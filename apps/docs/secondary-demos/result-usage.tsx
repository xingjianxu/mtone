import { Button, Result } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Result
        status="success"
        title="保存成功"
        subTitle="内容已保存，可以继续编辑。"
        extra={<Button>继续编辑</Button>}
      />
    </div>
  );
}

import { useState } from "react";
import { Button, Form, FormField, Input } from "../../../packages/mtone/src";

export default function Demo() {
  const [message, setMessage] = useState(
    "输入内容或点击校验，查看关联的错误信息。",
  );
  return (
    <Form
      onFinish={() => setMessage("字段校验通过。")}
      onFinishFailed={() => setMessage("请修改下方提示的字段。")}
      style={{ display: "grid", gap: 12, width: "100%", maxWidth: 460 }}
    >
      <FormField
        name="title"
        label="文档名称"
        description="至少 3 个字符，不能只输入空格。"
        rules={[
          { required: true, whitespace: true, message: "请输入文档名称" },
          { min: 3, message: "文档名称至少 3 个字符" },
        ]}
      >
        <Input placeholder="例如：阅读笔记" />
      </FormField>
      <Button type="submit">校验文档名称</Button>
      <span role="status">{message}</span>
    </Form>
  );
}

import { useState } from "react";
import {
  Button,
  Form,
  Mentions,
  Text,
  type MentionOption,
} from "../../../packages/mtone/src";
const people: MentionOption[] = [
  { value: "alice", label: "Alice · 产品设计" },
  { value: "bob", label: "Bob · 工程" },
  { value: "carol", label: "Carol · 内容" },
  { value: "archived", label: "已停用成员", disabled: true },
];

export default function Demo() {
  const [value, setValue] = useState("");
  const [formResult, setFormResult] =
    useState("尚未提交；数据只保存在此页面。");
  const [form] = Form.useForm();
  return (
    <div style={{ display: "grid", gap: 22, width: "100%", maxWidth: 640 }}>
      <Form
        form={form}
        initialValues={{ message: "" }}
        onFinish={(values) => setFormResult(String(values.message))}
      >
        <Form.Item
          name="message"
          label="协作说明"
          rules={[
            {
              required: true,
              whitespace: true,
              message: "请输入协作说明",
            },
          ]}
        >
          <Mentions
            options={people}
            allowClear
            placeholder="例如：请 @alice 审阅"
          />
        </Form.Item>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <Button type="submit">提交提及示例</Button>
          <Button
            type="button"
            onClick={() => {
              form.resetFields();
              setFormResult("表单已重置。");
            }}
          >
            重置
          </Button>
        </div>
      </Form>
      <Text data-testid="mentions-form-result">{formResult}</Text>
      <Text muted>
        onChange 返回字符串，可直接绑定 Form.Item。getMentions
        只解析文本，不确认成员是否存在，也不代替服务端权限校验。
      </Text>
    </div>
  );
}

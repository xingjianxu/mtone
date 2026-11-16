import React, { useState } from "react";
import {
  Button,
  Form,
  FormField,
  Input,
  MultiSelect,
  Select,
  type FormValidationError,
} from "../../packages/mtone/src";

const roleOptions = [
  { value: "editor", label: "编辑者" },
  { value: "reader", label: "阅读者" },
];
const topicOptions = [
  { value: "design", label: "设计" },
  { value: "engineering", label: "技术" },
  { value: "research", label: "研究" },
];

export function FormExample() {
  const [form] = Form.useForm();
  const [result, setResult] = useState(
    "填写后提交；用户名 admin 会在本地异步检查中被判定为已占用。",
  );
  return (
    <Form
      form={form}
      initialValues={{ username: "", email: "", role: null, topics: [] }}
      validateTrigger="onBlur"
      style={{ display: "grid", gap: 14, width: "100%", maxWidth: 460 }}
      onFinish={(values) =>
        setResult(`本地提交成功：${JSON.stringify(values)}`)
      }
      onFinishFailed={(error) =>
        setResult(`校验未通过：${error.errorFields.length} 个字段需要修改。`)
      }
    >
      <FormField
        name="username"
        label="用户名"
        description="输入 admin 后离开输入框可查看异步错误。"
        rules={[
          { required: true, whitespace: true, message: "请输入用户名" },
          { min: 3, message: "用户名至少 3 个字符" },
          {
            validator: async (_rule, value) => {
              await new Promise((resolve) => setTimeout(resolve, 300));
              if (String(value).toLowerCase() === "admin")
                return "此用户名已被占用，请换一个";
            },
          },
        ]}
      >
        <Input autoComplete="off" placeholder="例如：xiaoming" />
      </FormField>
      <Form.Item
        name="email"
        label="邮箱"
        rules={[
          { required: true, message: "请输入邮箱" },
          { type: "email", message: "请输入有效的邮箱地址" },
        ]}
      >
        <Input type="email" placeholder="name@example.com" />
      </Form.Item>
      <FormField
        name="role"
        label="角色"
        validateTrigger="onChange"
        rules={[{ required: true, message: "请选择角色" }]}
      >
        <Select options={roleOptions} placeholder="选择角色" />
      </FormField>
      <FormField
        name="topics"
        label="关注主题"
        validateTrigger="onChange"
        rules={[
          {
            required: true,
            type: "array",
            min: 1,
            message: "请至少选择一个主题",
          },
        ]}
      >
        <MultiSelect options={topicOptions} placeholder="选择关注主题" />
      </FormField>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Button type="submit" variant="blue">
          提交示例表单
        </Button>
        <Button
          type="button"
          onClick={() => {
            void form.validateFields().then(
              () => setResult("手动校验通过，可以提交。"),
              (error: FormValidationError) => {
                if (!error.outOfDate)
                  setResult(
                    `手动校验未通过：${error.errorFields.length} 个字段需要修改。`,
                  );
              },
            );
          }}
        >
          校验全部字段
        </Button>
        <Button
          type="reset"
          onClick={() => setResult("已恢复初始值并清除校验状态。")}
        >
          重置示例表单
        </Button>
      </div>
      <p
        role="status"
        style={{
          margin: 0,
          fontSize: 12,
          lineHeight: 1.6,
          overflowWrap: "anywhere",
        }}
      >
        {result}
      </p>
      <small>本地演示，不发送网络请求，也不创建账号。</small>
    </Form>
  );
}

export function FormFieldExample() {
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

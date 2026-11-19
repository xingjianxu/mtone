import React from "react";
import { Input, Form } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <Form initialValues={{ name: "" }}>
      <Form.Item name="name" label="名称" required>
        <Input placeholder="必填名称" allowClear />
      </Form.Item>
    </Form>
  );
}

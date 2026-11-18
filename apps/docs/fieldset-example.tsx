import React, { useState } from "react";
import {
  Fieldset,
  FormField,
  Input,
  Select,
  Button,
  Checkbox,
} from "../../packages/mtone/src";
const stack: React.CSSProperties = { display: "grid", gap: 10 };
export function FieldsetExample() {
  const [disabled, setDisabled] = useState(false);
  return (
    <div style={{ ...stack, gap: 20, width: "100%", maxWidth: 480 }}>
      <section>
        <h3>基础分组</h3>
        <Fieldset legend="个人信息">
          <div style={stack}>
            <FormField label="姓名">
              <Input placeholder="请输入姓名" />
            </FormField>
            <FormField label="邮箱">
              <Input type="email" placeholder="name@example.com" />
            </FormField>
          </div>
        </Fieldset>
      </section>
      <section>
        <h3>填充样式与圆角</h3>
        <Fieldset legend="通知设置" variant="filled" radius={8}>
          <Checkbox label="接收项目更新" defaultChecked />
        </Fieldset>
      </section>
      <section>
        <h3>无边框</h3>
        <Fieldset legend="附加信息" variant="unstyled">
          <Input aria-label="备注" placeholder="添加备注" />
        </Fieldset>
      </section>
      <section style={stack}>
        <h3>统一禁用</h3>
        <Checkbox
          label="禁用下方分组"
          checked={disabled}
          onCheckedChange={setDisabled}
        />
        <Fieldset legend="项目设置" disabled={disabled}>
          <div style={stack}>
            <Input aria-label="项目名称" placeholder="项目名称" />
            <Select
              label="可见范围"
              placeholder="选择可见范围"
              options={[
                { value: "private", label: "仅自己" },
                { value: "team", label: "团队成员" },
              ]}
            />
            <Button>保存设置</Button>
          </div>
        </Fieldset>
      </section>
    </div>
  );
}

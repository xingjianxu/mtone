import React, { useState } from "react";
import {
  Fieldset,
  Input,
  Select,
  Button,
  Checkbox,
} from "../../../packages/mtone/src";
const stack: React.CSSProperties = { display: "grid", gap: 10 };

export default function Demo() {
  const [disabled, setDisabled] = useState(false);
  return (
    <div style={{ ...stack, gap: 20, width: "100%", maxWidth: 480 }}>
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
    </div>
  );
}

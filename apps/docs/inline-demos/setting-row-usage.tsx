import React from "react";
import { NumberInput, Select, SettingRow, Switch } from "../../../packages/mtone/src";

export default function Demo() {
  const title = React.useId();
  return <div style={{ width: "100%", maxWidth: 640 }}>
    <h3 id={title} style={{ margin: "0 0 12px" }}>编辑器设置</h3>
    <SettingRow.Group aria-labelledby={title}>
      <SettingRow title="只读模式" shortcut="Ctrl+Shift+G"
        description="打开后锁定编辑器，仍可搜索内容。"
        control={a11y => <Switch {...a11y} />} />
      <SettingRow title="拼写检查" description="输入时标记可能的拼写错误。"
        control={a11y => <Switch {...a11y} defaultChecked />} />
      <SettingRow title="光标上下文行数" description="光标与编辑器边缘之间至少保留的行数。"
        control={a11y => <NumberInput {...a11y} defaultValue={3} />} />
      <SettingRow title="Tab 空格数" description="按下 Tab 时插入指定数量的空格。"
        control={a11y => <Select {...a11y} defaultValue="4" options={[2, 4, 8].map(value => ({
          value: String(value),
          label: `${value} 个空格`,
        }))} />} />
    </SettingRow.Group>
  </div>;
}

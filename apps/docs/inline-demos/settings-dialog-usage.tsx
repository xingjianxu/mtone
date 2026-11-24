import React from "react";
import { Button, NumberInput, Select, SettingRow, SettingsDialog, Switch } from "../../../packages/mtone/src";

export default function Demo() {
  return <SettingsDialog
    title="应用设置"
    trigger={<Button>打开设置</Button>}
    categories={[
      { value: "general", label: "常规", content: (
        <SettingRow.Group aria-label="常规设置">
          <SettingRow title="自动保存" description="编辑时自动保存草稿。"
            control={props => <Switch {...props} defaultChecked />} />
          <SettingRow title="通知" description="在任务完成时发送提醒。"
            control={props => <Switch {...props} />} />
        </SettingRow.Group>
      ) },
      { value: "editor", label: "编辑器", content: (
        <SettingRow.Group aria-label="编辑器设置">
          <SettingRow title="光标上下文行数" control={props => <NumberInput {...props} defaultValue={3} />} />
          <SettingRow title="Tab 空格数" control={props => (
            <Select {...props} defaultValue="4" options={[2, 4, 8].map(value => ({
              value: String(value),
              label: `${value} 个空格`,
            }))} />
          )} />
        </SettingRow.Group>
      ) },
      { value: "privacy", label: "隐私", content: (
        <SettingRow title="使用情况统计" description="发送匿名使用数据。"
          control={props => <Switch {...props} />} />
      ) },
    ]}
  />;
}

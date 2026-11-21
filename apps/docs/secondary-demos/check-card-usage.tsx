import { CheckCard } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <CheckCard
      title="接收项目动态"
      description="有新任务或进度变化时提醒我。"
      defaultChecked
      name="projectUpdates"
      value="enabled"
    />
  );
}

import { CircleDot, Code, GitPullRequest } from "lucide-react";
import { Tabs, type TabItem } from "../../../packages/mtone/src";

const items: TabItem[] = [
  { value: "code", label: "代码", icon: <Code />, content: "README.md · 项目说明" },
  { value: "issues", label: "议题", icon: <CircleDot />, content: "暂无待处理议题。" },
  { value: "requests", label: "合并请求", icon: <GitPullRequest />, content: "暂无待审查的合并请求。" },
];

export default function Demo() {
  return <Tabs variant="attached" label="仓库视图" items={items} />;
}

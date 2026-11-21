import { CardGroup, CheckCard } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <CheckCard.Group legend="选择工作区视图" defaultValue="overview">
      <CardGroup columns={{ xs: 1, sm: 2, md: 3 }} gap={12}>
        <CheckCard
          value="overview"
          title="概览"
          description="查看团队近期活动。"
        />
        <CheckCard
          value="projects"
          title="项目"
          description="专注任务和里程碑。"
        />
        <CheckCard value="notes" title="笔记" description="浏览研究记录。" />
      </CardGroup>
    </CheckCard.Group>
  );
}

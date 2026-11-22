import type { DocSection } from "../doc-section";
import IssueListDemo from "./issues";
import issueSource from "./issues.tsx?raw";
import LocalDataListDemo from "./local";
import localSource from "./local.tsx?raw";
import RemoteDataListDemo from "./remote";
import remoteSource from "./remote.tsx?raw";

const packageSource = (source: string) =>
  source.replace(
    'from "../../../packages/mtone/src";',
    'from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";',
  );

export const dataListDocSections = [
  {
    id: "issue-list",
    title: "事项列表样式",
    note: "头部复用灰色 Toolbar。搜索置于前方，全选与已选数量在起始侧，状态筛选和视图切换在末端；窄容器中搜索独占一行。",
    Demo: IssueListDemo,
    source: packageSource(issueSource),
  },
  {
    id: "local-data",
    title: "本地列表",
    note: "搜索与状态筛选在分页前应用。全选只影响当前页可选条目，翻页会保留其他已选键。试试展开详情或批量处理；演示不会修改文档。",
    Demo: LocalDataListDemo,
    source: packageSource(localSource),
  },
  {
    id: "remote-data",
    title: "服务端分页",
    note: "应用维护查询、页码、总数、加载和错误状态。快速切换搜索或页码时取消旧请求；此示例只模拟请求，不访问外部服务。",
    Demo: RemoteDataListDemo,
    source: packageSource(remoteSource),
  },
] satisfies DocSection[];

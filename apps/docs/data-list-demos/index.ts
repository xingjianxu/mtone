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
    note: "在 toolbar 插槽中放入灰色 Toolbar。DataList.Selection 在起始侧显示本页全选和已选数量，应用把状态筛选和视图切换放在末端。",
    Demo: IssueListDemo,
    source: packageSource(issueSource),
  },
  {
    id: "local-data",
    title: "本地列表",
    note: "搜索与状态筛选在分页前应用。将选择和搜索依次放进 Toolbar.start，可让键盘先到达选择控件。全选只影响当前页可选条目，翻页会保留其他已选键。试试展开详情或批量处理；演示不会修改文档。",
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

import * as M from "../../../packages/mtone/src";

const options = [
  "产品设计",
  "用户研究",
  "技术文档",
  "开发运维",
  "数据分析",
  "质量保障",
  "项目协作",
  "版本管理",
].map((label) => ({ value: label, label }));

export default function Demo() {
  return (
    <div style={{ width: "100%", maxWidth: 360 }}>
      <M.TagSelect aria-label="项目主题" options={options} selectAll />
    </div>
  );
}

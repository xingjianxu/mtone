import { useState } from "react";
import { Checkbox, Table } from "../../../packages/mtone/src";

export default function Demo({ compact = false }: { compact?: boolean } = {}) {
  const [bordered, setBordered] = useState(false);
  const [striped, setStriped] = useState(false);
  const [highlightOnHover, setHighlightOnHover] = useState(false);

  return (
    <div style={{ width: "100%", minWidth: 0, display: "grid", gap: 12 }}>
      {!compact && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Checkbox label="网格边框" checked={bordered} onCheckedChange={setBordered} />
          <Checkbox label="隔行底色" checked={striped} onCheckedChange={setStriped} />
          <Checkbox label="悬停高亮" checked={highlightOnHover} onCheckedChange={setHighlightOnHover} />
        </div>
      )}
      <Table bordered={bordered} striped={striped} highlightOnHover={highlightOnHover}>
        <caption>本周项目</caption>
        <thead>
          <tr><th scope="col">项目</th><th scope="col">进度</th></tr>
        </thead>
        <tbody>
          <tr><th scope="row">组件文档整理</th><td>进行中</td></tr>
          <tr><th scope="row">界面规范更新</th><td>已完成</td></tr>
          <tr><th scope="row">设计资源归档</th><td>待开始</td></tr>
        </tbody>
      </Table>
    </div>
  );
}

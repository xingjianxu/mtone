import { Splitter } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <Splitter bordered storageKey="docs:splitter:workspace:v1" style={{ height: 160 }}>
      <Splitter.Panel id="navigation" defaultSize="30%" min="15%" collapsible>
        <div style={{ padding: 12 }}>导航</div>
      </Splitter.Panel>
      <Splitter.Panel id="main" min="30%">
        <div style={{ padding: 12 }}>拖动或收起导航后刷新页面，分栏布局会恢复。</div>
      </Splitter.Panel>
    </Splitter>
  );
}

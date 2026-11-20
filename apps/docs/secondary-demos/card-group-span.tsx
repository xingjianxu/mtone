import { Card, CardGroup } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div role="region" aria-label="移动端两列与跨列" style={{ minWidth: 0 }}>
      <CardGroup columns={{ xs: 2, md: 3 }} gap={{ xs: 8, md: 16 }}>
        <CardGroup.Item span={{ xs: 2, md: 3 }}>
          <Card title="本周概览" size="small">
            这一项跨满当前整行。
          </Card>
        </CardGroup.Item>
        {["待整理", "已阅读", "已收藏", "已归档"].map((title, index) => (
          <Card key={title} title={title} size="small">
            <strong>{12 + index * 8}</strong>
          </Card>
        ))}
      </CardGroup>
    </div>
  );
}

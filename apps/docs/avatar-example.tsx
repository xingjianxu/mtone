import React from "react";
import { UserRound } from "lucide-react";
import { Avatar, AvatarGroup } from "../../packages/mtone/src";
const row: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 12,
};
export function AvatarExample({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={row}>
        <Avatar name="林" />
        <Avatar name="Alex" size="md" />
        <Avatar icon={<UserRound size={20} />} size="lg" />
        <Avatar name="方" shape="square" size={40} />
      </div>
      {!compact && (
        <>
          <section>
            <h4>自动缩放文字与图片失败回退</h4>
            <div style={row}>
              <Avatar size={44}>RESEARCH</Avatar>
              <Avatar size={44} gap={8}>
                研究团队
              </Avatar>
              <Avatar
                src="data:image/png;base64,invalid"
                name="加载失败"
                size={44}
              />
            </div>
          </section>
          <section>
            <h4>响应式尺寸</h4>
            <Avatar name="响应" size={{ xs: 24, sm: 32, md: 40, lg: 56 }} />
            <p>随页面宽度改变尺寸；文字会自动缩小以适应头像。</p>
          </section>
          <section>
            <h4>头像组与溢出名单</h4>
            <AvatarGroup
              size={32}
              max={3}
              items={[
                { name: "林老师" },
                { name: "陈同学" },
                { name: "王同学" },
                { name: "李同学" },
                { name: "周同学" },
              ]}
            />
            <p>点击 +N 或使用键盘打开其他成员名单。</p>
          </section>
          <section>
            <h4>子元素形式与单项覆盖</h4>
            <Avatar.Group shape="square" size={36}>
              <Avatar name="甲" />
              <Avatar name="乙" />
              <Avatar name="丙" shape="circle" size={28} />
            </Avatar.Group>
          </section>
        </>
      )}
    </div>
  );
}

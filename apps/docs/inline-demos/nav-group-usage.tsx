import { useState } from "react";
import { Ellipsis, Plus } from "lucide-react";
import { Button, NavGroup, NavItem } from "../../../packages/mtone/src";

export default function Demo() {
  const [viewCount, setViewCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <nav aria-label="工作空间示例" style={{ width: 220 }}>
      <NavGroup label="个人空间">
        <NavItem active>设计资料</NavItem>
        <NavItem>研究资料</NavItem>
      </NavGroup>
      <NavGroup
        label="保存的视图"
        actions={
          <>
            <Button iconOnly
              variant="ghost"
              size="sm"
              aria-label="新增视图"
              onClick={() => setViewCount((n) => n + 1)}
            >
              <Plus size={14} aria-hidden="true" />
            </Button>
            <Button iconOnly
              variant="ghost"
              size="sm"
              aria-label="视图详情"
              aria-expanded={showDetails}
              onClick={() => setShowDetails((open) => !open)}
            >
              <Ellipsis size={14} aria-hidden="true" />
            </Button>
          </>
        }
      >
        {viewCount ? (
          <NavItem>视图 {viewCount}</NavItem>
        ) : (
          <NavItem disabled>暂无保存的视图</NavItem>
        )}
        {showDetails && <NavItem disabled>已保存 {viewCount} 个视图</NavItem>}
      </NavGroup>
      <NavGroup label="工具" divider={false}>
        <NavItem>设置</NavItem>
      </NavGroup>
    </nav>
  );
}

import { useState } from "react";
import {
  Avatar,
  Tag,
  Button,
  CheckCard,
  Paragraph,
} from "../../../packages/mtone/src";

export default function Demo() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <CheckCard
        title="研究资料包"
        description="用于启动一次团队研究。"
        avatar={<Avatar name="研" size={32} />}
        cover={
          <svg
            aria-hidden="true"
            viewBox="0 0 420 80"
            style={{ display: "block", width: "100%", height: 80 }}
          >
            <rect width="420" height="80" fill="currentColor" opacity=".06" />
            <path
              d="M0 62 140 23l85 25L420 10v70H0Z"
              fill="currentColor"
              opacity=".12"
            />
            <path
              d="M0 75 140 46l85 16L420 36v44H0Z"
              fill="currentColor"
              opacity=".12"
            />
          </svg>
        }
        extra={
          <Button
            type="button"
            onClick={() => setShowDetails((value) => !value)}
          >
            {showDetails ? "隐藏内容" : "查看内容"}
          </Button>
        }
      >
        <Tag>仅团队可见</Tag>
      </CheckCard>
      <Paragraph role="status">
        {showDetails ? "含三类资料：笔记、数据与参考文献。" : "尚未展开资料。"}
      </Paragraph>
    </>
  );
}

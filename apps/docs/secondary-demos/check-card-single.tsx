import { useState } from "react";
import { CheckCard, Paragraph } from "../../../packages/mtone/src";

export default function Demo() {
  const [value, setValue] = useState("summary");

  return (
    <>
      <CheckCard.Group
        legend="选择报告范围"
        name="reportScope"
        value={value}
        onChange={setValue}
        required
        options={[
          {
            value: "summary",
            title: "摘要",
            description: "只包含关键进展和问题。",
          },
          {
            value: "full",
            title: "完整报告",
            description: "附详细记录和统计结果。",
          },
        ]}
      />
      <Paragraph role="status">
        已选：{value === "summary" ? "摘要" : "完整报告"}
      </Paragraph>
    </>
  );
}

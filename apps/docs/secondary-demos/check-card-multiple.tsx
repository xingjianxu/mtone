import { useState } from "react";
import { CheckCard, Paragraph } from "../../../packages/mtone/src";

const labels: Record<string, string> = {
  weekly: "每周简报",
  mentions: "提及提醒",
  changes: "状态变更",
};

export default function Demo() {
  const [value, setValue] = useState<string[]>(["weekly"]);

  return (
    <>
      <CheckCard.Group
        multiple
        legend="订阅提醒"
        name="subscriptions"
        value={value}
        onChange={setValue}
      >
        <CheckCard value="weekly" title="每周简报" />
        <CheckCard value="mentions" title="提及提醒" />
        <CheckCard value="changes" title="状态变更" />
      </CheckCard.Group>
      <Paragraph role="status">
        已选：{value.length ? value.map((key) => labels[key]).join("、") : "无"}
      </Paragraph>
    </>
  );
}

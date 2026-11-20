import React from "react";
import {
  Questionnaire,
  type QuestionnaireAnswers,
  type QuestionnaireItem,
} from "../../../packages/mtone/src";

const items: QuestionnaireItem[] = [
  {
    id: "goal",
    type: "single",
    title: "这次想了解什么？",
    required: true,
    description: "选择一个主题，或填写其他主题。",
    choices: [
      { value: "basics", label: "快速上手" },
      { value: "design", label: "组件设计" },
    ],
    other: { label: "其他主题", placeholder: "填写你感兴趣的主题" },
  },
  {
    id: "channels",
    type: "multiple",
    title: "你喜欢哪些学习形式？",
    description: "可以多选，也可以跳过。",
    choices: [
      { value: "docs", label: "阅读文档" },
      { value: "examples", label: "查看示例" },
      { value: "practice", label: "动手练习" },
    ],
  },
  {
    id: "notes",
    type: "text",
    title: "还有什么建议？",
    placeholder: "在这里输入补充建议",
  },
];
export default function Demo() {
  const [submission, setSubmission] = React.useState<QuestionnaireAnswers>();
  return (
    <div style={{ maxWidth: 520 }}>
      <Questionnaire
        items={items}
        onSubmit={setSubmission}
        submitLabel="提交问卷"
      />
      {submission && (
        <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
          {JSON.stringify(submission, null, 2)}
        </pre>
      )}
    </div>
  );
}

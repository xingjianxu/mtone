import type { DocSection } from "../doc-section";
import { componentDocs } from "../catalog";
import { aiExamples } from "./examples";
import IntegratedChat from "./integrated-chat";
import integratedSource from "./integrated-chat.tsx?raw";

export { aiExamples };

export const aiDemoId = (name: string) =>
  name
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/^ai(?=[a-z])/, "ai-");

const docs = componentDocs.filter((doc) => doc.category === "AI 界面");
const componentSection = (doc: (typeof docs)[number]): DocSection => ({
  id: aiDemoId(doc.name),
  title: `${doc.name} · ${doc.demoLabel}`,
  note: doc.description,
  Demo: aiExamples[doc.name],
  source: doc.code,
});
const integrated: DocSection = {
  id: "integrated-chat",
  title: "模拟对话",
  note: "展示本地模拟的流式回复、停止、模型选择、建议提示词和来源。不会调用模型、读取或上传文件内容。",
  Demo: IntegratedChat,
  source: integratedSource.replace(
    'from "../../../packages/mtone/src";',
    'from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";',
  ),
};

export const aiDocSections: Record<string, readonly DocSection[]> =
  Object.fromEntries(
    docs.map((doc) => [
      doc.name,
      [
        ...(doc.name === "AiChat" ? [integrated] : []),
        componentSection(doc),
        ...docs
          .filter((child) => child.sidebarParent === doc.name)
          .map(componentSection),
      ],
    ]),
  );

export function aiSectionHref(name: string) {
  const parent = docs.find((doc) => doc.name === name)?.sidebarParent;
  return parent
    ? `#/components/${parent}?section=${aiDemoId(name)}`
    : undefined;
}

import type { ComponentType } from "react";
import { componentDocs } from "../catalog";
import { isTypographySection } from "../typography-navigation";
import { aiDemoId } from "../component-navigation";
import type { DocSection } from "../doc-section";
import { aiPlaygrounds } from "./ai";
import { basicPlaygrounds } from "./basic";
import { dataPlaygrounds } from "./data";
import { formPlaygrounds } from "./forms";
import { layoutPlaygrounds } from "./layout";
import { overlayPlaygrounds } from "./overlays";

const previews: Record<string, ComponentType> = {
  ...aiPlaygrounds,
  ...basicPlaygrounds,
  ...dataPlaygrounds,
  ...formPlaygrounds,
  ...layoutPlaygrounds,
  ...overlayPlaygrounds,
};

export function withPlaygrounds(
  base: Record<string, readonly DocSection[]>,
): Record<string, readonly DocSection[]> {
  const result = { ...base };
  for (const doc of componentDocs) {
    if (base[doc.name]?.[0]?.playground) continue;
    const Demo = previews[doc.name];
    if (!Demo || isTypographySection(doc.name)) continue;
    if (!doc.sidebarParent) {
      const id = doc.name === "Tree" ? "playground" : "interactive";
      const title = "交互示例";
      const previous = base[doc.name] ?? [];
      result[doc.name] = [
        { id, title, Demo, playground: true },
        ...previous.filter((section) => section.id !== id),
      ];
      continue;
    }
    // A documented subcomponent keeps its existing anchor and copyable example.
    const id =
      doc.sidebarSection ??
      (doc.category === "AI 界面" ? aiDemoId(doc.name) : undefined);
    if (!id) continue;
    const sections = result[doc.sidebarParent] ?? [];
    result[doc.sidebarParent] = sections.map((section) =>
      section.id === id
        ? {
            ...section,
            children: [
              {
                id: `${id}-interactive`,
                title: "交互示例",
                Demo,
                playground: true,
              },
              ...(section.children ?? []),
            ],
          }
        : section,
    );
  }
  return result;
}

import { componentDocs, familyDocHref } from "./catalog";
import { componentDocHref as baseComponentDocHref } from "./typography-navigation";

export const aiDemoId = (name: string) =>
  name
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/^ai(?=[a-z])/, "ai-");

const aiParents = new Map(componentDocs.filter(({ category }) => category === "AI 界面")
  .map(({ name, sidebarParent }) => [name, sidebarParent]));

export function componentDocHref(name: string) {
  const aiParent = aiParents.get(name);
  return familyDocHref(name) ??
    (aiParent ? `#/components/${aiParent}?section=${aiDemoId(name)}` : baseComponentDocHref(name));
}

const nestedDocs = new Map(componentDocs.map((doc) => [componentDocHref(doc.name), doc]));

export function nestedComponentDoc(parent: string, section?: string) {
  return section ? nestedDocs.get(`#/components/${parent}?section=${section}`) : undefined;
}

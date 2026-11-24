import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import * as catalog from "../apps/docs/catalog";
import { inlineDocSections } from "../apps/docs/inline-demo-registry";
import { componentDocHref, DocsApp, parseRoute, searchDocs } from "../apps/docs/docs-app";
// Independent expected taxonomy. Within each group names are in reading order.
const expected: Record<string, string[]> = {
  "布局容器": [
    "AdminLayout", "PageLayout", "Toolbar", "SectionGroup", "Panel", "Splitter", "Affix", "Divider",
  ],
  "基础组件": [
    "Button", "ButtonGroup", "Typography", "Title", "Text",
    "Paragraph", "Link", "Blockquote", "HoverMarquee",
  ],
  "导航切换": [
    "Sidebar", "NavGroup", "NavItem", "NavSubmenu", "Breadcrumb",
    "TableOfContents", "Tabs", "Pagination",
  ],
  "表单输入": [
    "Form", "Fieldset", "SettingRow", "SettingsDialog", "Input",
    "Mentions", "NumberInput", "AutoComplete", "Select",
    "TreeSelect", "Cascader", "CascaderPanel", "Transfer",
    "Checkbox", "RadioGroup", "Switch", "TagSelect", "CheckCard",
    "Slider", "Rate", "DatePicker",
    "Upload", "Questionnaire",
  ],
  "数据展示": [
    "Card", "CardGroup", "List", "ListItem", "DataList",
    "DocumentList", "DocumentCard", "Table", "DataTable", "Tree",
    "PropertyList", "PropertyItem", "Image", "ImageGroup", "ImagePreview",
    "Avatar", "AvatarGroup", "Tag", "Calendar", "Timeline",
  ],
  "弹层与菜单": [
    "Popover", "Menu", "ContextMenu", "Menubar", "HoverCard",
    "Tooltip", "Spotlight", "Dialog", "ConfirmDialog", "Popconfirm",
    "Drawer", "FloatingWindow",
  ],
  "状态反馈": [
    "Alert", "GlobalNotice", "ToastProvider", "Status",
    "Progress", "Spinner", "LoadingOverlay", "Skeleton", "Empty",
    "Result",
  ],
  "AI 界面": [
    "AiChat", "AiMessage", "AiPromptInput", "AiSuggestion", "AiModelSelector",
    "AiPlan", "AiReasoning", "AiTask", "AiQueue",
    "AiSubagent", "AiTool", "AiCheckpoint", "AiConfirmation", "AiSources",
    "AiInlineCitation", "AiContext", "AiFileTree", "AiStackTrace", "AiTerminal",
    "AiTestResults",
  ],
  "全局配置": [
    "MtoneProvider", "MtoneScope", "ShortcutsProvider",
  ],
};
const categories = Object.keys(expected);
describe("documentation taxonomy", () => {
  it("uses a closed, explicitly ordered taxonomy and assigns every export once", () => {
    expect(catalog.componentCategories).toEqual(categories);
    expect(Object.values(expected).flat().sort()).toEqual(
      catalog.componentDocs.map((d) => d.name).sort(),
    );
    for (const [group, names] of Object.entries(expected)) {
      expect(
        catalog.componentDocs
          .filter((d) => d.category === group)
          .map((d) => d.name)
          .sort(),
      ).toEqual([...names].sort());
    }
  });
  it("renders sidebar groups in declared order with no duplicate component links", () => {
    window.location.hash = "#/components/Button";
    const { container } = render(<DocsApp />);
    const nav = within(container).getByRole("navigation", { name: "文档导航" });
    const groups = Array.from(nav.querySelectorAll(":scope > .mt-nav-group"));
    expect(groups.map((group) => group.querySelector(":scope > .mt-nav-label")?.textContent))
      .toEqual(["开始使用", ...categories]);

    // Walk accessible links once, rather than scanning the whole navigation
    // for every component name.
    const linksByGroup = new Map(groups.map((group) => [group, [] as HTMLElement[]]));
    for (const link of within(nav).getAllByRole("link")) {
      const groupLinks = linksByGroup.get(link.closest(".mt-nav-group")!);
      expect(groupLinks).toBeDefined();
      groupLinks!.push(link);
    }
    const sectionOnly = new Set([
      "Title", "Text", "Paragraph", "Link", "Blockquote", "Textarea",
      "ImageGroup", "ImagePreview", "CascaderPanel", "AvatarGroup", "DocumentCard", "PropertyItem",
      "AiMessage", "AiPromptInput", "AiSuggestion", "AiModelSelector",
      "AiReasoning", "AiTask", "AiQueue", "AiSubagent",
      "AiTool", "AiCheckpoint", "AiConfirmation", "AiInlineCitation", "AiContext",
      "AiFileTree", "AiStackTrace", "AiTerminal", "AiTestResults",
    ]);
    const expectedLinks = [
      ["快速开始", "Component gallery", "应用示例", "主题与样式", "颜色预设", "llms.txt"],
      ...categories.map((category) =>
        expected[category].filter((name) => !sectionOnly.has(name)),
      ),
    ];
    for (const [index, group] of groups.entries()) {
      const links = linksByGroup.get(group)!;
      const names = expectedLinks[index];
      expect(links).toHaveLength(names.length);
      for (const [position, link] of links.entries()) {
        const name = names[position];
        expect(link).toHaveAccessibleName(name);
        if (index > 0) expect(link).toHaveAttribute("href", `#/components/${name}`);
        expect(link.getAttribute("aria-current")).toBe(name === "Button" ? "page" : null);
      }
    }
    expect(
      screen.getByRole("heading", { name: "Button", level: 1 }),
    ).toBeInTheDocument();
  });
  it("keeps PropertyItem as a section and API of the single PropertyList page", () => {
    expect(componentDocHref("PropertyItem")).toBe("#/components/PropertyList?section=property-item");
    for (const old of ["", "?section=usage", "?section=props", "?section=notes"]) {
      expect(parseRoute("#/components/PropertyItem" + old)).toEqual({ kind: "not-found" });
    }
    window.location.hash = "#/components/PropertyList?section=property-item";
    render(<DocsApp />);
    expect(screen.getByRole("heading", { name: "PropertyList", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "PropertyItem", level: 2 })).toHaveAttribute("id", "property-item");
    const api = screen.getByRole("region", { name: "PropertyItem 属性与接口" });
    expect(within(api).getByRole("row", { name: /label ReactNode/ })).toBeInTheDocument();
    expect(within(api).getByRole("row", { name: /children ReactNode/ })).toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "本页目录" })).getByRole("link", { name: /^PropertyItem$/ }))
      .toHaveAttribute("href", "#/components/PropertyList?section=property-item");
    expect(within(screen.getByRole("navigation", { name: "文档导航" })).queryByRole("link", { name: "PropertyItem" })).toBeNull();
  });
  it("does not retain the removed icon button page, redirect, or search result", () => {
    expect(parseRoute("#/components/IconButton")).toEqual({ kind: "not-found" });
    expect(parseRoute("#/components/IconButton?section=usage")).toEqual({ kind: "not-found" });
    expect(searchDocs("IconButton")).toEqual([]);
    expect(catalog.componentDocs.some((doc) => doc.name === "IconButton")).toBe(false);
  });
  it.each([
    ["Dropzone", "Upload", "drag-and-drop", "<M.Upload"],
    ["Segmented", "RadioGroup", "segmented", 'variant="segmented"'],
  ])("replaces %s with an example under %s", (removed, owner, id, snippet) => {
    expect(parseRoute(`#/components/${removed}`)).toEqual({ kind: "not-found" });
    expect(parseRoute(`#/components/${removed}?section=usage`)).toEqual({ kind: "not-found" });
    expect(searchDocs(removed).map((doc) => doc.name)).not.toContain(removed);
    expect(inlineDocSections[removed]).toBeUndefined();
    expect(inlineDocSections[owner]?.find((section) => section.id === id)?.source)
      .toContain(snippet);
  });
  it("documents Tag without a Badge route or search entry", () => {
    expect(parseRoute("#/components/Badge?section=removable")).toEqual({ kind: "not-found" });
    expect(searchDocs("Badge").map((doc) => doc.name)).not.toContain("Badge");
    expect(inlineDocSections.Badge).toBeUndefined();
    expect(inlineDocSections.Tag?.find((section) => section.id === "removable")?.source)
      .toContain("<M.Tag");
    window.location.hash = "#/components/Tag?section=removable";
    render(<DocsApp />);
    expect(screen.getByRole("heading", { name: "Tag", level: 1 })).toBeInTheDocument();
  });
  it("keeps the Button icon-only docs and canonical deep link", () => {
    window.location.hash = "#/components/Button?section=icon-only";
    render(<DocsApp />);
    expect(screen.getByRole("heading", { name: "Button", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "纯图标按钮", level: 2 })).toHaveAttribute("id", "icon-only");
  });
  it("shows three AI sidebar groups and keeps all 20 components discoverable", () => {
    window.location.hash = "#/components/AiChat?section=ai-prompt-input";
    const { container } = render(<DocsApp />);
    const nav = container.querySelector(".docs-sidebar nav")!;
    const group = within(nav as HTMLElement).getByText("AI 界面").parentElement!;
    expect(within(group).getAllByRole("link").map((link) => link.textContent))
      .toEqual(["AiChat", "AiPlan", "AiSources"]);
    expect(within(group).getByRole("link", { name: "AiChat" }))
      .toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("heading", { name: "模拟对话", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "AiPromptInput · 输入与附件", level: 2 }))
      .toHaveAttribute("id", "ai-prompt-input");
    expect(searchDocs("AI 界面")).toHaveLength(20);
  });
  it("searches the new categories while preserving description matching", () => {
    expect(
      searchDocs("表单输入")
        .map((d) => d.name)
        .sort(),
    ).toEqual([...expected.表单输入].sort());
    expect(searchDocs("布局容器").map((d) => d.name)).toEqual(
      expect.arrayContaining(expected.布局容器),
    );
  });
});

it("offers an independent SectionGroup guide and a dedicated Sidebar composition demo", () => {
  expect(inlineDocSections.SectionGroup.map((section) => section.id)).toContain("usage");
  expect(inlineDocSections.Sidebar.find((section) => section.id === "section-group")?.source).toContain("<M.SectionGroup.Section");
});

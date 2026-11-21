import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import * as catalog from "../apps/docs/catalog";
import { DocsApp, searchDocs } from "../apps/docs/docs-app";
const categories = [
  "布局容器",
  "操作命令",
  "导航切换",
  "数据录入",
  "数据展示",
  "AI 界面",
  "浮层对话",
  "状态反馈",
  "全局配置",
];
const expected: Record<string, string[]> = {
  布局容器: ["CardGroup", "Affix", "AdminLayout", "PageLayout", "Splitter", "Divider"],
  操作命令: [
    "Button",
    "IconButton",
    "ButtonGroup",
    "Menu",
    "Menubar",
    "ContextMenu",
    "Spotlight",
  ],
  导航切换: [
    "TableOfContents",
    "Sidebar",
    "NavItem",
    "NavSubmenu",
    "NavGroup",
    "Breadcrumb",
    "Tabs",
    "Pagination",
    "Segmented",
  ],
  数据录入: [
    "CheckCard",
    "Questionnaire",
    "Cascader",
    "CascaderPanel",
    "Transfer",
    "TreeSelect",
    "AutoComplete",
    "Rate",
    "Input",
    "SearchInput",
    "Textarea",
    "Mentions",
    "Fieldset",
    "Form",
    "FormField",
    "Checkbox",
    "Switch",
    "TagSelect",
    "RadioGroup",
    "Select",
    "MultiSelect",
    "Slider",
    "NumberInput",
    "DatePicker",
    "FilterBar",
    "FilterChip",
    "Upload",
    "Dropzone",
  ],
  数据展示: [
    "Image",
    "ImageGroup",
    "ImagePreview",
    "Calendar",
    "Card",
    "Text",
    "Typography",
    "Blockquote",
    "Title",
    "Paragraph",
    "Link",
    "List",
    "DataList",
    "ListItem",
    "DocumentList",
    "DocumentCard",
    "Table",
    "Tree",
    "DirectoryTree",
    "Badge",
    "Avatar",
    "Timeline",
    "AvatarGroup",
    "PropertyList",
    "PropertyItem",
  ],
  "AI 界面": [
    "AiChat", "AiMessage", "AiPromptInput", "AiSuggestion", "AiModelSelector",
    "AiPlan", "AiChainOfThought", "AiReasoning", "AiTask", "AiQueue",
    "AiSubagent", "AiTool", "AiCheckpoint", "AiConfirmation",
    "AiSources", "AiInlineCitation", "AiContext", "AiFileTree", "AiStackTrace",
    "AiTerminal", "AiTestResults",
  ],
  浮层对话: ["HoverCard",
    "Popconfirm",
    "Dropdown", "Popover",
    "Tooltip",
    "Dialog",
    "Drawer",
    "ConfirmDialog",
  ],
  状态反馈: [
    "Result",
    "Status",
    "Progress",
    "Alert",
    "Empty",
    "Skeleton",
    "Spinner",
    "LoadingOverlay",
    "Toast",
    "ToastProvider",
  ],
  全局配置: ["MtoneProvider", "MtoneScope"],
};
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
    const nav =
      container.querySelector(".docs-sidebar nav") ??
      container.querySelector("aside nav");
    expect(nav).not.toBeNull();
    expect(
      Array.from(nav!.querySelectorAll(":scope > .mt-nav-group > .mt-nav-label")).map(
        (e) => e.textContent,
      ),
    ).toEqual(["开始使用", ...categories]);
    for (const doc of catalog.componentDocs.filter((doc) => !doc.sidebarParent && !["Title", "Text", "Paragraph", "Link", "Blockquote", "SearchInput", "Textarea", "IconButton"].includes(doc.name))) {
      expect(
        within(nav as HTMLElement).getAllByRole("link", { name: doc.name }),
      ).toHaveLength(1);
    }
    expect(
      screen.getByRole("heading", { name: "Button", level: 1 }),
    ).toBeInTheDocument();
  });
  it("opens canonical Button icon-only docs from the legacy IconButton URL", () => {
    window.location.hash = "#/components/IconButton?section=usage";
    const { container } = render(<DocsApp />);
    const nav = container.querySelector(".docs-sidebar nav")!;
    expect(within(nav as HTMLElement).queryByRole("link", { name: "IconButton" })).not.toBeInTheDocument();
    expect(within(nav as HTMLElement).getByRole("link", { name: "Button" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("heading", { name: "Button", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "纯图标按钮", level: 2 })).toHaveAttribute("id", "icon-only");
    expect(searchDocs("IconButton").map((doc) => doc.name)).toContain("IconButton");
  });
  it("shows three AI sidebar groups and keeps all 21 components discoverable", () => {
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
    expect(searchDocs("AI 界面")).toHaveLength(21);
  });
  it("searches the new categories while preserving description matching", () => {
    expect(
      searchDocs("数据录入")
        .map((d) => d.name)
        .sort(),
    ).toEqual([...expected.数据录入].sort());
    expect(searchDocs("布局容器").map((d) => d.name)).toEqual(
      expect.arrayContaining(expected.布局容器),
    );
  });
});

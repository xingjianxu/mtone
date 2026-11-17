import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import * as catalog from "../apps/docs/catalog";
import { DocsApp, searchDocs } from "../apps/docs/docs-app";
const categories = ["布局容器", "操作命令", "导航切换", "数据录入", "数据展示", "浮层对话", "状态反馈", "全局配置"];
const expected: Record<string, string[]> = {
  布局容器: ["Affix", "Layout", "Splitter", "Divider"],
  操作命令: ["Button", "IconButton", "ButtonGroup", "DropdownMenu", "ContextMenu", "Spotlight"],
  导航切换: ["TableOfContents", "Sidebar", "NavItem", "NavGroup", "Breadcrumb", "Tabs", "Pagination", "Segmented"],
  数据录入: ["Rate", "Input", "SearchInput", "Textarea", "Mentions", "Form", "FormField", "Checkbox", "Switch", "RadioGroup", "Select", "MultiSelect", "Slider", "NumberInput", "DatePicker", "FilterBar", "FilterChip", "Upload", "Dropzone"],
  数据展示: ["Image", "ImageGroup", "ImagePreview", "Calendar", "Card", "Text", "List", "ListItem", "DocumentList", "DocumentCard", "Table", "Tree", "DirectoryTree", "Badge", "Avatar", "Timeline", "AvatarGroup", "PropertyList", "PropertyItem"],
  浮层对话: ["Popconfirm", "Popover", "Tooltip", "Dialog", "Drawer", "ConfirmDialog"],
  状态反馈: ["Result", "Status", "Progress", "Alert", "Empty", "Skeleton", "Spinner", "Toast", "ToastProvider"],
  全局配置: ["MtoneProvider", "MtoneScope"],
};
describe("documentation taxonomy", () => {
  it("uses a closed, explicitly ordered taxonomy and assigns every export once", () => {
    expect(catalog.componentCategories).toEqual(categories);
    expect(Object.values(expected).flat().sort()).toEqual(catalog.componentDocs.map(d => d.name).sort());
    for (const [group, names] of Object.entries(expected)) {
      expect(catalog.componentDocs.filter(d => d.category === group).map(d => d.name).sort()).toEqual([...names].sort());
    }
  });
  it("renders sidebar groups in declared order with no duplicate component links", () => {
    window.location.hash = "#/components/Button";
    const {container} = render(<DocsApp />);
    const nav = container.querySelector(".docs-sidebar nav") ?? container.querySelector("aside nav");
    expect(nav).not.toBeNull();
    expect(Array.from(nav!.querySelectorAll(".nav-heading")).map(e => e.textContent)).toEqual(["开始使用", ...categories]);
    for (const doc of catalog.componentDocs) {
      expect(within(nav as HTMLElement).getAllByRole("link", {name: doc.name})).toHaveLength(1);
    }
    expect(screen.getByRole("heading", {name:"Button",level:1})).toBeInTheDocument();
  });
  it("searches the new categories while preserving description matching", () => {
    expect(searchDocs("数据录入").map(d => d.name).sort()).toEqual([...expected.数据录入].sort());
    expect(searchDocs("布局容器").map(d => d.name)).toEqual(expect.arrayContaining(expected.布局容器));
  });
});

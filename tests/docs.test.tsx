import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import * as M from "../packages/mtone/src";
import { componentDocs } from "../apps/docs/catalog";
import { ComponentExample } from "../apps/docs/examples";
import { docSections, parseRoute, searchDocs } from "../apps/docs/docs-app";
// These supporting exports share a component guide instead of having standalone pages.
const nonStandaloneExports = [
  "cn", "useMtone", "useToast", "getMentions",
  "ShortcutScope", "useShortcut", "formatShortcut", "TooltipProvider",
];

describe("documentation", () => {
  it("covers every component export without counting hooks as components", () => {
    const names = Object.keys(M).filter(
      (k) => !nonStandaloneExports.includes(k),
    );
    expect(componentDocs.filter((d) => !d.packageName).map((d) => d.name).sort()).toEqual(names.sort());
    expect(componentDocs.filter((d) => d.packageName).map((d) => [d.name,d.packageName])).toEqual([["BlockEditor","mtone-blocknote"]]);
    expect(M).not.toHaveProperty("BlockEditor");
    expect(docSections.BlockEditor.find((d) => d.id === "usage")?.source).toContain('from "mtone-blocknote"');
    expect(new Set(componentDocs.map((d) => d.name)).size).toBe(
      componentDocs.length,
    );
    for (const doc of componentDocs) {
      expect(doc.code).toContain(doc.name);
      expect(doc.description.length).toBeGreaterThan(4);
    }
  });
  it("handles routes and unknown routes safely", () => {
    expect(parseRoute("#/components/Button")).toEqual({
      kind: "component",
      name: "Button",
    });
    expect(parseRoute("#/components/DropdownMenu")).toEqual({ kind: "not-found" });
    expect(parseRoute("#/components/MultiSelect")).toEqual({ kind: "not-found" });
    expect(parseRoute("#/components/Modal")).toEqual({ kind: "not-found" });
    expect(parseRoute("#/showcase")).toEqual({ kind: "showcase" });
    expect(parseRoute("#/apps")).toEqual({ kind: "showcase" });
    expect(parseRoute("#/garbage").kind).toBe("not-found");
    expect(parseRoute("").kind).toBe("gallery");
  });
  it("documents native Table and data-driven DataTable on separate routes", () => {
    expect(parseRoute("#/components/Table")).toEqual({ kind: "component", name: "Table" });
    expect(parseRoute("#/components/DataTable?section=sorting")).toEqual({
      kind: "component", name: "DataTable", section: "sorting",
    });
    const native = docSections.Table.find(({ id }) => id === "basic");
    expect(native?.source).toContain("<thead>");
    expect(native?.source).not.toMatch(/dataSource=|columns=/);
    expect(docSections.Table.map(({ id }) => id)).not.toContain("sort-filter");
    expect(docSections.DataTable.map(({ id }) => id)).toContain("sort-filter");
    expect(docSections.DataTable.find(({ id }) => id === "toolbar")?.source).toContain("<DataTable");

    const Demo = native!.Demo!;
    render(<Demo />);
    expect(screen.getByRole("table", { name: "本周项目" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "项目" })).toHaveAttribute("scope", "col");
  });
  it("publishes the composed Sidebar and Tree document navigation example", () => {
    const section = "document-navigation";
    expect(parseRoute(`#/components/Tree?section=${section}`)).toEqual({ kind: "component", name: "Tree", section });
    const demo = docSections.Tree.find(({ id }) => id === section);
    expect(demo?.source).toContain('from "@bixlab/mtone"');
    for (const fragment of ["<Sidebar", "<Tree", "expandAction={false}", "endContent=", "loadData="]) {
      expect(demo?.source).toContain(fragment);
    }
    const Demo = demo!.Demo!;
    render(<Demo />);
    const panel = screen.getByRole("complementary", { name: "文档导航侧栏" });
    expect(panel).toContainElement(screen.getByRole("tree", { name: "文档目录" }));
    expect(screen.getByRole("treeitem", { name: "快速开始", selected: true })).toBeVisible();
  });
  it("publishes separate examples for all three sidebar resize compositions", () => {
    for (const [name, id, fragment] of [
      ["Sidebar", "resize", "<Splitter.Panel"],
      ["AdminLayout", "sidebar-resize", "sidebarResize="],
      ["PageLayout", "sidebar-resize", "sidebarResize="],
    ]) {
      expect(parseRoute(`#/components/${name}?section=${id}`)).toEqual({ kind: "component", name, section: id });
      const demo = docSections[name].find((item) => item.id === id);
      expect(demo?.source).toContain('from "@bixlab/mtone"');
      expect(demo?.source).toContain(fragment);
    }
  });
  it("shows explicit framed Toolbar composition in DataTable and DataList demos", () => {
    const table = docSections.DataTable.find(({ id }) => id === "toolbar")?.source;
    expect(table).toContain("toolbar={");
    expect(table).toContain("<Toolbar");
    expect(table).not.toMatch(/borderRadius|overflow:\s*["']clip/);
    const narrow = docSections.Toolbar.find(({ id }) => id === "narrow")?.source;
    expect(narrow).toContain("toolbar={");
    const local = docSections.DataList.find(({ id }) => id === "local-data")?.source;
    expect(local).toContain("<Toolbar");
    expect(local).toMatch(/start=\{[\s\S]*<DataList\.Selection>[\s\S]*<DataList\.Search/);
    expect(local).not.toMatch(/filters=|renderBatchActions=/);
    const remote = docSections.DataList.find(({ id }) => id === "remote-data")?.source;
    expect(remote).toContain("search={<DataList.Search");
  });
  it("documents default gray borderless Toolbar controls and an explicit white alternative", () => {
    const demo = docSections.Toolbar.find(({ id }) => id === "borderless-controls");
    expect(demo?.source).not.toMatch(/background=|controlStyle=/);
    const appearance = componentDocs.find(({ name }) => name === "Toolbar")?.props;
    expect(appearance?.find(({ name }) => name === "background")?.default).toBe('"gray"');
    expect(appearance?.find(({ name }) => name === "controlStyle")?.default).toBe('"borderless"');
    expect(docSections.Toolbar.find(({ id }) => id === "page")?.source).toContain('background="white"');
    expect(demo?.source).toContain("<Select");
    expect(demo?.source).toContain("<ButtonGroup connected");
    expect(docSections.Toolbar.find(({ id }) => id === "standalone")?.source).not.toContain("controlStyle");
  });
  it("keeps Tooltip usage and publishes copyable advanced examples", () => {
    const sections = docSections.Tooltip;
    expect(searchDocs("TooltipProvider")).toContainEqual(expect.objectContaining({ name: "Tooltip" }));
    expect(sections.map(({ id }) => id)).toEqual([
      "usage", "placement", "triggers", "appearance", "disabled", "container",
    ]);
    for (const { id, Demo, source } of sections) {
      expect(parseRoute(`#/components/Tooltip?section=${id}`)).toEqual({
        kind: "component", name: "Tooltip", section: id,
      });
      expect(Demo).toBeDefined();
      expect(source).toContain('from "@bixlab/mtone"');
      expect(source).toContain("Tooltip");
    }
  });
  it("documents keyboard-shortcut utilities together and demos switching active scopes", () => {
    const route = "#/components/ShortcutsProvider?section=usage";
    expect(parseRoute(route)).toEqual({ kind: "component", name: "ShortcutsProvider", section: "usage" });
    const doc = componentDocs.find(({ name }) => name === "ShortcutsProvider");
    expect(doc?.importNames).toEqual(["ShortcutsProvider", "ShortcutScope", "useShortcut", "formatShortcut"]);
    for (const tool of doc!.importNames) {
      expect(searchDocs(tool)).toContain(doc);
    }

    const usage = docSections.ShortcutsProvider.find(({ id }) => id === "usage");
    expect(usage?.source).toContain("<ShortcutScope");
    const Demo = usage!.Demo!;
    render(<Demo />);
    const shortcut = { key: "F2", shiftKey: true };
    fireEvent.keyDown(document, shortcut);
    expect(screen.getByRole("status")).toHaveTextContent("尚未保存");

    fireEvent.click(screen.getByRole("button", { name: "演示快捷键" }));
    fireEvent.keyDown(screen.getByRole("textbox", { name: "草稿名称" }), shortcut);
    expect(screen.getByRole("status")).toHaveTextContent("尚未保存");

    fireEvent.keyDown(document, shortcut);
    expect(screen.getByRole("status")).toHaveTextContent("已保存草稿");
    fireEvent.click(screen.getByRole("button", { name: "编辑器作用域" }));
    fireEvent.keyDown(document, shortcut);
    expect(screen.getByRole("status")).toHaveTextContent("已保存工作区");

    fireEvent.click(screen.getByRole("button", { name: /保存草稿/ }));
    expect(screen.getByRole("status")).toHaveTextContent("已保存草稿");
  });
  it("searches names and Chinese descriptions", () => {
    expect(searchDocs("button").some((d) => d.name === "Button")).toBe(true);
    expect(searchDocs("zzzzzz")).toEqual([]);
    expect(searchDocs("")).toHaveLength(componentDocs.length);
  });
  it.each(
    Object.keys(M).filter((k) => !nonStandaloneExports.includes(k)),
  )("renders %s example", (name) => {
    render(
      <M.MtoneProvider>
        <M.ToastProvider>
          <ComponentExample name={name} />
        </M.ToastProvider>
      </M.MtoneProvider>,
    );
    expect(document.body.textContent).not.toContain("暂无示例");
    cleanup();
  });
});

describe("documentation navigation", () => {
  it("shows not found and recovers through hash navigation", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.location.hash = "#/missing";
    const { DocsApp } = await import("../apps/docs/docs-app");
    render(<DocsApp />);
    expect(
      screen.getByRole("heading", { name: "页面未找到" }),
    ).toBeInTheDocument();
    const { act } = await import("@testing-library/react");
    await act(async () => {
      window.location.hash = "#/components/Button";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(
      screen.getByRole("heading", { name: "Button", level: 1 }),
    ).toBeInTheDocument();
    cleanup();
    window.location.hash = "";
  });
});


it("opens the app showcase safely in a new tab", async () => {
  window.location.hash = "#/gallery";
  const { DocsApp } = await import("../apps/docs/docs-app");
  render(<DocsApp />);
  for (const link of screen.getAllByRole("link", { name: /应用示例/ })) {
    expect(link).toHaveAttribute("href", "./showcase.html");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
});

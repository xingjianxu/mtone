import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { DocsApp, parseRoute, docSections, componentDocHref } from "../apps/docs/docs-app";

import type { DocSection } from "../apps/docs/doc-section";
import { componentDocs } from "../apps/docs/catalog";
import { typographySectionId } from "../apps/docs/typography-navigation";
test("accepts directly linked demo and API anchors", () => {
  expect(parseRoute("#/components/DataTable?section=row-selection")).toEqual(
    { kind: "component", name: "DataTable", section: "row-selection" }
  );
});

test("component page gives access to a shareable API anchor", () => {
  window.location.hash = "#/components/Button";
  render(<DocsApp />);
  const outline = screen.getAllByRole("navigation", { name: "本页目录" })[0];
  expect(within(outline).getByRole("link", { name: "API" }).getAttribute("href")).toBe("#/components/Button?section=props");
});

test.each([
  ["#/components/Button", "Button", undefined],
  ["#/components/Title", "Title", "typography-title"],
  ["#/components/Avatar?section=groups", "AvatarGroup", "groups"],
  ["#/components/AiChat?section=ai-message", "AiMessage", "ai-message"],
  ["#/components/Input?section=input-search-submit", "Input", undefined],
] as const)("links to the proper AI reference on %s", (hash, name, anchor) => {
  window.location.hash = hash;
  const { container } = render(<DocsApp />);
  const nav = screen.getByRole("navigation", { name: "文档导航" });
  const globalLink = within(nav).getByRole("link", { name: "llms.txt" });
  expect(globalLink).toHaveAttribute("href", "/llms.txt");
  expect(globalLink).toHaveAttribute("target", "_blank");
  expect(globalLink).toHaveAttribute("rel", "noopener noreferrer");
  const importBar = within(container.querySelector(".component-import") as HTMLElement);
  const href = `/components/${name}/llms.txt`;
  const pageLink = importBar.getByRole("link", { name: `${name} llms.txt` });
  expect(pageLink).toHaveAttribute("href", href);
  expect(pageLink).toHaveAttribute("target", "_blank");
  expect(pageLink).toHaveAttribute("rel", "noopener noreferrer");
  expect(importBar.getByRole("button", { name: "复制导入语句" })).toBeVisible();
  if (anchor) {
    const section = document.getElementById(anchor)!.closest("section")!;
    const sectionLink = within(section).getByRole("link", { name: `${name} llms.txt` });
    expect(sectionLink).toHaveAttribute("href", href);
    expect(sectionLink).toHaveAttribute("target", "_blank");
    expect(sectionLink).toHaveAttribute("rel", "noopener noreferrer");
  }
});

test("copies a nested component's plain-text reference, not its URL, and reports fetch errors", async () => {
  window.location.hash = "#/components/AiChat?section=ai-message";
  const text = "# AiMessage\n\n- Import: AiMessage from @bixlab/mtone\n示例内容\n";
  const getReference = vi.fn()
    .mockResolvedValueOnce(new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } }))
    .mockResolvedValueOnce(new Response("<html>SPA fallback</html>", { headers: { "Content-Type": "text/html" } }))
    .mockResolvedValueOnce(new Response("not found", { status: 404, headers: { "Content-Type": "text/plain" } }));
  const writeText = vi.fn().mockResolvedValue(undefined);
  const descriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  vi.stubGlobal("fetch", getReference);
  try {
    const { container } = render(<DocsApp />);
    const header = container.querySelector(".component-import") as HTMLElement;
    const reference = within(header.querySelector(".component-reference") as HTMLElement);
    const copy = reference.getByRole("button", { name: "复制 AiMessage llms.txt 内容" });
    fireEvent.click(copy);
    await waitFor(() => expect(reference.getByRole("status")).toHaveTextContent("已复制"));
    expect(getReference).toHaveBeenLastCalledWith("/components/AiMessage/llms.txt");
    expect(writeText).toHaveBeenLastCalledWith(text);

    fireEvent.click(copy);
    await waitFor(() => expect(reference.getByRole("status")).toHaveTextContent("复制失败"));
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(reference.getByRole("link", { name: "AiMessage llms.txt" })).toBeVisible();

    fireEvent.click(copy);
    await waitFor(() => expect(reference.getByRole("status")).toHaveTextContent("复制失败"));
    expect(writeText).toHaveBeenCalledTimes(1);

    fireEvent.click(within(header).getByRole("button", { name: "复制导入语句" }));
    await waitFor(() => expect(writeText).toHaveBeenLastCalledWith(header.querySelector("code")!.textContent));
    expect(writeText.mock.lastCall?.[0]).toContain("import { AiMessage");
  } finally {
    vi.unstubAllGlobals();
    if (descriptor) Object.defineProperty(navigator, "clipboard", descriptor);
    else Reflect.deleteProperty(navigator, "clipboard");
  }
});

test("every canonical doc link lands on a labeled page or nested section with source for each preview", () => {
  const sectionIds = new Map<string, Set<string>>();
  for (const doc of componentDocs) {
    const href = componentDocHref(doc.name);
    const route = parseRoute(href);
    expect(route.kind, `${doc.name} → ${href}`).toBe("component");
    if (route.kind !== "component") continue;
    const sections = docSections[route.name];
    expect(sections?.length, route.name).toBeGreaterThan(0);
    const ids = sectionIds.get(route.name) ?? new Set<string>();
    const visit = (items: readonly DocSection[]) => {
      for (const item of items) {
        expect(ids.has(item.id), `${route.name} #${item.id}`).toBe(false);
        ids.add(item.id);
        expect(item.title).not.toBe("");
        if (item.Demo && !item.playground) expect(item.source).toContain("@bixlab/mtone");
        else if (!item.Demo) expect(item.children?.length).toBeGreaterThan(0);
        if (item.children) visit(item.children);
      }
    };
    if (!sectionIds.has(route.name)) {
      visit(sections);
      sectionIds.set(route.name, ids);
    }
    if (route.section) {
      const target = route.name === "Typography"
        ? typographySectionId(route.section)
        : route.section;
      expect(ids.has(target), href).toBe(true);
    }
    if (doc.sidebarSection) {
      expect(route).toEqual({
        kind: "component", name: doc.sidebarParent, section: doc.sidebarSection,
      });
      expect(parseRoute(`#/components/${doc.name}`)).toEqual({ kind: "not-found" });
    }
  }
});

test("docs use one library TOC with nested links and refocus the same routed section", async () => {
  window.location.hash = "#/components/Input?section=input-search-submit";
  render(<DocsApp />);
  const outline = screen.getByRole("navigation", { name: "本页目录" });
  expect(outline).toHaveAttribute("data-mt-toc");
  const target = document.getElementById("input-search-submit")!;
  expect(document.activeElement).toBe(target);
  const searchLink = outline.querySelector('a[href="#/components/Input?section=input-search-submit"]')!;
  expect(searchLink.closest("li")?.parentElement?.closest("li")).not.toBeNull();

  screen.getByRole("link", { name: "快速开始" }).focus();
  fireEvent.click(searchLink, { ctrlKey: true });
  expect(document.activeElement).not.toBe(target);
  fireEvent.click(searchLink);
  await waitFor(() => expect(document.activeElement).toBe(target));
  expect(window.location.hash).toBe("#/components/Input?section=input-search-submit");
});

test("PageLayout sidebar demo uses NavGroup for the category links", () => {
  window.location.hash = "#/components/PageLayout?section=sidebar";
  render(<DocsApp />);
  const sidebar = screen.getByRole("complementary", { name: "资料分类" });
  const group = within(sidebar).getByRole("button", { name: "全部资料" }).closest(".mt-nav-group");
  expect(group).toContainElement(within(sidebar).getByRole("button", { name: "参考材料" }));
});

test("demo disclosure uses Typography.Code and copies the exact source", async () => {
  window.location.hash = "#/components/PageLayout?section=sidebar";
  const writeText = vi.fn().mockResolvedValue(undefined);
  const clipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  try {
    render(<DocsApp />);
    const demo = document.getElementById("sidebar")!.parentElement!;
    const disclosure = within(demo).getByText("查看代码", { exact: true }).closest("details")!;
    expect(disclosure.open).toBe(false);
    fireEvent.click(disclosure.querySelector("summary")!);
    expect(disclosure.open).toBe(true);
    const block = disclosure.querySelector("pre");
    const expected = docSections.PageLayout.find(({ id }) => id === "sidebar")!.source;
    expect(expected).not.toContain("../playgrounds/");
    expect(block).toHaveClass("mt-typography-code-block");
    expect(block).toHaveAttribute("tabindex", "0");
    expect(block?.querySelector("code")?.textContent).toBe(expected);
    fireEvent.click(within(disclosure).getByRole("button", { name: "复制代码" }));
    await waitFor(() => expect(within(disclosure).getByRole("status")).toHaveTextContent("已复制"));
    expect(writeText).toHaveBeenCalledWith(expected);
  } finally {
    if (clipboard) Object.defineProperty(navigator, "clipboard", clipboard);
    else Reflect.deleteProperty(navigator, "clipboard");
  }
});


test("redirects the former Panel tab placement section to the combined IDE example", () => {
  expect(parseRoute("#/components/Panel?section=tab-placement")).toEqual({
    kind: "component", name: "Panel", section: "ide",
  });
});

test("PageLayout puts the combined playground first and reuses the old topbar deep link", ({ onTestFinished }) => {
  if (!window.PointerEvent) {
    vi.stubGlobal("PointerEvent", window.MouseEvent);
    onTestFinished(() => { vi.unstubAllGlobals(); });
  }
  window.location.hash = "#/components/PageLayout?section=topbar";
  render(<DocsApp />);
  expect(docSections.PageLayout[0]).toMatchObject({ id: "sidebar", title: "布局配置" });
  expect(parseRoute(window.location.hash)).toEqual({ kind: "component", name: "PageLayout", section: "sidebar" });
  expect(docSections.PageLayout.some(({ id }) => id === "topbar")).toBe(false);
  const section = within(document.getElementById("sidebar")!.parentElement!);
  const topbar = section.getByRole("switch", { name: "顶栏" });
  expect(topbar).toBeChecked();
  fireEvent.click(topbar);
  expect(section.queryByRole("button", { name: "标记已审阅" })).not.toBeInTheDocument();
  fireEvent.click(section.getByRole("switch", { name: "标签页" }));
  expect(section.queryByRole("tablist")).not.toBeInTheDocument();
  fireEvent.click(section.getByRole("switch", { name: "侧栏" }));
  expect(section.queryByRole("complementary", { name: "资料分类" })).not.toBeInTheDocument();
  expect(section.getByRole("button", { name: "侧栏：左侧" })).toBeDisabled();
  fireEvent.click(section.getByRole("button", { name: "重置" }));
  expect(topbar).toBeChecked();
  expect(section.getByRole("tablist")).toBeInTheDocument();
  expect(section.getByRole("complementary", { name: "资料分类" })).toBeInTheDocument();
});

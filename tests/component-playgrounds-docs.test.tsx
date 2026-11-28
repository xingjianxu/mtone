import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { componentDocs } from "../apps/docs/catalog";
import { isTypographySection } from "../apps/docs/typography-navigation";
import { docSections } from "../apps/docs/docs-app";

afterEach(cleanup);

if (!window.PointerEvent)
  window.PointerEvent = MouseEvent as typeof PointerEvent;

const pages = componentDocs.filter(
  (doc) =>
    !doc.sidebarParent && !doc.sidebarSection && !isTypographySection(doc.name),
);

test("every public component page starts with an interactive example and preserves unique section links", () => {
  const absent = pages.filter(
    ({ name }) => !docSections[name]?.[0]?.playground,
  );
  expect(absent.map(({ name }) => name)).toEqual([]);
  for (const { name } of pages) {
    const sections = docSections[name];
    expect(sections[0].Demo, name).toBeDefined();
    expect(new Set(sections.map(({ id }) => id)).size, name).toBe(
      sections.length,
    );
  }
});

test("Button playground renders real labeled controls with a reset", () => {
  const Demo = docSections.Button[0].Demo!;
  render(<Demo />);
  expect(
    screen.getByRole("group", { name: "Button 示例设置" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("combobox", { name: "外观" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "重置" })).toBeInTheDocument();
});

test.each(pages.map(({ name }) => name))(
  "%s starts with an accessible settings group and preview",
  (name) => {
    const Demo = docSections[name][0].Demo!;
    const { container } = render(<Demo />);
    const toolbar = within(
      screen.getByRole("group", { name: `${name} 示例设置` }),
    );
    const controls = toolbar
      .getAllByRole("button")
      .filter(
        (element) =>
          !["重置", "更多设置"].includes(element.textContent?.trim() ?? ""),
      );
    expect(
      controls.length +
        toolbar.queryAllByRole("combobox").length +
        toolbar.queryAllByRole("textbox").length +
        toolbar.queryAllByRole("switch").length,
    ).toBeGreaterThan(0);
    expect(
      container.querySelector(".docs-playground-preview"),
    ).not.toBeEmptyDOMElement();
  },
);

test("changing danger affects the preview Button and reset reverses it", () => {
  const Demo = docSections.Button[0].Demo!;
  render(<Demo />);
  const button = () => screen.getByRole("button", { name: "保存" });
  fireEvent.click(screen.getByRole("button", { name: "危险操作" }));
  expect(button()).toHaveClass("mt-danger");
  fireEvent.click(screen.getByRole("button", { name: "重置" }));
  expect(button()).toHaveClass("mt-size-md");
  expect(button()).not.toHaveClass("mt-danger");
});

test("NavGroup divider is shown between actual adjacent groups", () => {
  const Demo = docSections.NavGroup[0].Demo!;
  const { container } = render(<Demo />);
  const target = container.querySelector(".mt-nav-group + .mt-nav-group");
  expect(target).not.toBeNull();
  expect(target).not.toHaveAttribute("data-no-divider");
  fireEvent.click(screen.getByRole("button", { name: "顶部间隔线" }));
  expect(target).toHaveAttribute("data-no-divider");
});

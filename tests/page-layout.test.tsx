import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import * as Mtone from "../packages/mtone/src";

test("renders only the heading and content when optional slots are omitted", () => {
  const { PageLayout } = Mtone;
  const { container } = render(<PageLayout title="Inventory">Rows</PageLayout>);
  expect(screen.getByRole("heading", { level: 1, name: "Inventory" })).toBeVisible();
  expect(screen.queryByRole("main")).not.toBeInTheDocument();
  const root = container.firstElementChild!;
  expect([...root.children].map((element) => element.tagName)).toEqual(["DIV", "DIV"]);
  expect(root.querySelector(".mt-page-layout-header")).toHaveTextContent("Inventory");
  expect(root.lastElementChild).toHaveTextContent("Rows");
});

test("preserves slot order, native props, and interactive action handlers", () => {
  const { PageLayout } = Mtone;
  const click = vi.fn();
  render(<PageLayout id="overview" aria-label="Overview" className="dashboard" style={{ marginTop: 7 }}
    headingLevel={3} title={<em>Overview</em>} subtitle="Daily totals" icon={<span>Icon</span>}
    actions={<button onClick={click}>Export</button>} description="Totals are provisional"
    extra={<span>Updated today</span>} tabs={<button>History</button>}><div>Chart</div></PageLayout>);
  const root = document.getElementById("overview")!;
  expect(root).toHaveClass("dashboard");
  expect(root).toHaveStyle({ marginTop: "7px" });
  expect(root).toHaveAttribute("aria-label", "Overview");
  expect(root).not.toHaveAttribute("title");
  expect(screen.getByRole("heading", { level: 3 })).toContainElement(screen.getByText("Overview"));
  expect(root.firstElementChild).toHaveTextContent("IconOverviewDaily totalsExportTotals are provisionalUpdated today");
  expect(root.children[1]).toContainElement(screen.getByRole("button", { name: "History" }));
  expect(root.children[2]).toHaveTextContent("Chart");
  fireEvent.click(screen.getByRole("button", { name: "Export" }));
  expect(click).toHaveBeenCalledOnce();
});

test("omits empty optional rows", () => {
  const { PageLayout } = Mtone;
  const { container } = render(<PageLayout title="Title" subtitle="" icon={false} actions={null} description="" extra={[]} tabs={false} />);
  expect(container.querySelectorAll(".mt-page-layout-subtitle, .mt-page-layout-icon, .mt-page-layout-actions, .mt-page-layout-description, .mt-page-layout-extra, .mt-page-layout-tabs, .mt-page-layout-body")).toHaveLength(0);
});

test("does not create a second banner next to a shell header", () => {
  render(
    <>
      <header>Shell</header>
      <Mtone.PageLayout title="Inventory">Rows</Mtone.PageLayout>
    </>,
  );
  expect(screen.getAllByRole("banner")).toHaveLength(1);
  expect(screen.getByRole("heading", { level: 1, name: "Inventory" })).toBeVisible();
});

test.each([
  ["sm", "720px"], ["md", "960px"], ["lg", "1200px"], [840, "840px"],
] as const)("limits %s to %s on the original root, preserving native props", (maxWidth, expected) => {
  const ref = React.createRef<HTMLDivElement>();
  const { rerender } = render(
    <Mtone.PageLayout ref={ref} title="Projects" className="own-layout"
      style={{ marginTop: 12 }} maxWidth={maxWidth}>
      Content
    </Mtone.PageLayout>,
  );
  const root = ref.current!;
  expect(root).toHaveClass("mt-page-layout", "mt-page-layout-constrained", "own-layout");
  expect(root.style.getPropertyValue("--mt-page-layout-max-width")).toBe(expected);
  expect(root).not.toHaveAttribute("maxwidth");
  expect(root).toHaveStyle({ marginTop: "12px" });
  expect(root).toContainElement(screen.getByRole("heading", { name: "Projects" }));

  rerender(<Mtone.PageLayout ref={ref} title="Projects" style={{ marginTop: 12 }}>Content</Mtone.PageLayout>);
  expect(ref.current).toBe(root);
  expect(root).not.toHaveClass("mt-page-layout-constrained");
  expect(root.style.getPropertyValue("--mt-page-layout-max-width")).toBe("");
});

test.each([
  [{}, "TitleSaveDescriptionExtraTabsFiltersRows"],
  [{ sidebarPosition: "right" }, "TitleSaveDescriptionExtraTabsRowsFilters"],
  [{ headerSpan: "main" }, "FiltersTitleSaveDescriptionExtraTabsRows"],
  [{ sidebarPosition: "right", headerSpan: "main" }, "TitleSaveDescriptionExtraTabsRowsFilters"],
] as const)("preserves focus and reading order with sidebar options %j", (options, expected) => {
  const { container } = render(
    <Mtone.PageLayout title="Title" actions={<button>Save</button>}
      description="Description" extra="Extra" tabs={<button>Tabs</button>}
      sidebar={<Mtone.Sidebar aria-label="Page filters"><button>Filters</button></Mtone.Sidebar>}
      {...options}>
      <button>Rows</button>
    </Mtone.PageLayout>,
  );
  expect(container.firstElementChild?.textContent).toBe(expected);
  expect(screen.getAllByRole("complementary", { name: "Page filters" })).toHaveLength(1);
  expect(container.firstElementChild).not.toHaveAttribute("sidebarposition");
  expect(container.firstElementChild).not.toHaveAttribute("headerspan");
});

test("empty sidebar preserves the original direct slots", () => {
  const { container } = render(
    <Mtone.PageLayout title="Title" sidebar={<>{[false, null]}</>} sidebarPosition="right"
      headerSpan="main" tabs={<button>Tabs</button>}>
      Rows
    </Mtone.PageLayout>,
  );
  expect([...container.firstElementChild!.children].map((child) => child.className))
    .toEqual(["mt-page-layout-header", "mt-page-layout-tabs", "mt-page-layout-body"]);
});

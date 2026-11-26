import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import * as Mtone from "../packages/mtone/src";

test("separates application navigation, account actions, and page content without a global header", async () => {
  const action = vi.fn();
  const { AppLayout, NavItem, PageLayout } = Mtone;
  expect(AppLayout).toBeTypeOf("function");
  const { container } = render(
    <AppLayout
      brand="Workspace"
      navigation={<NavItem active>Projects</NavItem>}
      navigationLabel="Primary"
      account={{
        name: "Xu",
        description: "Personal",
        items: [{ key: "settings", label: "Settings", onSelect: action }],
      }}
    >
      <PageLayout title="Projects">Project list</PageLayout>
    </AppLayout>,
  );
  const nav = screen.getByRole("navigation", { name: "Primary" });
  expect(within(nav).getByRole("button", { name: "Projects" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(screen.getByRole("main")).toHaveTextContent("Project list");
  expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  expect(container.querySelector(".mt-layout-header")).toBeNull();
  const account = screen.getByRole("button", { name: "Xu" });
  expect(nav.contains(account)).toBe(false);
  expect(screen.getByRole("complementary").contains(account)).toBe(true);
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  fireEvent.click(account);
  fireEvent.click(await screen.findByRole("menuitem", { name: "Settings" }));
  expect(action).toHaveBeenCalledTimes(1);
});

test("omits empty account chrome and supports a custom footer and a non-main content wrapper", () => {
  const { AppLayout } = Mtone;
  const { rerender, container } = render(
    <AppLayout navigation="Pages">Body</AppLayout>,
  );
  expect(container.querySelector(".mt-sidebar-footer")).toBeNull();
  rerender(
    <AppLayout
      navigation="Pages"
      contentAs="section"
      contentLabel="Preview"
      sidebarFooter={<button>Switch workspace</button>}
      account={{ name: "Xu" }}
    >
      Body
    </AppLayout>,
  );
  expect(screen.queryByRole("main")).not.toBeInTheDocument();
  expect(screen.getByRole("region", { name: "Preview" })).toHaveTextContent(
    "Body",
  );
  expect(
    screen.getByRole("button", { name: "Switch workspace" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Xu")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Xu" })).not.toBeInTheDocument();
});

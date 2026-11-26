import React from "react";
import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import * as Mtone from "../packages/mtone/src";

test("renders a standalone Topbar with crumb, status and a right action", () => {
  const { Topbar, Breadcrumb, Button, Tag } = Mtone;
  expect(Topbar).toBeTypeOf("function");
  render(
    <Topbar
      breadcrumb={
        <Breadcrumb
          items={[{ label: "Notes", href: "/notes" }, { label: "Spec" }]}
        />
      }
      status={<Tag>Saved · v18</Tag>}
      extra={<Button>Record version</Button>}
    />,
  );
  const bar = screen.getByRole("banner");
  expect(within(bar).getByRole("link", { name: "Notes" })).toHaveAttribute(
    "href",
    "/notes",
  );
  expect(within(bar).getByText("Saved · v18")).toBeInTheDocument();
  expect(
    within(bar).getByRole("button", { name: "Record version" }),
  ).toBeInTheDocument();
});

test("AdminLayout.Header renders the same Topbar while retaining the older contract", () => {
  const { AdminLayout } = Mtone;
  const { container } = render(
    <AdminLayout.Header
      id="admin-header"
      breadcrumb="Path"
      extra={<button>Settings</button>}
    >
      Details
    </AdminLayout.Header>,
  );
  expect(screen.getByRole("banner")).toHaveClass(
    "mt-topbar",
    "mt-layout-header",
  );
  expect(screen.getByRole("banner")).toHaveAttribute("id", "admin-header");
  expect(container.querySelector(".mt-layout-header-main")).toHaveTextContent(
    "PathDetails",
  );
  expect(container.querySelector(".mt-layout-header-extra")).toHaveTextContent(
    "Settings",
  );
});

test("a page-local Topbar inside AppLayout is not a global banner", () => {
  const { AppLayout, Topbar } = Mtone;
  render(
    <AppLayout navigation={<a href="/notes">Notes</a>}>
      <Topbar as="div" breadcrumb="Page heading" />
      <p>Body</p>
    </AppLayout>,
  );
  expect(screen.queryByRole("banner")).not.toBeInTheDocument();
  expect(
    within(screen.getByRole("main")).getByText("Page heading"),
  ).toBeInTheDocument();
});

test("renders optional center controls between the separate leading and trailing regions", () => {
  const { Topbar } = Mtone;
  render(
    <Topbar
      breadcrumb="Notes"
      center={<button>Preview</button>}
      extra={<button>Share</button>}
    />,
  );
  const bar = screen.getByRole("banner");
  expect(bar).toHaveClass("mt-topbar-with-center");
  expect(
    within(bar).getByRole("button", { name: "Preview" }).parentElement,
  ).toHaveClass("mt-topbar-center");
  expect(
    within(bar).getByRole("button", { name: "Share" }).parentElement,
  ).toHaveClass("mt-layout-header-extra");
});

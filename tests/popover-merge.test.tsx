import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import * as Mtone from "../packages/mtone/src";
import { componentDocs } from "../apps/docs/catalog";
import { DocsApp, parseRoute, searchDocs } from "../apps/docs/docs-app";

it("removes standalone Dropdown without changing the DropdownMenu alias", () => {
  expect(Mtone).not.toHaveProperty("Dropdown");
  expect(Mtone.DropdownMenu).toBe(Mtone.Menu);
  expect(parseRoute("#/components/Dropdown")).toEqual({ kind: "not-found" });
  expect(parseRoute("#/components/DropdownMenu")).toEqual({
    kind: "component",
    name: "Menu",
  });
  expect(componentDocs.some((doc) => doc.name === "Dropdown")).toBe(false);
  expect(searchDocs("Dropdown").some((doc) => doc.name === "Dropdown")).toBe(
    false,
  );
  window.location.hash = "#/components/Popover";
  render(<DocsApp />);
  const navigation = screen.getByRole("navigation", { name: "文档导航" });
  expect(
    within(navigation).queryByRole("link", { name: /^Dropdown$/ }),
  ).not.toBeInTheDocument();
});

it("uses a string trigger through the dropdown Button preset and a title to name the dialog", async () => {
  const user = userEvent.setup();
  render(
    <Mtone.Popover
      trigger="Details"
      content="Information"
      title="Project details"
    />,
  );
  const trigger = screen.getByRole("button", { name: "Details" });
  expect(trigger).toHaveClass("mt-btn");
  expect(trigger.querySelector("svg")).toBeInTheDocument();
  await user.click(trigger);
  expect(
    await screen.findByRole("dialog", { name: "Project details" }),
  ).toHaveTextContent("Information");
});

it("supports a caller-named unstyled surface around a Card without changing dialog semantics", async () => {
  render(
    <Mtone.Popover
      trigger={<button>Settings</button>}
      label="Settings dialog"
      title="Visible heading"
      width={245}
      align="center"
      unstyled
      defaultOpen
      content={
        <Mtone.Card>
          <Mtone.Input aria-label="Name" />
        </Mtone.Card>
      }
    />,
  );
  const dialog = await screen.findByRole("dialog", { name: "Settings dialog" });
  expect(dialog).toHaveTextContent("Visible heading");
  expect(dialog).toHaveStyle({ width: "245px" });
  expect(dialog.querySelector(".mt-card")).not.toBeNull();
  expect(within(dialog).getByRole("textbox", { name: "Name" })).toBeVisible();
});

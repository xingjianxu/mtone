import React, { createRef } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import {
  AdminLayout,
  GlobalNotice,
  MtoneProvider,
} from "../packages/mtone/src";

it("renders a standalone notice with a named region and localized close action", async () => {
  const user = userEvent.setup();
  const dismiss = vi.fn();
  const actionRef = createRef<HTMLButtonElement>();
  const rootRef = createRef<HTMLDivElement>();
  render(
    <MtoneProvider locale="en">
      <GlobalNotice
        ref={rootRef}
        actionRef={actionRef}
        title="Maintenance"
        onAction={dismiss}
      >
        Saving resumes at noon.
      </GlobalNotice>
    </MtoneProvider>,
  );
  const region = screen.getByRole("region", { name: "Maintenance" });
  expect(region).toBe(rootRef.current);
  expect(region).toHaveTextContent("Saving resumes at noon.");
  const close = within(region).getByRole("button", { name: "Dismiss notice" });
  expect(close).toBe(actionRef.current);
  await user.tab();
  expect(close).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(dismiss).toHaveBeenCalledOnce();
  expect(region).toBeVisible(); // Visibility belongs to the caller.
});

it("keeps a failed notice actionable and makes a pending action natively disabled", () => {
  const action = vi.fn();
  const { rerender } = render(
    <GlobalNotice
      title="Admin mode"
      icon={false}
      actionLabel="Exit admin mode"
      loading
      onAction={action}
    >
      Privileges are temporary.
    </GlobalNotice>,
  );
  const button = screen.getByRole("button", { name: "Exit admin mode" });
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute("aria-busy", "true");
  fireEvent.click(button);
  expect(action).not.toHaveBeenCalled();
  rerender(
    <GlobalNotice
      title="Admin mode"
      icon={false}
      actionLabel="Retry exit"
      error="Unable to exit. Try again."
      onAction={action}
    >
      Privileges are temporary.
    </GlobalNotice>,
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Unable to exit. Try again.",
  );
  expect(screen.getByRole("button", { name: "Retry exit" })).toBe(button);
  expect(button).toBeEnabled();
  fireEvent.click(button);
  expect(action).toHaveBeenCalledOnce();
  expect(
    screen
      .getByRole("region", { name: "Admin mode" })
      .querySelector("svg.lucide-shield-alert"),
  ).toBeNull();
});

it("keeps AdminLayout children mounted and restores its no-notice structure", () => {
  const layout = (notice: React.ReactNode) => (
    <AdminLayout data-testid="layout" notice={notice}>
      <AdminLayout.Sider aria-label="Workspace" />
      <AdminLayout>
        <AdminLayout.Header>Workspace header</AdminLayout.Header>
        <AdminLayout.Content>
          <input aria-label="Local draft" />
        </AdminLayout.Content>
      </AdminLayout>
    </AdminLayout>
  );
  const { rerender } = render(layout(undefined));
  const root = screen.getByTestId("layout");
  const sider = screen.getByRole("complementary", { name: "Workspace" });
  const input = screen.getByRole("textbox", { name: "Local draft" });
  fireEvent.change(input, { target: { value: "Draft remains" } });
  expect(root.firstElementChild).toBe(sider);

  rerender(layout(<GlobalNotice title="Admin mode" />));
  expect(root.firstElementChild).toContainElement(
    screen.getByRole("region", { name: "Admin mode" }),
  );
  expect(screen.getByRole("textbox", { name: "Local draft" })).toBe(input);
  rerender(layout(false));
  expect(root.firstElementChild).toBe(sider);
  expect(input).toHaveValue("Draft remains");
  expect(
    screen.queryByRole("region", { name: "Admin mode" }),
  ).not.toBeInTheDocument();
});

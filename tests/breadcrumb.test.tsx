import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { Breadcrumb } from "../packages/mtone/src/navigation";

it("renders decorative icons, accessible icon-only links and current page", () => {
  const { container } = render(
    <Breadcrumb
      items={[
        {
          label: null,
          icon: <svg data-testid="home-icon" />,
          "aria-label": "Home",
          href: "/",
        },
        { label: "Page", icon: <svg /> },
      ]}
    />,
  );
  expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  expect(screen.getByTestId("home-icon").parentElement).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  expect(container.querySelector('[aria-current="page"]')).toHaveTextContent(
    "Page",
  );
});
it("supports global and per-item separators including no separator", () => {
  const { container } = render(
    <Breadcrumb
      separator="/"
      items={[
        { label: "A", separator: ">" },
        { label: "B", separator: null },
        { label: "C" },
        { label: "D" },
      ]}
    />,
  );
  expect(
    Array.from(container.querySelectorAll(".mt-breadcrumb-separator")).map(
      (x) => x.textContent,
    ),
  ).toEqual([">", "/"]);
  expect(
    container.querySelectorAll('.mt-breadcrumb-separator[aria-hidden="true"]'),
  ).toHaveLength(2);
});
it("does not render dead links for noninteractive or disabled items", () => {
  render(
    <Breadcrumb
      items={[
        { label: "Plain" },
        { label: "Disabled", href: "/disabled", disabled: true },
        { label: "Page", href: "/page" },
      ]}
    />,
  );
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
  expect(screen.getByText("Disabled")).toHaveAttribute("aria-disabled", "true");
  expect(screen.getByText("Page")).toHaveAttribute("aria-current", "page");
});
it("keeps navigation separate from its menu and supports selection and Escape", async () => {
  const onSelect = vi.fn();
  render(
    <Breadcrumb
      items={[
        {
          label: "Projects",
          href: "/projects",
          menu: {
            items: [
              { key: "one", label: "One" },
              { key: "two", label: "Two", disabled: true },
            ],
            onSelect,
          },
        },
        { label: "Page" },
      ]}
    />,
  );
  expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
    "href",
    "/projects",
  );
  const trigger = screen.getByRole("button", { name: "Projects" });
  trigger.focus();
  await userEvent.keyboard("{ArrowDown}");
  expect(await screen.findByRole("menuitem", { name: "One" })).toHaveFocus();
  await userEvent.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
  );
  expect(trigger).toHaveFocus();
  await userEvent.click(trigger);
  await userEvent.click(await screen.findByRole("menuitem", { name: "One" }));
  expect(onSelect).toHaveBeenCalledExactlyOnceWith("one");
});
it("uses one rich label and names a separate current-page menu without duplicate markup", async () => {
  const { container } = render(
    <Breadcrumb
      items={[
        {
          label: <strong id="unique-label">Current</strong>,
          menu: { items: [{ key: "x", label: "Other" }] },
        },
      ]}
    />,
  );
  expect(container.querySelectorAll("#unique-label")).toHaveLength(1);
  expect(container.querySelector('[aria-current="page"]')).toHaveTextContent(
    "Current",
  );
  await userEvent.click(screen.getByRole("button", { name: "Current" }));
  expect(await screen.findByRole("menuitem", { name: "Other" })).toBeVisible();
});
it("renders menu-only triggers and omits empty or disabled menus", async () => {
  render(
    <Breadcrumb
      items={[
        { label: "Menu", menu: { items: [{ key: "x", label: "Other" }] } },
        {
          label: "Disabled",
          disabled: true,
          menu: { items: [{ key: "x", label: "Other" }] },
        },
        { label: "Empty", menu: { items: [] } },
        { label: "Current" },
      ]}
    />,
  );
  expect(screen.getAllByRole("button")).toHaveLength(1);
  await userEvent.click(screen.getByRole("button", { name: "Menu" }));
  expect(await screen.findByRole("menuitem", { name: "Other" })).toBeVisible();
});

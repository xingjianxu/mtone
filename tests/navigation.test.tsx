import { render, screen, fireEvent } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import {
  Breadcrumb,
  NavItem,
  FilterChip,
} from "../packages/mtone/src/navigation";
it("marks current breadcrumb", () => {
  render(
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Notes" }]} />,
  );
  expect(screen.getByText("Notes")).toHaveAttribute("aria-current", "page");
});
it("marks selected navigation", () => {
  render(<NavItem active>Inbox</NavItem>);
  expect(screen.getByText("Inbox")).toHaveAttribute("aria-current", "page");
});
it("removes filters", () => {
  const f = vi.fn();
  render(<FilterChip onRemove={f}>Work</FilterChip>);
  fireEvent.click(screen.getByRole("button"));
  expect(f).toHaveBeenCalledOnce();
});

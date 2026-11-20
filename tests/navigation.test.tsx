import userEvent from "@testing-library/user-event";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import {
  Breadcrumb,
  Sidebar,
  NavGroup,
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
  expect(screen.getByRole("button", { name: "Inbox" })).toHaveAttribute("aria-current", "page");
});
it("removes filters", () => {
  const f = vi.fn();
  render(<FilterChip onRemove={f}>Work</FilterChip>);
  fireEvent.click(screen.getByRole("button"));
  expect(f).toHaveBeenCalledOnce();
});

it('toggles an opt-in sidebar and retains accessible navigation labels', () => {
  const onChange = vi.fn();
  render(<Sidebar collapsible onCollapsedChange={onChange}><NavGroup label="Workspace"><NavItem icon={<span aria-hidden="true">★</span>} active>Inbox</NavItem></NavGroup></Sidebar>);
  const toggle = screen.getByRole('button', { name: '收起侧边栏' });
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(toggle);
  expect(screen.getByRole('complementary')).toHaveAttribute('data-collapsed', 'true');
  expect(screen.getByRole('button', { name: 'Inbox' })).toHaveAttribute('aria-current', 'page');
  expect(onChange).toHaveBeenLastCalledWith(true);
  fireEvent.click(screen.getByRole('button', { name: '展开侧边栏' }));
  expect(onChange).toHaveBeenLastCalledWith(false);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
});
it('respects controlled collapse and supports defaultCollapsed', () => {
  const onChange = vi.fn();
  const { rerender } = render(<Sidebar collapsible collapsed onCollapsedChange={onChange}><NavItem>Inbox</NavItem></Sidebar>);
  fireEvent.click(screen.getByRole('button', { name: '展开侧边栏' }));
  expect(onChange).toHaveBeenCalledWith(false);
  expect(screen.getByRole('complementary')).toHaveAttribute('data-collapsed', 'true');
  rerender(<Sidebar collapsible collapsed={false}><NavItem>Inbox</NavItem></Sidebar>);
  expect(screen.getByRole('complementary')).toHaveAttribute('data-collapsed', 'false');
});
it('leaves legacy sidebars expanded without a toggle', () => {
  render(<Sidebar><NavItem>Inbox</NavItem></Sidebar>);
  expect(screen.getAllByRole('button')).toHaveLength(1);
});
it('starts collapsed when requested and uses aria-label for complex children', () => {
  render(<Sidebar collapsible defaultCollapsed><NavItem aria-label="Inbox"><strong>Messages</strong></NavItem></Sidebar>);
  expect(screen.getByRole('button', {name:'展开侧边栏'})).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByRole('button', {name:'Inbox'})).toHaveAttribute('aria-describedby');
});
it('shows keyboard hints and dismisses them with Escape', async () => {
  render(<Sidebar collapsible defaultCollapsed><NavItem>Inbox</NavItem></Sidebar>);
  await userEvent.tab();
  await userEvent.tab();
  expect(await screen.findByRole('tooltip')).toHaveTextContent('Inbox');
  expect(screen.getByRole('button', { name: 'Inbox' })).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
});
it('retains item focus when controlled collapsed state changes', () => {
  const { rerender } = render(<Sidebar collapsible collapsed={false}><NavItem>Inbox</NavItem></Sidebar>);
  const item = screen.getByRole('button', {name:'Inbox'});
  item.focus();
  rerender(<Sidebar collapsible collapsed><NavItem>Inbox</NavItem></Sidebar>);
  expect(screen.getByRole('button', {name:'Inbox'})).toHaveFocus();
});

it('keeps grouped items as adjacent siblings in nested and collapsed navigation', () => {
  const { container, rerender } = render(
    <Sidebar collapsible collapsed={false}>
      <NavGroup label="Workspace">
        <NavItem>Inbox</NavItem><NavItem>Archive</NavItem>
        <NavGroup label="Projects"><NavItem>Alpha</NavItem><NavItem>Beta</NavItem></NavGroup>
      </NavGroup>
    </Sidebar>,
  );
  expect(container.querySelectorAll('.mt-nav-group > .mt-nav-item + .mt-nav-item')).toHaveLength(2);
  rerender(<Sidebar collapsible collapsed><NavGroup label="Workspace"><NavItem>Inbox</NavItem><NavItem>Archive</NavItem></NavGroup></Sidebar>);
  expect(container.querySelectorAll('.mt-nav-group > .mt-nav-item + .mt-nav-item')).toHaveLength(1);
  expect(screen.getByRole('button', { name: 'Archive' })).toBeInTheDocument();
});

it.each([false, true])('spaces plain Sidebar siblings with collapsible=%s', (collapsible) => {
  const { container } = render(<Sidebar collapsible={collapsible}><NavItem>First</NavItem><NavItem>Second</NavItem><NavGroup label="Group"><NavItem>Nested</NavItem></NavGroup></Sidebar>);
  const selector = '.mt-sidebar > .mt-nav-item + .mt-nav-item, .mt-sidebar-content > .mt-nav-item + .mt-nav-item';
  expect(container.querySelectorAll(selector)).toHaveLength(1);
  expect(screen.getByRole('button', { name: 'Second' }).matches(selector)).toBe(true);
});

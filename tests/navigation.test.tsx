import React from "react";
import userEvent from "@testing-library/user-event";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import {
  Breadcrumb,
  Sidebar,
  NavGroup,
  NavItem,
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

it("opts out of only a NavGroup's preceding divider without adding separator nodes", () => {
  const { container } = render(
    <nav>
      <NavGroup label="Workspace"><NavItem>Inbox</NavItem></NavGroup>
      <NavGroup divider={false} label="Projects"><NavItem>Alpha</NavItem></NavGroup>
      <NavGroup divider label="People"><NavItem>Billing</NavItem></NavGroup>
      <NavItem>Independent link</NavItem>
      <NavGroup label="Archive"><NavItem>Records</NavItem></NavGroup>
    </nav>,
  );
  const groups = container.querySelectorAll("nav > .mt-nav-group");
  const boundaries = container.querySelectorAll(".mt-nav-group + .mt-nav-group:not([data-no-divider])");
  expect(groups[1]).toHaveAttribute("data-no-divider");
  expect(Array.from(boundaries)).toEqual([groups[2]]);
  expect(screen.queryByRole("separator")).not.toBeInTheDocument();
});

it("keeps heading actions independent, keyboard reachable and hidden in the collapsed sidebar", async () => {
  const create = vi.fn();
  const select = vi.fn();
  const user = userEvent.setup();
  const content = (collapsed: boolean) => (
    <Sidebar collapsible collapsed={collapsed}>
      <NavGroup label="Workspace" actions={<>
        <button type="button" onClick={create} aria-label="Create project">+</button>
        <button type="button" aria-label="More workspace actions">…</button>
      </>}>
        <NavItem onClick={select}>Inbox</NavItem>
      </NavGroup>
      <NavGroup actions={<button type="button">Import</button>}>
        <NavItem>Records</NavItem>
      </NavGroup>
    </Sidebar>
  );
  const { rerender } = render(content(false));
  const action = screen.getByRole("button", { name: "Create project" });
  expect(action.closest(".mt-nav-item")).toBeNull();
  expect(action.closest(".mt-nav-group-header")).toContainElement(screen.getByText("Workspace"));
  action.focus();
  await user.keyboard("{Enter}{Tab}");
  expect(create).toHaveBeenCalledOnce();
  expect(select).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "More workspace actions" })).toHaveFocus();
  expect(screen.getByRole("button", { name: "Import" })).toBeVisible();
  rerender(content(true));
  expect(screen.queryByRole("button", { name: "Create project" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Import" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Inbox" })).toBeInTheDocument();
  rerender(content(false));
  expect(screen.getByRole("button", { name: "Create project" })).toBeVisible();
});

it.each([false, true])('spaces plain Sidebar siblings with collapsible=%s', (collapsible) => {
  const { container } = render(<Sidebar collapsible={collapsible}><NavItem>First</NavItem><NavItem>Second</NavItem><NavGroup label="Group"><NavItem>Nested</NavItem></NavGroup></Sidebar>);
  const selector = '.mt-sidebar > .mt-nav-item + .mt-nav-item, .mt-sidebar-content > .mt-nav-item + .mt-nav-item';
  expect(container.querySelectorAll(selector)).toHaveLength(1);
  expect(screen.getByRole('button', { name: 'Second' }).matches(selector)).toBe(true);
});

it("uses native anchor semantics and an anchor ref when href is provided", async () => {
  const anchor = React.createRef<HTMLAnchorElement>();
  const button = React.createRef<HTMLButtonElement>();
  const handle = vi.fn();
  render(<NavGroup>
    <NavItem ref={anchor} href="/guide" target="_blank" rel="noopener noreferrer" active onClick={(event) => { event.preventDefault(); handle(event.currentTarget); }}>Guide</NavItem>
    <NavItem ref={button}>Action</NavItem>
    <NavItem href="/blocked" disabled onClick={handle}>Blocked</NavItem>
  </NavGroup>);
  const link = screen.getByRole("link", { name: "Guide" });
  expect(anchor.current).toBe(link);
  expect(link).toHaveAttribute("href", "/guide");
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
  expect(link).toHaveAttribute("aria-current", "page");
  link.focus();
  await userEvent.keyboard("{Enter}");
  expect(handle).toHaveBeenCalledWith(link);
  expect(button.current).toBe(screen.getByRole("button", { name: "Action" }));
  const blocked = screen.getByRole("link", { name: "Blocked" });
  expect(blocked).not.toHaveAttribute("href");
  expect(blocked).toHaveAttribute("aria-disabled", "true");
  expect(blocked).toHaveAttribute("tabindex", "-1");
  fireEvent.click(blocked);
  expect(handle).toHaveBeenCalledTimes(1);
});

it("keeps a collapsed native link named and shows its tooltip on keyboard focus", async () => {
  render(<Sidebar collapsible defaultCollapsed><NavItem href="#billing">Billing details</NavItem></Sidebar>);
  const link = screen.getByRole("link", { name: "Billing details" });
  expect(link).toHaveClass("mt-nav-item-collapsed");
  link.focus();
  const tooltip = await screen.findByRole("tooltip");
  expect(tooltip).toHaveTextContent("Billing details");
  expect(link).toHaveFocus();
});

it("keeps trailing actions separate from NavItem link and button activation", () => {
  const navigate = vi.fn((event: React.MouseEvent) => event.preventDefault());
  const edit = vi.fn();
  const archive = vi.fn();
  const linkRef = React.createRef<HTMLAnchorElement>();
  const buttonRef = React.createRef<HTMLButtonElement>();
  render(<>
    <NavItem active href="/notes" ref={linkRef} onClick={navigate} actions={[
      { content: <button onClick={edit}>Edit</button> },
      { content: <button onClick={archive}>Archive</button>, visibility: "active" },
    ]}>Notes</NavItem>
    <NavItem ref={buttonRef} onClick={navigate} actions={{ content: <button>Options</button>, visibility: "hover" }}>Drafts</NavItem>
  </>);
  const link = screen.getByRole("link", { name: "Notes" });
  const button = screen.getByRole("button", { name: "Drafts" });
  const editAction = screen.getByRole("button", { name: "Edit" });
  expect(linkRef.current).toBe(link);
  expect(buttonRef.current).toBe(button);
  expect(link).toHaveAttribute("href", "/notes");
  expect(link).toHaveAttribute("aria-current", "page");
  expect(editAction).not.toHaveAttribute("aria-current");
  expect(link).not.toContainElement(editAction);
  expect(button).not.toContainElement(screen.getByText("Options"));
  fireEvent.click(editAction);
  fireEvent.click(screen.getByRole("button", { name: "Archive" }));
  expect(edit).toHaveBeenCalledOnce();
  expect(archive).toHaveBeenCalledOnce();
  expect(navigate).not.toHaveBeenCalled();
  fireEvent.click(link);
  fireEvent.click(button);
  expect(navigate).toHaveBeenCalledTimes(2);
});

const sidebarTabs = [
  { value: "workspace", label: "Workspace", content: <NavGroup label="Work"><NavItem active>Home</NavItem></NavGroup> },
  { value: "projects", label: "Projects", content: <NavGroup label="Projects nav"><NavItem>Active projects</NavItem></NavGroup> },
  { value: "favorites", label: "Favorites", content: <NavItem>Starred</NavItem> },
];

it("uses small local tabs to switch the Sidebar nav panel without opening another route", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(<Sidebar header="Team identity" footer="v1.0" tabs={{
    label: "Sidebar categories", items: sidebarTabs, defaultValue: "projects", onValueChange: change,
  }}>
    <NavItem>Untabbed fallback</NavItem>
  </Sidebar>);
  const list = screen.getByRole("tablist", { name: "Sidebar categories" });
  expect(list.closest(".mt-tabs")).toHaveAttribute("data-size", "small");
  const projectEntry = screen.getByRole("button", { name: "Active projects" });
  expect(screen.getByRole("tabpanel", { name: "Projects" })).toContainElement(projectEntry);
  expect(screen.getByText("Team identity")).toBeVisible();
  expect(screen.getByText("v1.0")).toBeVisible();
  expect(screen.queryByText("Untabbed fallback")).not.toBeInTheDocument();
  const projects = screen.getByRole("tab", { name: "Projects" });
  const favorites = screen.getByRole("tab", { name: "Favorites" });
  projects.focus();
  await user.keyboard("{ArrowRight}");
  expect(favorites).toHaveFocus();
  expect(projects).toHaveAttribute("aria-selected", "true");
  await user.keyboard("{Enter}");
  expect(favorites).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("tabpanel", { name: "Favorites" })).toContainElement(screen.getByRole("button", { name: "Starred" }));
  expect(screen.queryByRole("button", { name: "Active projects" })).not.toBeInTheDocument();
  expect(change).toHaveBeenCalledExactlyOnceWith("favorites");
  await user.click(projects);
  expect(screen.getByRole("button", { name: "Active projects" })).toBe(projectEntry);
});

it("honors the controlled tab value and retains its content when the sidebar collapses", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const example = (value: string) => <Sidebar collapsible tabs={{ items: sidebarTabs, value, onValueChange: change }} />;
  const { rerender } = render(example("workspace"));
  await user.click(screen.getByRole("tab", { name: "Projects" }));
  expect(change).toHaveBeenCalledExactlyOnceWith("projects");
  expect(screen.getByRole("tab", { name: "Workspace" })).toHaveAttribute("aria-selected", "true");
  rerender(example("projects"));
  await user.click(screen.getByRole("button", { name: "收起侧边栏" }));
  expect(screen.getByRole("complementary")).toHaveAttribute("data-collapsed", "true");
  expect(screen.getByRole("button", { name: "Active projects" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Active projects" })).toHaveClass("mt-nav-item-collapsed");
  await user.click(screen.getByRole("button", { name: "展开侧边栏" }));
  expect(screen.getByRole("tab", { name: "Projects" })).toHaveAttribute("aria-selected", "true");
});

it("keeps the direct legacy Sidebar children when tabs are omitted or empty", () => {
  const { rerender } = render(<Sidebar><NavItem>Inbox</NavItem></Sidebar>);
  const navigation = screen.getByRole("button", { name: "Inbox" });
  expect(navigation.parentElement).toBe(screen.getByRole("complementary"));
  rerender(<Sidebar tabs={{ items: [] }}><NavItem>Inbox</NavItem></Sidebar>);
  expect(screen.getByRole("button", { name: "Inbox" }).parentElement).toBe(screen.getByRole("complementary"));
  expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
});

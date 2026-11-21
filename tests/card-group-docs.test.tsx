import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { CardExample } from "../apps/docs/card-example";
import { CardGroupExample } from "../apps/docs/card-group-example";
import { componentDocs } from "../apps/docs/catalog";

test("Card example demonstrates collapse without losing edited content", () => {
  render(<CardExample />);
  const input = screen.getByRole('textbox', {name:'卡片笔记'});
  fireEvent.change(input, {target:{value:'保留笔记'}});
  fireEvent.click(screen.getByRole('button', {name:'外部收起'}));
  expect(input).not.toBeVisible();
  fireEvent.click(screen.getByRole('button', {name:'外部展开'}));
  expect(input).toBeVisible();
  expect(input).toHaveValue('保留笔记');
});

test("CardGroup demo includes real mobile two-column and divided layouts", () => {
  render(<CardGroupExample />);
  const mobile = screen.getByRole('region', {name:'移动端两列与跨列'});
  expect(mobile.querySelector('.mt-card-group')).toHaveStyle({'--mt-card-group-columns-xs':'2','--mt-card-group-columns-md':'3'});
  expect(mobile.querySelector('.mt-card-group-item')).toHaveStyle({'--mt-card-group-span-xs':'2','--mt-card-group-span-md':'3'});
  const divided = screen.getByRole('region', {name:'带分隔线卡片组'});
  expect(divided.querySelector('.mt-card-group')).toHaveClass('mt-card-group-divided');
  expect(within(divided).getByText('资料')).toBeInTheDocument();
  const vertical = screen.getByRole('region', {name:'纵向卡片组'});
  expect(vertical.querySelector('.mt-card-group')).toHaveStyle({'--mt-card-group-columns-lg':'1'});
});

test("CardGroup belongs to layout and documents differences from Card.Grid", () => {
  const group = componentDocs.find(x=>x.name==='CardGroup')!;
  expect(group.category).toBe('数据展示');
  expect(group.props.map(x=>x.name)).toEqual(expect.arrayContaining(['columns','gap','divided','direction','CardGroup.Item.span']));
  expect(group.notes.join(' ')).toContain('Card.Grid');
  const card = componentDocs.find(x=>x.name==='Card')!;
  expect(card.props.map(x=>x.name)).toEqual(expect.arrayContaining(['collapsible','collapsed','defaultCollapsed','onCollapsedChange','collapseLabel']));
});

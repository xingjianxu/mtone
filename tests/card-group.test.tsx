import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import * as M from "../packages/mtone/src";
const Group = M.CardGroup;
describe("CardGroup", () => {
  it("preserves distinct keys across sibling fragments", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      render(
        <Group>
          <React.Fragment key="a">
            <Group.Item key="same">A</Group.Item>
          </React.Fragment>
          <React.Fragment key="b">
            <Group.Item key="same">B</Group.Item>
          </React.Fragment>
        </Group>,
      );
      expect(error).not.toHaveBeenCalled();
    } finally {
      error.mockRestore();
    }
  });
  it("exports an independent group and Item without replacing Card.Grid", () => {
    expect(Group).toBeTypeOf("function");
    expect(Group.Item).toBeTypeOf("function");
    expect(M.Card.Grid).toBeTypeOf("function");
  });
  it("wraps ordinary children and applies responsive layout defaults", () => {
    const { container } = render(
      <Group aria-label="Cards">
        <M.Card>First</M.Card>
        <M.Card>Second</M.Card>
      </Group>,
    );
    const group = screen.getByLabelText("Cards");
    expect(group).toHaveClass("mt-card-group");
    expect(group.children).toHaveLength(2);
    expect(group).toHaveStyle({
      "--mt-card-group-columns-xs": "1",
      "--mt-card-group-columns-sm": "2",
      "--mt-card-group-columns-lg": "3",
    });
    expect(container.querySelector(".mt-card-grid")).toBeNull();
  });
  it("clamps spans per breakpoint and uses actual row boundaries for separators", () => {
    render(
      <Group columns={{ xs: 1, md: 3 }} divided>
        <Group.Item span={2} data-testid="a">
          <M.Card>A</M.Card>
        </Group.Item>
        <Group.Item data-testid="b">
          <M.Card>B</M.Card>
        </Group.Item>
        <Group.Item span={2} data-testid="c">
          <M.Card>C</M.Card>
        </Group.Item>
      </Group>,
    );
    expect(screen.getByTestId("a")).toHaveStyle({
      "--mt-card-group-span-xs": "1",
      "--mt-card-group-span-md": "2",
      "--mt-card-group-inline-md": "0",
      "--mt-card-group-block-md": "0",
    });
    expect(screen.getByTestId("b")).toHaveStyle({
      "--mt-card-group-inline-md": "1",
      "--mt-card-group-block-md": "0",
      "--mt-card-group-block-xs": "1",
    });
    expect(screen.getByTestId("c")).toHaveStyle({
      "--mt-card-group-inline-md": "0",
      "--mt-card-group-block-md": "1",
    });
  });
  it("preserves Item props and fragment children, ignoring hidden items for layout", () => {
    render(
      <Group columns={2}>
        <>
          <Group.Item hidden data-testid="hidden">
            H
          </Group.Item>
          <Group.Item
            className="custom"
            style={{ color: "red" }}
            data-testid="first"
          >
            A
          </Group.Item>
          <Group.Item data-testid="second">B</Group.Item>
        </>
      </Group>,
    );
    expect(screen.getByTestId("hidden")).not.toBeVisible();
    expect(screen.getByTestId("first")).toHaveClass("custom");
    expect(screen.getByTestId("first")).toHaveStyle({
      color: "rgb(255, 0, 0)",
      "--mt-card-group-inline-xs": "0",
    });
    expect(screen.getByTestId("second")).toHaveStyle({
      "--mt-card-group-inline-xs": "1",
    });
  });
  it("normalizes invalid numeric layout values and allows zero gap", () => {
    render(
      <Group columns={{ xs: NaN, md: 2.9 }} gap={{ xs: 0, md: -4 }}>
        <Group.Item span={Infinity} data-testid="safe">
          A
        </Group.Item>
      </Group>,
    );
    expect(screen.getByTestId("safe")).toHaveStyle({
      "--mt-card-group-span-xs": "1",
      "--mt-card-group-span-md": "1",
    });
    expect(screen.getByTestId("safe").parentElement).toHaveStyle({
      "--mt-card-group-columns-xs": "1",
      "--mt-card-group-columns-md": "2",
      "--mt-card-group-gap-xs": "0px",
      "--mt-card-group-gap-md": "0px",
    });
  });
  it("vertical direction always uses one column and block separators", () => {
    render(
      <Group direction="vertical" columns={3} divided>
        <Group.Item span={2} data-testid="v1">
          A
        </Group.Item>
        <Group.Item data-testid="v2">B</Group.Item>
      </Group>,
    );
    expect(screen.getByTestId("v1")).toHaveStyle({
      "--mt-card-group-span-xs": "1",
    });
    expect(screen.getByTestId("v2")).toHaveStyle({
      "--mt-card-group-inline-xs": "0",
      "--mt-card-group-block-xs": "1",
    });
  });
});

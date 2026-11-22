import * as React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import * as M from "../packages/mtone/src";
import { readFileSync } from "node:fs";

afterEach(cleanup);

test("renders independently named sections with actionable headers and arbitrary content", () => {
  const Group = M.SectionGroup;
  expect(Group).toBeDefined();
  const clicked = vi.fn();
  render(
    <Group>
      <Group.Section
        title="发布"
        headingLevel={2}
        actions={<M.Button onClick={clicked}>新增发布</M.Button>}
      >
        <a href="/releases">查看发布</a>
      </Group.Section>
      <Group.Section title="部署">
        <p>站点已上线</p>
      </Group.Section>
    </Group>,
  );

  const releases = screen.getByRole("region", { name: "发布" });
  expect(
    within(releases).getByRole("heading", { name: "发布", level: 2 }),
  ).toBeVisible();
  expect(
    within(releases).getByRole("link", { name: "查看发布" }),
  ).toHaveAttribute("href", "/releases");
  const deploys = screen.getByRole("region", { name: "部署" });
  expect(
    within(deploys).getByRole("heading", { name: "部署", level: 3 }),
  ).toBeVisible();
  expect(within(deploys).getByText("站点已上线")).toBeVisible();
  fireEvent.click(within(releases).getByRole("button", { name: "新增发布" }));
  expect(clicked).toHaveBeenCalledOnce();
});

test("applies one divider to each subsequent visible section by default", () => {
  const Group = M.SectionGroup;
  expect(Group).toBeDefined();
  const css = readFileSync("packages/mtone/src/styles.css", "utf8");
  const rule = css
    .match(
      /([^{}]+)\{\s*border-block-start:\s*1px solid var\(--mt-border[^{}]*?\}/g,
    )
    ?.find((block) => block.includes(".mt-section-group"));
  expect(rule).toBeDefined();
  const selector = rule!.split("{")[0].trim();
  const { container } = render(
    <Group>
      <Group.Section title="隐藏首项" hidden>
        不显示
      </Group.Section>
      <Group.Section title="发布">正文</Group.Section>
      <Group.Section title="隐藏中间项" hidden>
        不显示
      </Group.Section>
      <Group.Section title="部署">正文</Group.Section>
      <Group.Section title="软件包">正文</Group.Section>
    </Group>,
  );
  expect(
    Array.from(
      container.querySelectorAll(selector),
      (node) => node.querySelector("h3")?.textContent,
    ),
  ).toEqual(["部署", "软件包"]);
});

test("can turn off group dividers without changing section semantics", () => {
  const Group = M.SectionGroup;
  expect(Group).toBeDefined();
  render(
    <Group dividers={false} data-testid="group">
      <Group.Section title="部署">正文</Group.Section>
    </Group>,
  );
  expect(screen.getByTestId("group")).toHaveAttribute("data-no-dividers");
  expect(screen.getByRole("region", { name: "部署" })).toBeVisible();
});

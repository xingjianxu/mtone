import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import Demo from "../apps/docs/inline-demos/app-layout-usage";
import { MtoneProvider } from "../packages/mtone/src";

beforeEach(() => {
  if (!window.PointerEvent) vi.stubGlobal("PointerEvent", window.MouseEvent);
});
afterEach(() => vi.unstubAllGlobals());

test("AppLayout demo applies interactive controls to the preview without losing the selected page", async () => {
  const user = userEvent.setup();
  const { container } = render(
    <MtoneProvider locale="zh">
      <Demo />
    </MtoneProvider>,
  );
  const preview = () =>
    container.querySelector<HTMLDivElement>(".mt-app-layout")!;
  const toggle = (name: string) =>
    user.click(screen.getByRole("switch", { name }));

  expect(screen.getByRole("separator")).toBeInTheDocument();
  expect(screen.getByRole("separator")).toHaveClass(
    "mt-splitter-separator-bordered",
  );
  fireEvent.change(screen.getByRole("slider", { name: "侧栏初始宽度" }), {
    target: { value: "280" },
  });
  expect(
    preview().style.getPropertyValue("--mt-app-layout-sidebar-width"),
  ).toBe("280px");
  fireEvent.click(screen.getByRole("button", { name: "成员" }));
  await toggle("拖动调宽");
  expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  expect(screen.getByRole("switch", { name: "分隔条边框" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  expect(screen.getByRole("heading", { name: "成员" })).toBeInTheDocument();

  await toggle("拖动调宽");
  await toggle("分隔条边框");
  expect(screen.getByRole("separator")).not.toHaveClass(
    "mt-splitter-separator-bordered",
  );
  await toggle("允许折叠");
  expect(
    screen.queryByRole("button", { name: "收起侧边栏" }),
  ).not.toBeInTheDocument();
  await toggle("显示品牌");
  expect(screen.queryByText("mtone")).not.toBeInTheDocument();
  await toggle("显示账户");
  expect(
    screen.queryByRole("button", { name: "工作区成员" }),
  ).not.toBeInTheDocument();
  await toggle("自定义底部");
  expect(screen.getByText("工作区在线")).toBeInTheDocument();
  await toggle("占满视口高度");
  expect(preview()).toHaveClass("mt-app-layout-full-height");

  fireEvent.click(screen.getByRole("button", { name: "恢复示例配置" }));
  expect(preview()).not.toHaveClass("mt-app-layout-full-height");
  expect(
    preview().style.getPropertyValue("--mt-app-layout-sidebar-width"),
  ).toBe("240px");
  expect(
    screen.getByRole("button", { name: "工作区成员" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "成员" })).toBeInTheDocument();
});

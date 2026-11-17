import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { componentDocs } from "../apps/docs/catalog";
import { ComponentExample } from "../apps/docs/examples";

test("documents Calendar as a date-display component with ISO string values", () => {
  const doc = componentDocs.find((doc) => doc.name === "Calendar");
  expect(doc?.category).toBe("数据展示");
  expect(doc?.importNames).toContain("Calendar");
  expect(doc?.notes.join(" ")).toContain("YYYY-MM-DD");
  expect(doc?.props.map((prop) => prop.name).join(" ")).toContain(
    "fullCellRender",
  );
});
test("provides date content, restricted card and custom header Calendar examples", () => {
  render(<ComponentExample name="Calendar" />);
  expect(screen.getByText("月历与日程内容")).toBeInTheDocument();
  expect(screen.getByText("范围限制与卡片模式")).toBeInTheDocument();
  expect(screen.getByText("自定义头部与完整单元格")).toBeInTheDocument();
  expect(screen.getByTestId("calendar-value")).toHaveTextContent("2026-11-16");
  const calendar = screen.getByLabelText("项目日历");
  fireEvent.click(within(calendar).getByRole("button", { name: "2026-11-17" }));
  expect(screen.getByTestId("calendar-value")).toHaveTextContent("2026-11-17");
  const restricted = screen.getByLabelText("可预约日期");
  expect(
    within(restricted).getByRole("button", { name: "2026-11-14" }),
  ).toBeDisabled();
});

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, test } from "vitest";
import { componentDocs } from "../apps/docs/catalog";
import { ComponentExample } from "../apps/docs/examples";
import { parseRoute } from "../apps/docs/docs-app";
test("documents Mentions as one data-input component with alias and plain-text limitations", () => {
  const doc = componentDocs.find((doc) => doc.name === "Mentions");
  expect(doc?.category).toBe("表单输入");
  expect(doc?.importNames).toEqual(
    expect.arrayContaining(["Mentions", "Mention", "getMentions"]),
  );
  expect(doc?.notes.join(" ")).toContain("纯文本");
  expect(parseRoute("#/components/Mention")).toEqual({
    kind: "component",
    name: "Mentions",
  });
});
test("provides basic, asynchronous and form examples with real string values", async () => {
  render(<ComponentExample name="Mentions" />);
  const input = screen.getByRole("combobox", { name: "评论" });
  fireEvent.change(input, { target: { value: "Hello @alice" } });
  expect(screen.getByTestId("mentions-value")).toHaveTextContent(
    "Hello @alice",
  );
  expect(
    screen.getByRole("combobox", { name: "异步搜索" }),
  ).toBeInTheDocument();
  const formInput = screen.getByRole("combobox", { name: /协作说明/ });
  fireEvent.change(formInput, { target: { value: "请 @alice 审阅" } });
  fireEvent.click(screen.getByRole("button", { name: "提交提及示例" }));
  await waitFor(() =>
    expect(screen.getByTestId("mentions-form-result")).toHaveTextContent(
      "请 @alice 审阅",
    ),
  );
});

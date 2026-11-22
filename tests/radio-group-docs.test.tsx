import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { docSections } from "../apps/docs/docs-app";

it("documents a visually icon-only segmented RadioGroup with names and native keyboard selection", async () => {
  const section = docSections.RadioGroup.find(({ id }) => id === "icon-only");
  expect(section?.title).toBe("纯图标分段单选");
  expect(section?.note).toContain("方向键");
  expect(section?.source).toContain("lucide-react");
  const Demo = section!.Demo!;
  const user = userEvent.setup();
  render(<Demo />);

  const group = within(screen.getByRole("radiogroup", { name: "显示布局" }));
  const radios = ["列表", "卡片", "表格"].map((name) =>
    group.getByRole("radio", { name }),
  );
  for (const option of radios) {
    expect(option.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    expect(option.querySelector("span")).toHaveStyle({ clipPath: "inset(50%)" });
  }

  await user.tab();
  expect(radios[0]).toHaveFocus();
  expect(radios[0]).toBeChecked();
  await user.keyboard("{ArrowRight}");
  expect(radios[1]).toHaveFocus();
  expect(radios[1]).toBeChecked();
  expect(screen.getByRole("status")).toHaveTextContent("卡片");
});

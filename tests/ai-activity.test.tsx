import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MtoneProvider } from "../packages/mtone/src/basic";
import {
  AiCheckpoint,
  AiConfirmation,
  AiPlan,
  AiQueue,
  AiReasoning,
  AiSubagent,
  AiTask,
  AiTool,
} from "../packages/mtone/src/ai-activity";

const steps = [
  { id: "one", title: "Inspect sources", status: "completed" as const },
  { id: "two", title: "Compare results", status: "running" as const },
];
describe("AI activity", () => {
  it("toggles observable steps with keyboard and correctly connects the disclosure", async () => {
    const user = userEvent.setup();
    render(<AiTask title="Activity" steps={steps} />);
    const button = screen.getByRole("button", { name: "Activity" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Inspect sources")).not.toBeInTheDocument();
    button.focus();
    await user.keyboard("{Enter}");
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(
      document.getElementById(button.getAttribute("aria-controls")!),
    ).toHaveTextContent("Inspect sources");
    await user.keyboard(" ");
    expect(screen.queryByText("Inspect sources")).not.toBeInTheDocument();
  });
  it("keeps controlled disclosure state until the caller changes it", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <AiTask
        title="Task"
        open={false}
        onOpenChange={onOpenChange}
        steps={steps}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Task" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText("Compare results")).not.toBeInTheDocument();
    rerender(<AiTask title="Task" open steps={steps} />);
    expect(screen.getByText("Compare results")).toBeVisible();
  });
  it("only displays public caller text and escapes tool input/output", () => {
    render(
      <>
        <AiReasoning defaultOpen text="Public summary" />
        <AiTool
          name="lookup"
          defaultOpen
          input={"<img src=x onerror=alert(1)>"}
          output="Fetched 3 records"
        />
      </>,
    );
    expect(screen.getByText("Public summary")).toBeVisible();
    expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeVisible();
    expect(document.querySelector("img")).toBeNull();
    expect(screen.getByText("Fetched 3 records")).toBeVisible();
  });
  it("calculates progress and keeps unfinished queue entries separate from terminal entries", () => {
    render(
      <>
        <AiPlan items={steps} />
        <AiQueue
          items={[
            { id: "a", title: "Queued item" },
            { id: "b", title: "Finished item", status: "completed" },
            { id: "c", title: "Cancelled item", status: "cancelled" },
          ]}
        />
      </>,
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "1");
    expect(screen.getByRole("progressbar")).toHaveAttribute("max", "2");
    expect(screen.getByRole("list", { name: "待完成" })).toHaveTextContent(
      "Queued item",
    );
    expect(screen.getByRole("list", { name: "已结束" })).toHaveTextContent(
      "Cancelled item",
    );
  });
  it("renders empty lists and subagent results without fabricating progress", () => {
    render(
      <>
        <AiPlan items={[]} />
        <AiQueue items={[]} />
        <AiSubagent
          name="Reviewer"
          status="completed"
          defaultOpen
          description="Checks citations"
          result="No issues"
        />
      </>,
    );
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.getAllByText("暂无事项")).toHaveLength(2);
    expect(screen.getByText("No issues")).toBeVisible();
  });
  it("only invokes confirmation callbacks on explicit clicks and leaves decisions controlled", () => {
    const onConfirm = vi.fn(),
      onReject = vi.fn();
    const { rerender } = render(
      <AiConfirmation
        title="Apply change?"
        onConfirm={onConfirm}
        onReject={onReject}
      />,
    );
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onReject).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "确认" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "拒绝" })).toBeEnabled();
    rerender(
      <AiConfirmation
        state="approved"
        onConfirm={onConfirm}
        onReject={onReject}
      />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("已确认")).toBeVisible();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
  it("disables pending decisions while busy or without callbacks", () => {
    const { rerender } = render(<AiConfirmation />);
    expect(screen.getByRole("button", { name: "确认" })).toBeDisabled();
    rerender(<AiConfirmation busy onConfirm={vi.fn()} onReject={vi.fn()} />);
    expect(screen.getByRole("button", { name: "拒绝" })).toBeDisabled();
  });
  it("localizes default labels and only restores checkpoints on explicit action", () => {
    const restore = vi.fn();
    const { rerender } = render(
      <MtoneProvider locale="en">
        <AiCheckpoint onRestore={restore} />
        <AiReasoning text="Summary" />
      </MtoneProvider>,
    );
    expect(restore).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Restore" }));
    expect(restore).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "Public explanation" }),
    ).toHaveAttribute("aria-expanded", "false");
    rerender(<AiCheckpoint disabled onRestore={restore} />);
    fireEvent.click(screen.getByRole("button", { name: "恢复" }));
    expect(restore).toHaveBeenCalledTimes(1);
  });
});

it("keeps streamed public explanations updated without forcing disclosures open", () => {
  const { rerender } = render(
    <AiReasoning title="Progress" text="First" status="running" />,
  );
  rerender(
    <AiReasoning
      title="Progress"
      text="First, then second"
      status="completed"
    />,
  );
  expect(screen.getByRole("button", { name: "Progress" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  fireEvent.click(screen.getByRole("button", { name: "Progress" }));
  expect(screen.getByText("First, then second")).toBeVisible();
  expect(screen.getByText("已完成")).toBeVisible();
});

it("uses distinct disclosure IDs and never submits an enclosing form", () => {
  const submit = vi.fn((event) => event.preventDefault()),
    reject = vi.fn();
  render(
    <form onSubmit={submit}>
      <AiTask title="First" />
      <AiTask title="Second" />
      <AiCheckpoint onRestore={vi.fn()} />
      <AiConfirmation onConfirm={vi.fn()} onReject={reject} />
    </form>,
  );
  const first = screen.getByRole("button", { name: "First" }),
    second = screen.getByRole("button", { name: "Second" });
  expect(first.getAttribute("aria-controls")).not.toBe(
    second.getAttribute("aria-controls"),
  );
  fireEvent.click(screen.getByRole("button", { name: "恢复" }));
  fireEvent.click(screen.getByRole("button", { name: "拒绝" }));
  expect(reject).toHaveBeenCalledTimes(1);
  expect(submit).not.toHaveBeenCalled();
});

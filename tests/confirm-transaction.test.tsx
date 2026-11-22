import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "../packages/mtone/src/interactive";
import { runConfirmTransaction } from "../packages/mtone/src/confirm-transaction";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("internal confirmation transaction", () => {
  it("awaits the result and supports early settlement without duplicate cleanup", async () => {
    const action = deferred<boolean>();
    const steps: unknown[] = [];
    const task = runConfirmTransaction({
      invoke: () => action.promise,
      onPending: () => steps.push("pending"),
      onFinish: () => steps.push("finish"),
      onResolve: (result, finish) => {
        finish();
        steps.push(result);
      },
      onReject: vi.fn(),
    });
    expect(steps).toEqual(["pending"]);
    action.resolve(false);
    await task;
    expect(steps).toEqual(["pending", "finish", false]);
  });

  it("leaves a stale async result alone", async () => {
    const action = deferred<void>();
    const onFinish = vi.fn();
    const onReject = vi.fn();
    let current = true;
    const task = runConfirmTransaction({
      invoke: () => action.promise,
      isCurrent: () => current,
      onPending: vi.fn(),
      onFinish,
      onResolve: vi.fn(),
      onReject,
    });
    current = false;
    action.reject(new Error("old session"));
    await task;
    expect(onFinish).not.toHaveBeenCalled();
    expect(onReject).not.toHaveBeenCalled();
  });

  it("handles synchronous failures with each component's pending policy", async () => {
    const failure = new Error("private");
    for (const alwaysPending of [true, false]) {
      const steps: unknown[] = [];
      await runConfirmTransaction({
        invoke: () => {
          throw failure;
        },
        alwaysPending,
        onPending: () => steps.push("pending"),
        onFinish: () => steps.push("finish"),
        onResolve: vi.fn(),
        onReject: (error) => steps.push(error),
      });
      expect(steps).toEqual(
        alwaysPending ? ["pending", failure, "finish"] : [failure, "finish"],
      );
    }
  });
});

describe("ConfirmDialog confirmation", () => {
  it("keeps a controlled dialog open on failure and requests close after retry", async () => {
    const action = deferred<void>();
    const change = vi.fn();
    const confirm = vi
      .fn<() => void | Promise<void>>()
      .mockImplementationOnce(() => action.promise)
      .mockImplementationOnce(() => undefined);
    render(
      <ConfirmDialog
        title="Delete item?"
        open
        onOpenChange={change}
        onConfirm={confirm}
        confirmText="Confirm"
        cancelText="Cancel"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "…" })).toBeDisabled();
    await act(async () => action.reject(new Error("private")));
    expect(screen.getByRole("alert")).toHaveTextContent("操作失败");
    expect(change).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await waitFor(() => expect(change).toHaveBeenCalledWith(false));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.getByRole("alertdialog", { name: "Delete item?" }),
    ).toBeInTheDocument();
  });

  it("shows a generic synchronous error without leaking the thrown text", () => {
    render(
      <ConfirmDialog
        open
        title="Question"
        onConfirm={() => {
          throw new Error("private");
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "确认" }));
    expect(screen.getByRole("alert")).toHaveTextContent("操作失败");
    expect(screen.queryByText("private")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "确认" })).toBeEnabled();
  });
});

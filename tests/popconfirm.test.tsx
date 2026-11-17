import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { test, expect, vi } from "vitest";
import { Popconfirm } from "../packages/mtone/src/popconfirm";
import { Button, MtoneProvider } from "../packages/mtone/src/basic";
const trigger = <button>Delete</button>;
test("opens labelled dialog and confirms once, then closes", async () => {
  const confirm = vi.fn();
  render(
    <Popconfirm
      trigger={trigger}
      title="Delete item?"
      description="Cannot undo"
      onConfirm={confirm}
    />,
  );
  fireEvent.click(screen.getByText("Delete"));
  expect(
    await screen.findByRole("dialog", { name: "Delete item?" }),
  ).toHaveAccessibleDescription("Cannot undo");
  fireEvent.click(screen.getByText("确定"));
  expect(confirm).toHaveBeenCalledTimes(1);
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
});
test("cancel does not confirm and restores trigger focus", async () => {
  const cancel = vi.fn(),
    confirm = vi.fn();
  render(
    <Popconfirm
      trigger={trigger}
      title="Question"
      onCancel={cancel}
      onConfirm={confirm}
    />,
  );
  fireEvent.click(screen.getByText("Delete"));
  fireEvent.click(await screen.findByText("取消"));
  expect(cancel).toHaveBeenCalledTimes(1);
  expect(confirm).not.toHaveBeenCalled();
  await waitFor(() => expect(screen.getByText("Delete")).toHaveFocus());
});
test("controlled open only requests a change", async () => {
  const change = vi.fn();
  render(
    <Popconfirm
      trigger={trigger}
      title="Question"
      open
      onOpenChange={change}
    />,
  );
  fireEvent.click(await screen.findByText("取消"));
  expect(change).toHaveBeenCalledWith(false);
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});
test("disabled prevents opening and confirmation", () => {
  render(
    <Popconfirm trigger={trigger} title="Question" disabled defaultOpen />,
  );
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  fireEvent.click(screen.getByText("Delete"));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
test("pending promise prevents duplicate confirmations, rejects visibly and permits retry", async () => {
  let reject!: (e: Error) => void;
  const error = new Error("No");
  const onError = vi.fn();
  const confirm = vi.fn(
    () =>
      new Promise<void>((_, r) => {
        reject = r;
      }),
  );
  render(
    <Popconfirm
      trigger={trigger}
      title="Question"
      defaultOpen
      onConfirm={confirm}
      onConfirmError={onError}
    />,
  );
  const ok = await screen.findByText("确定");
  fireEvent.click(ok);
  fireEvent.click(ok);
  expect(confirm).toHaveBeenCalledTimes(1);
  expect(ok.closest("button")).toBeDisabled();
  await act(async () => reject(error));
  expect(onError).toHaveBeenCalledWith(error);
  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(ok.closest("button")).not.toBeDisabled();
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});
test("resolved promise closes dialog", async () => {
  let resolve!: () => void;
  render(
    <Popconfirm
      trigger={trigger}
      title="Question"
      defaultOpen
      onConfirm={() =>
        new Promise<void>((r) => {
          resolve = r;
        })
      }
    />,
  );
  fireEvent.click(await screen.findByText("确定"));
  await act(async () => resolve());
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
});
test("English labels, custom content and hidden cancel", async () => {
  render(
    <MtoneProvider locale="en">
      <Popconfirm
        trigger={trigger}
        title={() => "Question"}
        description={() => "Details"}
        icon={null}
        showCancel={false}
        defaultOpen
      />
    </MtoneProvider>,
  );
  expect(await screen.findByText("OK")).toBeInTheDocument();
  expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
  expect(screen.getByText("Details")).toBeInTheDocument();
});
test("escape dismisses without calling cancellation action", async () => {
  const cancel = vi.fn();
  render(<Popconfirm trigger={trigger} title="Question" onCancel={cancel} />);
  fireEvent.click(screen.getByText("Delete"));
  const dialog = await screen.findByRole("dialog");
  fireEvent.keyDown(dialog, { key: "Escape" });
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(cancel).not.toHaveBeenCalled();
});
test("onConfirm returning false keeps popup open", async () => {
  render(
    <Popconfirm
      trigger={trigger}
      title="Question"
      defaultOpen
      onConfirm={() => false}
    />,
  );
  fireEvent.click(await screen.findByText("确定"));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});
test("stale resolution after externally closing and reopening cannot close a new session", async () => {
  let resolve!: () => void;
  const change = vi.fn();
  const props = {
    trigger,
    title: "Question",
    onOpenChange: change,
    onConfirm: () =>
      new Promise<void>((r) => {
        resolve = r;
      }),
  };
  const { rerender } = render(<Popconfirm {...props} open />);
  fireEvent.click(await screen.findByText("确定"));
  rerender(<Popconfirm {...props} open={false} />);
  rerender(<Popconfirm {...props} open />);
  await act(async () => resolve());
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByText("确定").closest("button")).not.toBeDisabled();
});
test("pending blocks cancellation and Escape until resolution", async () => {
  let resolve!: () => void;
  const cancel = vi.fn();
  render(
    <Popconfirm
      trigger={trigger}
      title="Question"
      defaultOpen
      onCancel={cancel}
      onConfirm={() =>
        new Promise<void>((r) => {
          resolve = r;
        })
      }
    />,
  );
  fireEvent.click(await screen.findByText("确定"));
  fireEvent.click(screen.getByText("取消"));
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  expect(cancel).not.toHaveBeenCalled();
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  await act(async () => resolve());
});
test("disabling while pending prevents stale callback after reenable", async () => {
  let reject!: (e: Error) => void;
  const fail = vi.fn();
  const props = {
    trigger,
    title: "Question",
    defaultOpen: true,
    onConfirmError: fail,
    onConfirm: () =>
      new Promise<void>((_, r) => {
        reject = r;
      }),
  };
  const { rerender } = render(<Popconfirm {...props} />);
  fireEvent.click(await screen.findByText("确定"));
  rerender(<Popconfirm {...props} disabled />);
  await act(async () => reject(new Error("old")));
  expect(fail).not.toHaveBeenCalled();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  rerender(<Popconfirm {...props} />);
  expect(await screen.findByText("确定")).not.toBeDisabled();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
test("custom labels and button props remain supported", async () => {
  render(
    <Popconfirm
      trigger={trigger}
      title="Question"
      defaultOpen
      okText="Erase"
      cancelText="Keep"
      okButtonProps={{ danger: true, disabled: true }}
      cancelButtonProps={{ variant: "ghost" }}
    />,
  );
  expect(await screen.findByRole("button", { name: "Erase" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Keep" })).toHaveClass(
    "mt-btn-ghost",
  );
});
test("throwing confirm remains open with customizable failure text", async () => {
  render(
    <Popconfirm
      trigger={trigger}
      title="Question"
      defaultOpen
      errorText="Try again"
      onConfirm={() => {
        throw Error("private");
      }}
    />,
  );
  fireEvent.click(await screen.findByText("确定"));
  expect(screen.getByRole("alert")).toHaveTextContent("Try again");
  expect(screen.queryByText("private")).not.toBeInTheDocument();
});
test("cancel handler may prevent closing", async () => {
  render(
    <Popconfirm
      trigger={trigger}
      title="Question"
      defaultOpen
      onCancel={(e) => e.preventDefault()}
    />,
  );
  fireEvent.click(await screen.findByText("取消"));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});

test("unmounting while pending ignores resolution and error callbacks", async () => {
  let reject!: (e: Error) => void;
  const error = vi.fn();
  const change = vi.fn();
  const { unmount } = render(
    <Popconfirm
      trigger={trigger}
      title="Question"
      defaultOpen
      onOpenChange={change}
      onConfirmError={error}
      onConfirm={() =>
        new Promise<void>((_, r) => {
          reject = r;
        })
      }
    />,
  );
  fireEvent.click(await screen.findByText("确定"));
  unmount();
  await act(async () => reject(new Error("late")));
  expect(error).not.toHaveBeenCalled();
  expect(change).not.toHaveBeenCalled();
});

test("a disabled trigger cannot open while Popconfirm itself is enabled", async () => {
  render(
    <Popconfirm
      trigger={<button disabled>Disabled action</button>}
      title="Question"
    />,
  );
  const button = screen.getByRole("button", { name: "Disabled action" });
  expect(button).toBeDisabled();
  fireEvent.click(button);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("mtone disabled Button remains disabled as a trigger", () => {
  render(
    <Popconfirm
      trigger={<Button disabled>Disabled mtone action</Button>}
      title="Question"
    />,
  );
  const button = screen.getByRole("button", { name: "Disabled mtone action" });
  expect(button).toBeDisabled();
  fireEvent.click(button);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

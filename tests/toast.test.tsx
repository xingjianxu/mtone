import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { it, expect } from "vitest";
import { ToastProvider, useToast } from "../packages/mtone/src";
function Demo() {
  const toast = useToast();
  return (
    <>
      <button
        onClick={() =>
          toast.add({
            id: "notice",
            type: "success",
            title: "Saved",
            body: "Body text",
            position: "top-right",
            timeout: 0,
          })
        }
      >
        Add
      </button>
      <button
        onClick={() =>
          toast.update("notice", {
            type: "error",
            title: "Failed",
            body: "Retry later",
            position: "center",
          })
        }
      >
        Update
      </button>
      <button
        onClick={() =>
          toast.info({
            title: "Information",
            body: "Details",
            position: "top-center",
          })
        }
      >
        Info
      </button>
      <button
        onClick={() =>
          toast.add({ title: "Custom", children: <strong>Custom body</strong> })
        }
      >
        Custom
      </button>
      <button onClick={() => toast.close()}>Close all</button>
    </>
  );
}
it("renders presets, title/body and multiple positions inside one accessible viewport", () => {
  render(
    <ToastProvider>
      <Demo />
    </ToastProvider>,
  );
  fireEvent.click(screen.getByText("Add"));
  fireEvent.click(screen.getByText("Info"));
  expect(screen.getByText("Body text")).toBeVisible();
  expect(screen.getByText("Saved").closest(".mt-toast")).toHaveAttribute(
    "data-type",
    "success",
  );
  expect(screen.getByText("Saved").closest(".mt-toast-stack")).toHaveAttribute(
    "data-position",
    "top-right",
  );
  expect(
    screen.getByText("Information").closest(".mt-toast-stack"),
  ).toHaveAttribute("data-position", "top-center");
  expect(document.querySelectorAll(".mt-toast-viewport")).toHaveLength(1);
});
it("updates content, type and position, and supports custom children", async () => {
  render(
    <ToastProvider>
      <Demo />
    </ToastProvider>,
  );
  fireEvent.click(screen.getByText("Add"));
  fireEvent.click(screen.getByText("Update"));
  expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  expect(screen.getByText("Failed").closest(".mt-toast")).toHaveAttribute(
    "data-type",
    "error",
  );
  expect(
    screen.getByText("Retry later").closest(".mt-toast-stack"),
  ).toHaveAttribute("data-position", "center");
  fireEvent.click(screen.getByText("Custom"));
  expect(screen.getByText("Custom body")).toBeVisible();
  fireEvent.click(screen.getByText("Close all"));
  await waitFor(() =>
    expect(screen.queryByText("Failed")).not.toBeInTheDocument(),
  );
});
it("keeps legacy descriptions, provider default position and global limit", () => {
  function Legacy() {
    const toast = useToast();
    return (
      <button
        onClick={() => {
          toast.add({
            title: "Older",
            description: "Legacy description",
            timeout: 0,
          });
          toast.error({ title: "Newer", body: "Error body", timeout: 0 });
        }}
      >
        Legacy
      </button>
    );
  }
  render(
    <ToastProvider position="top-left" limit={1}>
      <Legacy />
    </ToastProvider>,
  );
  fireEvent.click(screen.getByText("Legacy"));
  expect(
    screen.getByText("Legacy description").closest(".mt-toast"),
  ).toHaveAttribute("data-limited");
  expect(screen.getByText("Newer").closest(".mt-toast-stack")).toHaveAttribute(
    "data-position",
    "top-left",
  );
});
it("handles promise notifications and retains the loading position", async () => {
  function Async() {
    const toast = useToast();
    return (
      <button
        onClick={() => {
          void toast.promise(Promise.resolve("Result"), {
            loading: { title: "Loading", position: "center-top" },
            success: (result) => ({ title: result, body: "Completed" }),
            error: "Error",
          });
        }}
      >
        Run
      </button>
    );
  }
  render(
    <ToastProvider>
      <Async />
    </ToastProvider>,
  );
  fireEvent.click(screen.getByText("Run"));
  expect(await screen.findByText("Completed")).toBeVisible();
  expect(screen.getByText("Result").closest(".mt-toast-stack")).toHaveAttribute(
    "data-position",
    "center-top",
  );
});
it("closes a notification through its accessible close button", async () => {
  render(
    <ToastProvider>
      <Demo />
    </ToastProvider>,
  );
  fireEvent.click(screen.getByText("Add"));
  fireEvent.keyDown(document, { key: "F6" });
  fireEvent.click(screen.getByRole("button", { name: "关闭" }));
  await waitFor(() =>
    expect(screen.queryByText("Saved")).not.toBeInTheDocument(),
  );
});
it("preserves position on immediate same-id upserts", () => {
  function Upsert() {
    const toast = useToast();
    return (
      <button
        onClick={() => {
          toast.add({ id: "same", title: "First", position: "center" });
          toast.add({ id: "same", title: "Updated" });
        }}
      >
        Upsert
      </button>
    );
  }
  render(
    <ToastProvider>
      <Upsert />
    </ToastProvider>,
  );
  fireEvent.click(screen.getByText("Upsert"));
  expect(
    screen.getByText("Updated").closest(".mt-toast-stack"),
  ).toHaveAttribute("data-position", "center");
});
it("preserves custom child state and focus when a toast moves position", () => {
  function Content() {
    const toast = useToast();
    const [count, setCount] = React.useState(0);
    return (
      <button
        onClick={() => {
          setCount(count + 1);
          toast.update("move", { position: "center" });
        }}
      >
        Count {count}
      </button>
    );
  }
  function Moving() {
    const toast = useToast();
    return (
      <button
        onClick={() =>
          toast.add({ id: "move", title: "Moving", children: <Content /> })
        }
      >
        Move demo
      </button>
    );
  }
  render(
    <ToastProvider>
      <Moving />
    </ToastProvider>,
  );
  fireEvent.click(screen.getByText("Move demo"));
  const button = screen.getByText("Count 0");
  button.focus();
  fireEvent.click(button);
  expect(screen.getByText("Count 1")).toHaveFocus();
  expect(screen.getByText("Moving").closest(".mt-toast-stack")).toHaveAttribute(
    "data-position",
    "center",
  );
});
it("supports body-only and custom-only notifications without empty headings", () => {
  function Minimal() {
    const toast = useToast();
    return (
      <button
        onClick={() => {
          toast.add({ body: "Body only", timeout: 0 });
          toast.add({ children: <button>Custom action</button>, timeout: 0 });
        }}
      >
        Minimal
      </button>
    );
  }
  render(
    <ToastProvider>
      <Minimal />
    </ToastProvider>,
  );
  fireEvent.click(screen.getByText("Minimal"));
  expect(
    screen
      .getByText("Body only")
      .closest(".mt-toast")
      ?.querySelector(".mt-toast-title"),
  ).toBeNull();
  expect(
    screen.getByText("Custom action").closest(".mt-toast-custom"),
  ).not.toBeNull();
  expect(
    document.querySelectorAll('.mt-toast-icon[aria-hidden="true"]'),
  ).toHaveLength(2);
});

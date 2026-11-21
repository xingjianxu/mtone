import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { HoverCard } from "../packages/mtone/src";

describe("HoverCard", () => {
  it("opens on hover, allows entering its content, and dismisses with Escape", async () => {
    const user = userEvent.setup();
    render(
      <HoverCard
        openDelay={0}
        closeDelay={100}
        trigger={<a href="#profile">Author</a>}
        content={<a href="#details">Profile details</a>}
      />,
    );
    await user.hover(screen.getByText("Author"));
    expect(await screen.findByText("Profile details")).toBeVisible();
    await user.hover(screen.getByText("Profile details"));
    expect(screen.getByText("Profile details")).toBeVisible();
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByText("Profile details")).not.toBeInTheDocument(),
    );
  });
  it("opens with keyboard focus without stealing focus and closes on blur", async () => {
    const user = userEvent.setup();
    render(
      <>
        <HoverCard
          openDelay={0}
          trigger={<button>Info</button>}
          content="Preview text"
        />
        <button>Next</button>
      </>,
    );
    await user.tab();
    expect(await screen.findByText("Preview text")).toBeVisible();
    expect(screen.getByText("Info")).toHaveFocus();
    await user.tab();
    await waitFor(() =>
      expect(screen.queryByText("Preview text")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Next")).toHaveFocus();
  });
  it("honors controlled state and reports changes", async () => {
    const change = vi.fn();
    const { rerender } = render(
      <HoverCard
        open={false}
        openDelay={0}
        onOpenChange={change}
        trigger={<button>Info</button>}
        content="Controlled"
      />,
    );
    await userEvent.hover(screen.getByText("Info"));
    await waitFor(() => expect(change).toHaveBeenCalledWith(true));
    expect(screen.queryByText("Controlled")).not.toBeInTheDocument();
    rerender(
      <HoverCard
        open
        width={240}
        withArrow
        title="Title"
        trigger={<button>Info</button>}
        content="Controlled"
      />,
    );
    expect(await screen.findByText("Controlled")).toBeVisible();
    expect(
      screen.getByText("Controlled").closest(".mt-hover-card"),
    ).toHaveStyle({ width: "240px" });
    expect(screen.getByText("Title")).toBeVisible();
    expect(document.querySelector(".mt-hover-card-arrow")).toBeInTheDocument();
  });
  it("preserves trigger click behavior and does not open for disabled cards", async () => {
    const click = vi.fn();
    render(
      <HoverCard
        disabled
        openDelay={0}
        trigger={<button onClick={click}>Info</button>}
        content="Hidden"
      />,
    );
    await userEvent.hover(screen.getByText("Info"));
    await userEvent.click(screen.getByText("Info"));
    expect(click).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });
  it("cancels delayed opening when the pointer leaves and can reopen", async () => {
    const user = userEvent.setup();
    render(
      <HoverCard
        openDelay={100}
        closeDelay={0}
        trigger={<button>Delay</button>}
        content="Delayed content"
      />,
    );
    const trigger = screen.getByText("Delay");
    await user.hover(trigger);
    expect(screen.queryByText("Delayed content")).not.toBeInTheDocument();
    await user.unhover(trigger);
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(screen.queryByText("Delayed content")).not.toBeInTheDocument();
    await user.hover(trigger);
    expect(await screen.findByText("Delayed content")).toBeVisible();
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByText("Delayed content")).not.toBeInTheDocument(),
    );
    await user.unhover(trigger);
    await user.hover(trigger);
    expect(await screen.findByText("Delayed content")).toBeVisible();
  });
  it("closes on outside press", async () => {
    render(
      <>
        <HoverCard
          defaultOpen
          trigger={<button>Preview</button>}
          content="Initial preview"
        />
        <button>Outside</button>
      </>,
    );
    expect(await screen.findByText("Initial preview")).toBeVisible();
    await userEvent.click(screen.getByText("Outside"));
    await waitFor(() =>
      expect(screen.queryByText("Initial preview")).not.toBeInTheDocument(),
    );
  });
  it("can re-enable an uncontrolled preview after disabling it", async () => {
    const user = userEvent.setup();
    const props = {
      trigger: <button>Toggle</button>,
      content: "Toggle preview",
      openDelay: 0,
    };
    const { rerender } = render(<HoverCard {...props} />);
    await user.hover(screen.getByText("Toggle"));
    expect(await screen.findByText("Toggle preview")).toBeVisible();
    rerender(<HoverCard {...props} disabled />);
    await waitFor(() =>
      expect(screen.queryByText("Toggle preview")).not.toBeInTheDocument(),
    );
    await user.unhover(screen.getByText("Toggle"));
    rerender(<HoverCard {...props} />);
    await user.hover(screen.getByText("Toggle"));
    expect(await screen.findByText("Toggle preview")).toBeVisible();
  });
});

describe("HoverCard portal focus boundaries", () => {
  it("keeps a nested portal open when the trigger blur check runs later", async () => {
    const { createPortal } = await import("react-dom");
    const { MtoneScope } = await import("../packages/mtone/src/basic");
    const { act } = await import("@testing-library/react");
    const change = vi.fn();
    render(
      <>
        <HoverCard
          defaultOpen
          openDelay={0}
          onOpenChange={change}
          trigger={<button>Portal author</button>}
          content={
            <>
              <span>Parent preview</span>
              {createPortal(
                <MtoneScope>
                  <button>Nested action</button>
                </MtoneScope>,
                document.body,
              )}
            </>
          }
        />
        <button>Outside preview</button>
      </>,
    );
    const trigger = screen.getByText("Portal author");
    const nested = screen.getByText("Nested action");
    act(() => {
      trigger.focus();
      nested.focus();
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
    });
    expect(screen.getByText("Parent preview")).toBeVisible();
    expect(nested).toHaveFocus();
    expect(change).not.toHaveBeenCalledWith(false);
    act(() => {
      screen.getByText("Outside preview").focus();
    });
    await waitFor(() =>
      expect(screen.queryByText("Parent preview")).not.toBeInTheDocument(),
    );
  });
});

it("does not treat an unrelated portal as its own", async () => {
  const { createPortal } = await import("react-dom");
  const { MtoneScope } = await import("../packages/mtone/src/basic");
  const { act } = await import("@testing-library/react");
  render(
    <>
      <HoverCard
        defaultOpen
        openDelay={0}
        trigger={<button>Owned trigger</button>}
        content="Owned preview"
      />
      {createPortal(
        <MtoneScope>
          <button>Unrelated portal</button>
        </MtoneScope>,
        document.body,
      )}
    </>,
  );
  act(() => {
    screen.getByText("Owned trigger").focus();
    screen.getByText("Unrelated portal").focus();
  });
  await waitFor(() =>
    expect(screen.queryByText("Owned preview")).not.toBeInTheDocument(),
  );
});

it("keeps the preview while a real nested Popover closes with Escape", async () => {
  const { Popover } = await import("../packages/mtone/src");
  const { act } = await import("@testing-library/react");
  render(
    <HoverCard
      defaultOpen
      openDelay={0}
      trigger={<button>Nested owner</button>}
      content={
        <>
          <span>Nested parent content</span>
          <Popover
            defaultOpen
            trigger={<button>Popover trigger</button>}
            content={<button>Popover action</button>}
          />
        </>
      }
    />,
  );
  const nested = await screen.findByText("Popover action");
  act(() => {
    screen.getByText("Nested owner").focus();
    nested.focus();
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
  expect(screen.getByText("Nested parent content")).toBeVisible();
  await userEvent.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByText("Popover action")).not.toBeInTheDocument(),
  );
  expect(screen.getByText("Nested parent content")).toBeVisible();
  await userEvent.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByText("Nested parent content")).not.toBeInTheDocument(),
  );
});

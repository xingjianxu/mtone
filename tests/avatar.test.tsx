import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Avatar, AvatarGroup } from "../packages/mtone/src/basic";

describe("Avatar", () => {
  it("preserves name initials and default size", () => {
    render(<Avatar name="Alice" />);
    expect(screen.getByLabelText("Alice")).toHaveStyle({
      "--mt-avatar-size": "24px",
    });
    expect(screen.getByText("AL")).toBeInTheDocument();
  });
  it("uses full children, icon priority and alternate image text", () => {
    const { rerender } = render(<Avatar name="Alice">LONG NAME</Avatar>);
    expect(screen.getByText("LONG NAME")).toBeInTheDocument();
    rerender(
      <Avatar name="Alice" icon={<i>icon</i>}>
        TEXT
      </Avatar>,
    );
    expect(screen.getByText("icon")).toBeInTheDocument();
    rerender(<Avatar src="a.png" name="Alice" alt="Portrait" />);
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Portrait");
  });
  it("falls back after errors, resets when src or srcSet changes", () => {
    const { rerender } = render(<Avatar src="bad" name="Alice" />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByText("AL")).toBeInTheDocument();
    rerender(<Avatar src="good" name="Alice" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "good");
    fireEvent.error(screen.getByRole("img"));
    rerender(<Avatar src="good" srcSet="retina 2x" name="Alice" />);
    expect(screen.getByRole("img")).toHaveAttribute("srcset", "retina 2x");
  });
  it("allows onError to opt out of fallback", () => {
    const onError = vi.fn(() => false);
    render(<Avatar src="bad" onError={onError} name="Alice" />);
    fireEvent.error(screen.getByRole("img"));
    expect(onError).toHaveBeenCalledOnce();
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
  it("forwards ref, shape, styles, image attributes and handlers", () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <Avatar
        ref={ref}
        src="image"
        alt="Portrait"
        shape="square"
        size="lg"
        srcSet="image2 2x"
        crossOrigin="anonymous"
        draggable={false}
        className="custom"
        style={{ color: "red" }}
      />,
    );
    expect(ref.current).toHaveClass("custom", "mt-avatar-square");
    expect(ref.current).toHaveStyle({
      color: "rgb(255, 0, 0)",
      "--mt-avatar-size": "40px",
    });
    expect(screen.getByRole("img")).toHaveAttribute("draggable", "false");
    expect(screen.getByRole("img")).toHaveAttribute("crossorigin", "anonymous");
  });
  it("provides cumulative responsive sizes without browser globals at render", () => {
    render(<Avatar name="A" size={{ xs: 20, md: 48 }} />);
    expect(screen.getByLabelText("A")).toHaveStyle({
      "--mt-avatar-size-xs": "20px",
      "--mt-avatar-size-sm": "20px",
      "--mt-avatar-size-md": "48px",
      "--mt-avatar-size-xxl": "48px",
    });
  });
  it("shrinks long text to fit the available width", async () => {
    const spy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        return {
          width: this.classList.contains("mt-avatar-text") ? 100 : 24,
          height: 24,
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          right: 24,
          bottom: 24,
          toJSON() {},
        };
      });
    render(<Avatar gap={4}>LONG TEXT</Avatar>);
    await waitFor(() =>
      expect(screen.getByText("LONG TEXT")).toHaveStyle({
        transform: "scale(0.16)",
      }),
    );
    spy.mockRestore();
  });
});

describe("AvatarGroup", () => {
  it("preserves items and max API with untruncated overflow counts", () => {
    render(
      <AvatarGroup
        items={Array.from({ length: 16 }, (_, i) => ({ name: `User ${i}` }))}
        max={4}
      />,
    );
    expect(
      screen.getByRole("button", { name: "显示另外 12 位成员" }),
    ).toHaveTextContent("+12");
    expect(
      document.querySelectorAll(".mt-avatar-group > .mt-avatar"),
    ).toHaveLength(4);
  });
  it("reveals hidden members with keyboard accessible popover", async () => {
    render(
      <AvatarGroup items={[{ name: "Alice" }, { name: "Bob" }]} max={1} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "显示另外 1 位成员" }));
    expect(await screen.findByText("Bob")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveAccessibleName("更多成员");
  });
  it("supports children, group defaults and individual overrides", () => {
    render(
      <Avatar.Group size={40} shape="square">
        <Avatar name="A" />
        <Avatar name="B" size={20} shape="circle" />
      </Avatar.Group>,
    );
    expect(screen.getByLabelText("A")).toHaveStyle({
      "--mt-avatar-size": "40px",
    });
    expect(screen.getByLabelText("A")).toHaveClass("mt-avatar-square");
    expect(screen.getByLabelText("B")).toHaveStyle({
      "--mt-avatar-size": "20px",
    });
    expect(screen.getByLabelText("B")).not.toHaveClass("mt-avatar-square");
  });
  it("supports max object and clamps invalid max values", () => {
    const { rerender } = render(
      <AvatarGroup
        items={[{ name: "A" }, { name: "B" }]}
        max={{ count: 0, style: { color: "red" } }}
      />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("+2");
    rerender(<AvatarGroup items={[{ name: "A" }]} max={NaN} />);
    expect(screen.getByLabelText("A")).toBeInTheDocument();
  });
});

it("handles native image elements and preserves their error handler", () => {
  const error = vi.fn();
  render(
    <Avatar name="N" src={<img src="bad" alt="Native" onError={error} />}>
      Fallback
    </Avatar>,
  );
  fireEvent.error(screen.getByRole("img"));
  expect(error).toHaveBeenCalledOnce();
  expect(screen.getByText("Fallback")).toBeInTheDocument();
});

it("recovers even when returning to a previously failed source", () => {
  const { rerender } = render(<Avatar name="N" src="first" />);
  fireEvent.error(screen.getByRole("img"));
  rerender(<Avatar name="N" src="second" />);
  rerender(<Avatar name="N" src="first" />);
  expect(screen.getByRole("img")).toHaveAttribute("src", "first");
});

it("renders English overflow labels through the provider", async () => {
  const { MtoneProvider } = await import("../packages/mtone/src/basic");
  render(
    <MtoneProvider locale="en">
      <AvatarGroup max={0} items={[{ name: "N" }]} />
    </MtoneProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Show 1 more members" }));
  expect(await screen.findByRole("dialog")).toHaveAccessibleName(
    "More members",
  );
});

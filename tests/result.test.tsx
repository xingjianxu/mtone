import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import * as mtone from "../packages/mtone/src";

describe("Result", () => {
  it("exports Result with info default and node content", () => {
    expect(mtone.Result).toBeDefined();
    render(
      <mtone.Result
        title={<strong>Saved</strong>}
        subTitle="Changes are ready"
      />,
    );
    expect(screen.getByText("Saved").closest(".mt-result")).toHaveAttribute(
      "data-status",
      "info",
    );
    expect(screen.getByText("Changes are ready")).toBeVisible();
  });
  it.each([
    "success",
    "error",
    "info",
    "warning",
    "403",
    "404",
    "500",
  ] as const)("renders %s without an automatic live region", (status) => {
    const { container } = render(
      <mtone.Result status={status} title={status} />,
    );
    expect(container.firstChild).toHaveAttribute("data-status", status);
    expect(container.querySelector(".mt-result-icon")).toBeTruthy();
    expect(container.querySelector('[role="alert"], [aria-live]')).toBeNull();
  });
  it("supports custom or omitted icon and removes absent slots", () => {
    const { container, rerender } = render(
      <mtone.Result icon={<span>Custom</span>} title={0} />,
    );
    expect(screen.getByText("Custom")).toBeVisible();
    expect(screen.getByText("0")).toBeVisible();
    expect(container.querySelector(".mt-result-subtitle")).toBeNull();
    rerender(<mtone.Result icon={null} />);
    expect(container.querySelector(".mt-result-icon")).toBeNull();
    expect(container.querySelector(".mt-result-title")).toBeNull();
  });
  it("keeps actions and detailed children interactive", () => {
    const click = vi.fn();
    render(
      <mtone.Result
        title="Failure"
        extra={<button onClick={click}>Retry</button>}
      >
        <a href="#details">Details</a>
      </mtone.Result>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(click).toHaveBeenCalledOnce();
    expect(screen.getByRole("link")).toHaveAttribute("href", "#details");
  });
  it("merges semantic slots, forwards DOM attributes and ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <mtone.Result
        ref={ref}
        id="result"
        role="status"
        className="custom"
        style={{ padding: 5 }}
        title="Done"
        extra="Next"
        classNames={{ root: "root", title: "title" }}
        styles={{ title: { color: "red" } }}
      />,
    );
    expect(ref.current).toHaveClass("mt-result", "root", "custom");
    expect(ref.current).toHaveAttribute("id", "result");
    expect(ref.current).toHaveStyle({ padding: "5px" });
    expect(screen.getByText("Done")).toHaveClass("title");
    expect(screen.getByText("Done")).toHaveStyle({ color: "rgb(255, 0, 0)" });
  });
  it("allows semantic callbacks with resolved status", () => {
    render(
      <mtone.Result
        title="Callback"
        classNames={({ props }) => ({ title: `kind-${props.status}` })}
        styles={({ props }) => ({
          root: { opacity: props.status === "info" ? 0.9 : 1 },
        })}
      />,
    );
    expect(screen.getByText("Callback")).toHaveClass("kind-info");
    expect(screen.getByText("Callback").closest(".mt-result")).toHaveStyle({
      opacity: "0.9",
    });
  });
});

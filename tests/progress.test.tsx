import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Progress } from "../packages/mtone/src/basic";

describe("Progress", () => {
  it("keeps legacy default and accessible label", () => {
    const { container } = render(<Progress value={68} label="上传" />);
    expect(screen.getByRole("progressbar", { name: "上传" })).toHaveAttribute(
      "aria-valuenow",
      "68",
    );
    expect(container.querySelector(".mt-progress-info")).toBeNull();
    expect(container.querySelector(".mt-progress-fill")).toHaveStyle({
      width: "68%",
    });
  });
  it.each([-4, NaN, Infinity])("normalizes invalid values %s", (value) => {
    render(<Progress value={value} showInfo />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
  it("caps values and formats information", () => {
    render(<Progress value={130} showInfo format={(n) => <b>{n} done</b>} />);
    expect(screen.getByText("100 done")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });
  it.each(["circle", "dashboard"] as const)(
    "renders %s and unique gradients",
    (type) => {
      const { container } = render(
        <>
          <Progress
            value={40}
            type={type}
            color={{ from: "red", to: "blue" }}
          />
          <Progress value={0} type={type} color={{ from: "red", to: "blue" }} />
        </>,
      );
      const gradients = container.querySelectorAll("linearGradient");
      expect(gradients).toHaveLength(2);
      expect(gradients[0].id).not.toBe(gradients[1].id);
      expect(container.querySelectorAll(".mt-progress-arc-fill")).toHaveLength(
        1,
      );
    },
  );
  it("supports success overlays capped at current value", () => {
    const { container } = render(
      <Progress value={40} success={{ value: 80 }} />,
    );
    expect(container.querySelector(".mt-progress-success")).toHaveStyle({
      width: "40%",
    });
  });
  it.each(["line", "circle", "dashboard"] as const)(
    "supports discrete %s steps",
    (type) => {
      const { container } = render(
        <Progress value={50} type={type} steps={8} />,
      );
      expect(container.querySelectorAll("[data-progress-step]")).toHaveLength(
        8,
      );
      expect(
        container.querySelectorAll('[data-progress-step][data-filled="true"]'),
      ).toHaveLength(4);
    },
  );
  it("sanitizes geometry and bounds steps", () => {
    const { container } = render(
      <Progress
        value={20}
        type="dashboard"
        size={NaN}
        strokeWidth={-2}
        gapDegree={Infinity}
        steps={10000}
      />,
    );
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
    expect(container.querySelectorAll("[data-progress-step]")).toHaveLength(
      1000,
    );
  });
  it("normalizes invalid line sizes", () => {
    const { container } = render(<Progress value={20} size={NaN} />);
    expect(container.querySelector(".mt-progress-track")).toHaveStyle({
      height: "5px",
    });
  });
  it("keeps gaps between dense round-capped ring steps", () => {
    const { container } = render(
      <Progress value={50} type="circle" steps={100} />,
    );
    expect(
      container.querySelector("[data-progress-step] path"),
    ).toHaveAttribute("stroke-linecap", "butt");
  });
  it("does not truncate cap compensation on wide ring steps", () => {
    const { container } = render(
      <Progress
        value={50}
        type="circle"
        strokeWidth={30}
        steps={{ count: 7, gap: 0 }}
      />,
    );
    expect(
      container.querySelector("[data-progress-step] path"),
    ).toHaveAttribute("stroke-linecap", "butt");
  });
  it("anchors gradients in the full SVG viewport", () => {
    const { container } = render(
      <Progress value={50} type="circle" color={{ from: "red", to: "blue" }} />,
    );
    expect(container.querySelector("linearGradient")).toHaveAttribute(
      "gradientUnits",
      "userSpaceOnUse",
    );
  });
  it("forwards DOM attributes and explicit accessibility text", () => {
    render(
      <Progress
        value={25}
        status="exception"
        showInfo
        className="custom"
        aria-label="Task"
        aria-valuetext="Failed"
        data-testid="progress"
      />,
    );
    expect(screen.getByTestId("progress")).toHaveClass("custom");
    expect(screen.getByRole("progressbar", { name: "Task" })).toHaveAttribute(
      "aria-valuetext",
      "Failed",
    );
    expect(screen.getByTestId("progress")).toHaveAttribute(
      "data-status",
      "exception",
    );
  });
});

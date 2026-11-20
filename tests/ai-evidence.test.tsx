import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MtoneProvider } from "../packages/mtone/src/basic";
import {
  AiContext,
  AiFileTree,
  AiInlineCitation,
  AiSources,
  AiStackTrace,
  AiTerminal,
  AiTestResults,
} from "../packages/mtone/src/ai-evidence";

describe("AI evidence", () => {
  it("reports bounded context usage and unknown capacity honestly", () => {
    const { rerender } = render(<AiContext usedTokens={150} maxTokens={100} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
    expect(screen.getByText("150 / 100")).toBeInTheDocument();
    rerender(<AiContext usedTokens={NaN} maxTokens={0} />);
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.getByText("0")).toBeInTheDocument();
  });
  it("uses locale and optional context details", () => {
    render(
      <MtoneProvider locale="en">
        <AiContext
          usedTokens={10}
          inputTokens={7}
          outputTokens={3}
          cost="$0.01"
        />
      </MtoneProvider>,
    );
    expect(screen.getByText("Context")).toBeInTheDocument();
    expect(screen.getByText("Input tokens")).toBeInTheDocument();
    expect(screen.getByText("$0.01")).toBeInTheDocument();
  });
  it("expands a file tree and reports file selection without navigating", () => {
    const onSelect = vi.fn();
    render(
      <AiFileTree
        items={[
          {
            id: "src",
            name: "src",
            kind: "folder",
            children: [{ id: "a", name: "a.ts" }],
          },
        ]}
        defaultExpandedIds={["src"]}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText("a.ts"));
    expect(onSelect).toHaveBeenCalledWith(
      "a",
      expect.objectContaining({ name: "a.ts" }),
    );
    expect(screen.getByRole("treeitem", { name: "a.ts" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
  it("does not select disabled files", () => {
    const onSelect = vi.fn();
    render(
      <AiFileTree
        items={[{ id: "a", name: "a.ts", disabled: true }]}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText("a.ts"));
    expect(onSelect).not.toHaveBeenCalled();
  });
  it.each([
    "javascript:alert(1)",
    "data:text/html,test",
    "//evil.test",
    "/\\evil.test",
    "https:\n//evil.test",
    "file:///tmp/a",
  ])("does not expose unsafe citation URL %s", (url) => {
    const { container } = render(
      <AiInlineCitation source={{ id: "s", title: "Evidence", url }} />,
    );
    expect(container.querySelector("a")).toBeNull();
    expect(screen.getByText("Evidence")).toBeInTheDocument();
  });
  it.each([
    "https://example.com/report",
    "http://localhost:3000/a",
    "/report",
    "#section",
  ])("permits explicit safe citation %s", (url) => {
    render(
      <AiInlineCitation source={{ id: "s", title: "Report", url }} index={2} />,
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", url);
    expect(screen.getByRole("link")).toHaveAccessibleName("2: Report");
  });
  it("discloses source details and guards every source URL", () => {
    render(
      <AiSources
        defaultOpen
        sources={[
          {
            id: "a",
            title: "Safe",
            url: "https://example.com",
            description: "Summary",
          },
          { id: "b", title: "Unsafe", url: "javascript:alert(1)" },
        ]}
      />,
    );
    expect(screen.getByText("Summary")).toBeVisible();
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByText("Unsafe").closest("a")).toBeNull();
  });
  it("renders stack traces as inert escaped text", () => {
    const { container } = render(
      <AiStackTrace
        defaultOpen
        message={"<script>alert(1)</script>"}
        frames={[
          {
            file: "<img src=x onerror=alert(1)>",
            line: 4,
            functionName: "run",
          },
        ]}
      />,
    );
    expect(container.querySelector("script,img")).toBeNull();
    expect(screen.getByText("<script>alert(1)</script>")).toBeInTheDocument();
    expect(screen.getByText(/<img src=x onerror=alert\(1\)>:4/)).toBeVisible();
  });
  it("renders terminal output inertly and updates without taking focus", () => {
    const { container, rerender } = render(
      <>
        <button>Elsewhere</button>
        <AiTerminal output={"<img src=x>\n$ rm -rf /"} status="running" />
      </>,
    );
    screen.getByRole("button").focus();
    expect(container.querySelector("img")).toBeNull();
    rerender(
      <>
        <button>Elsewhere</button>
        <AiTerminal output="Finished" status="success" />
      </>,
    );
    expect(screen.getByRole("button")).toHaveFocus();
    expect(screen.getByText("Finished")).toBeInTheDocument();
  });
  it("summarizes test statuses and keeps failure details collapsed initially", () => {
    const { container } = render(
      <AiTestResults
        defaultOpen
        results={[
          { id: "1", name: "works", status: "passed" },
          {
            id: "2",
            name: "broken",
            status: "failed",
            durationMs: 12,
            details: "Expected 1, got 2",
          },
          { id: "3", name: "later", status: "skipped" },
        ]}
      />,
    );
    expect(screen.getByText("broken")).toBeInTheDocument();
    expect(container.querySelector("details details")).not.toHaveAttribute(
      "open",
    );
    fireEvent.click(screen.getByText("broken"));
    expect(container.querySelector("details details")).toHaveAttribute("open");
    expect(screen.getByText("Expected 1, got 2")).toBeVisible();
  });
  it("renders empty states for sources, files and tests", () => {
    render(
      <>
        <AiSources defaultOpen sources={[]} />
        <AiFileTree items={[]} />
        <AiTestResults defaultOpen results={[]} />
      </>,
    );
    expect(screen.getByText("暂无来源")).toBeVisible();
    expect(screen.getByText("暂无文件")).toBeVisible();
    expect(screen.getByText("暂无测试结果")).toBeVisible();
  });
});

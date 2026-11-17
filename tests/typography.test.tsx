import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  Text,
  Title,
  Paragraph,
  Link,
  Typography,
} from "../packages/mtone/src/typography";
describe("Typography", () => {
  it("retains inline muted Text and semantic headings", () => {
    render(
      <>
        <Text muted>Muted</Text>
        <Title level={3}>Heading</Title>
        <Link href="/docs">Docs</Link>
      </>,
    );
    expect(screen.getByText("Muted").tagName).toBe("SPAN");
    expect(screen.getByText("Muted")).toHaveClass("mt-muted");
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Heading",
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/docs");
    expect(Typography.Text).toBe(Text);
  });
  it("edits, commits and cancels plain text", () => {
    const onChange = vi.fn();
    render(<Paragraph editable={{ onChange }}>Original</Paragraph>);
    fireEvent.click(screen.getByRole("button", { name: "编辑" }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Updated" },
    });
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("Updated");
    expect(screen.getByText("Updated")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "编辑" }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Cancel" },
    });
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
    expect(screen.getByText("Updated")).toBeVisible();
  });
  it("reports clipboard success and failure", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined),
      onCopy = vi.fn(),
      onError = vi.fn();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<Text copyable={{ onCopy, onError }}>Copy me</Text>);
    fireEvent.click(screen.getByRole("button", { name: "复制" }));
    await waitFor(() => expect(onCopy).toHaveBeenCalled());
    expect(writeText).toHaveBeenCalledWith("Copy me");
  });
  it("expands and collapses and disables actions", () => {
    const { rerender } = render(
      <Paragraph ellipsis={{ rows: 2, expandable: true }}>Long</Paragraph>,
    );
    fireEvent.click(screen.getByRole("button", { name: "展开" }));
    expect(screen.getByRole("button", { name: "收起" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    rerender(
      <Text disabled copyable editable>
        Disabled
      </Text>,
    );
    expect(screen.getByRole("button", { name: "复制" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "编辑" })).toBeDisabled();
  });
});

describe("Typography interaction boundaries", () => {
  it("keeps controlled text and expansion controlled", () => {
    const changed = vi.fn(),
      expanded = vi.fn();
    render(
      <Paragraph
        editable={{ text: "Controlled", onChange: changed }}
        ellipsis={{
          expanded: false,
          expandable: true,
          onExpandedChange: expanded,
        }}
      >
        Ignored
      </Paragraph>,
    );
    fireEvent.click(screen.getByRole("button", { name: "展开" }));
    expect(expanded).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button", { name: "展开" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    fireEvent.click(screen.getByRole("button", { name: "编辑" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "New" } });
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(changed).toHaveBeenCalledWith("New");
    expect(screen.getByText("Controlled")).toBeVisible();
  });
  it("does not commit during composition or on Shift Enter", () => {
    const changed = vi.fn();
    render(<Text editable={{ onChange: changed }}>中文</Text>);
    fireEvent.click(screen.getByRole("button", { name: "编辑" }));
    const field = screen.getByRole("textbox");
    fireEvent.compositionStart(field);
    fireEvent.keyDown(field, { key: "Enter" });
    fireEvent.compositionEnd(field);
    fireEvent.keyDown(field, { key: "Enter", shiftKey: true });
    expect(changed).not.toHaveBeenCalled();
    fireEvent.blur(field);
    expect(changed).toHaveBeenCalledTimes(1);
  });
  it("announces clipboard failure and never reports success", async () => {
    const onCopy = vi.fn(),
      onError = vi.fn();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("Denied")) },
    });
    render(<Text copyable={{ onCopy, onError }}>No</Text>);
    fireEvent.click(screen.getByRole("button", { name: "复制" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("复制失败"),
    );
    expect(onError).toHaveBeenCalled();
    expect(onCopy).not.toHaveBeenCalled();
  });
  it("supports formatting, refs and disabled links", () => {
    const ref = React.createRef<HTMLHeadingElement>(),
      click = vi.fn();
    render(
      <>
        <Title
          ref={ref}
          level={6}
          strong
          italic
          underline
          delete
          mark
          code
          keyboard
        >
          Format
        </Title>
        <Link disabled href="/bad" onClick={click}>
          Disabled link
        </Link>
      </>,
    );
    expect(ref.current?.tagName).toBe("H6");
    for (const tag of ["strong", "em", "u", "del", "mark", "code", "kbd"])
      expect(ref.current?.querySelector(tag)).not.toBeNull();
    const link = screen.getByText("Disabled link");
    fireEvent.click(link);
    expect(click).not.toHaveBeenCalled();
    expect(link).not.toHaveAttribute("href");
  });
});

it("resets composition after blur and preserves destination focus", async () => {
  render(
    <>
      <Text editable>Text</Text>
      <button>Next</button>
    </>,
  );
  fireEvent.click(screen.getByRole("button", { name: "编辑" }));
  fireEvent.compositionStart(screen.getByRole("textbox"));
  const next = screen.getByRole("button", { name: "Next" });
  next.focus();
  await new Promise((resolve) => setTimeout(resolve, 30));
  expect(next).toHaveFocus();
  fireEvent.click(screen.getByRole("button", { name: "编辑" }));
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Saved" } });
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
  expect(screen.getByText("Saved")).toBeVisible();
});

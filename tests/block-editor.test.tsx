import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, test, vi } from "vitest";
import { BlockEditor } from "../packages/mtone-blocknote/src";

beforeAll(() => {
  const viewport = document.createElement("meta");
  viewport.name = "viewport";
  viewport.content =
    "width=device-width, initial-scale=1, interactive-widget=resizes-content";
  document.head.append(viewport);
});

test("loads native blocks once per key and switches to read-only without replacing text", () => {
  const onChange = vi.fn();
  const { rerender } = render(
    <BlockEditor
      label="Notes"
      documentKey="a"
      initialContent={[{ id: "a", type: "paragraph", content: "Alpha" }]}
      onChange={onChange}
    />,
  );
  const editor = screen.getByRole("textbox", { name: "Notes" });
  expect(editor).toHaveTextContent("Alpha");
  expect(editor).toHaveAttribute("contenteditable", "true");
  rerender(
    <BlockEditor
      label="Notes"
      documentKey="a"
      initialContent={[{ type: "paragraph", content: "Ignored" }]}
      readOnly
      onChange={onChange}
    />,
  );
  expect(editor).toHaveTextContent("Alpha");
  expect(editor).toHaveAttribute("contenteditable", "false");
  expect(onChange).not.toHaveBeenCalled();
  rerender(
    <BlockEditor
      label="Notes"
      documentKey="b"
      initialContent={[{ id: "b", type: "paragraph", content: "Beta" }]}
    />,
  );
  expect(screen.getByRole("textbox", { name: "Notes" })).toHaveTextContent(
    "Beta",
  );
  expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
});

test("a keyboard form submission can't reach editor controls during composition", () => {
  render(<BlockEditor label="Notes" />);
  const editor = screen.getByRole("textbox", { name: "Notes" });
  const parent = vi.fn();
  document.addEventListener("keydown", parent);
  try {
    fireEvent.compositionStart(editor, { data: "n" });
    expect(fireEvent.keyDown(editor, { key: "Enter", isComposing: true })).toBe(
      true,
    );
    expect(fireEvent.keyDown(editor, { key: "Escape" })).toBe(true);
    expect(parent).not.toHaveBeenCalled();
    fireEvent.compositionEnd(editor, { data: "你" });
    fireEvent.keyDown(editor, { key: "Escape" });
    expect(parent).toHaveBeenCalledTimes(1);
  } finally {
    document.removeEventListener("keydown", parent);
  }
});

test("uses named controls and completely removes editing controls in read only mode", () => {
  const { rerender } = render(<BlockEditor label="Notes" locale="en" />);
  expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  expect(screen.getByRole("button", { name: "Add block" })).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "Link" }));
  expect(screen.getByRole("textbox", { name: "Link URL" })).toHaveFocus();
  fireEvent.change(screen.getByRole("textbox", { name: "Link URL" }), {
    target: { value: "javascript:alert(1)" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Apply link" }));
  expect(screen.getByRole("alert")).toHaveTextContent("https");
  rerender(<BlockEditor label="Notes" locale="en" readOnly />);
  expect(
    screen.queryByRole("button", { name: "Bold" }),
  ).not.toBeInTheDocument();
});

test("readonly preserves an inline origin link and checked task state", () => {
  render(
    <BlockEditor
      locale="en"
      readOnly
      initialContent={[
        {
          type: "paragraph",
          content: [
            {
              type: "link",
              href: "https://example.com/",
              content: [
                { type: "text", text: "Reference", styles: { bold: true } },
              ],
            },
          ],
        },
        {
          type: "checkListItem",
          content: "Checked task",
          props: { checked: true },
        },
      ]}
    />,
  );
  expect(screen.getByRole("link", { name: "Reference" })).toHaveAttribute(
    "href",
    "https://example.com/",
  );
  expect(screen.getByText("Reference").closest("strong")).not.toBeNull();
  expect(screen.getByRole("checkbox")).toBeChecked();
  expect(screen.getByRole("checkbox")).toBeDisabled();
});

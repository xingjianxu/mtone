import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, expect, test, vi } from "vitest";
import { BlockEditor } from "../packages/mtone-blockeditor/src";

beforeAll(() => {
  const viewport = document.createElement("meta");
  viewport.name = "viewport";
  viewport.content =
    "width=device-width, initial-scale=1, interactive-widget=resizes-content";
  document.head.append(viewport);
  for (const target of [HTMLElement.prototype, Range.prototype]) {
    const rect = () => new DOMRect(0, 0, 0, 0);
    target.getBoundingClientRect = rect;
  }
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

test("does not render persistent editing controls in empty or read-only mode", () => {
  const { rerender } = render(<BlockEditor label="Notes" locale="en" />);
  const editor = screen.getByRole("textbox", { name: "Notes" });
  for (const name of ["Bold", "Add block", "Link"]) {
    expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
  }
  rerender(<BlockEditor label="Notes" locale="en" readOnly />);
  expect(editor).toHaveAttribute("aria-readonly", "true");
  for (const name of ["Bold", "Add block", "Link"]) {
    expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
  }
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

test("renders an editable table without persistent table controls", async () => {
  render(
    <BlockEditor
      label="Notes"
      locale="en"
      initialContent={[
        {
          type: "table",
          content: {
            type: "tableContent",
            rows: [{ cells: ["A", "B"] }, { cells: ["C", "D"] }],
          },
        },
      ]}
    />,
  );
  expect(await screen.findByRole("table")).toBeInTheDocument();
  expect(screen.getAllByRole("row")).toHaveLength(2);
  expect(screen.getAllByRole("cell")).toHaveLength(4);
  expect(
    screen.queryByRole("button", { name: "Add row" }),
  ).not.toBeInTheDocument();
});

test("read-only code is rendered with mtone Typography.Code", async () => {
  const { container } = render(
    <BlockEditor
      readOnly
      initialContent={[
        {
          type: "codeBlock",
          props: { language: "javascript" },
          content: "const answer = 42;",
        },
      ]}
    />,
  );
  await waitFor(() =>
    expect(
      container.querySelector(".mt-typography-code-block"),
    ).toHaveTextContent("const answer = 42;"),
  );
});

test("read-only renders foldable content, semantic callouts and safe image metadata", async () => {
  const { container } = render(
    <BlockEditor
      locale="en"
      readOnly
      initialContent={[
        {
          type: "toggleListItem",
          content: "Details",
          children: [{ type: "paragraph", content: "Nested detail" }],
        },
        {
          type: "callout",
          props: { tone: "warning" },
          content: "Review before publishing",
        },
        {
          type: "image",
          props: {
            url: "https://example.com/photo.png",
            alt: "Example photo",
            caption: "Figure one",
          },
        },
        {
          type: "image",
          props: { url: "javascript:alert(1)", alt: "Blocked image" },
        },
        { type: "divider" },
      ]}
    />,
  );
  expect(screen.getByText("Nested detail")).toBeInTheDocument();
  await waitFor(() =>
    expect(
      screen.getByText("Review before publishing").closest("aside"),
    ).toHaveAttribute("data-tone", "warning"),
  );
  expect(screen.getByRole("img", { name: "Example photo" })).toHaveAttribute(
    "src",
    "https://example.com/photo.png",
  );
  expect(screen.getByText("Figure one")).toBeInTheDocument();
  expect(
    screen.queryByRole("img", { name: "Blocked image" }),
  ).not.toBeInTheDocument();
  expect(container.querySelector("hr")).toBeInTheDocument();
});

test("editable code keeps its source without an idle floating preview", () => {
  const { container } = render(
    <BlockEditor
      locale="en"
      initialContent={[
        {
          id: "editable-code",
          type: "codeBlock",
          props: { language: "javascript" },
          content: "const x = 1;",
        },
      ]}
    />,
  );
  expect(
    container.querySelector(".mt-block-editor-code-source"),
  ).toHaveTextContent("const x = 1;");
  expect(container.querySelector(".mt-block-editor-code")).not.toHaveAttribute(
    "data-preview",
  );
  expect(
    screen.queryByRole("button", { name: "Highlight preview" }),
  ).not.toBeInTheDocument();
});

test("renders media captions and controls without creating unsafe resource URLs", async () => {
  const { container } = render(
    <BlockEditor
      locale="en"
      readOnly
      initialContent={[
        {
          type: "video",
          props: {
            url: "https://example.com/clip.mp4",
            caption: "Product tour",
            width: 75,
          },
        },
        {
          type: "audio",
          props: { url: "https://example.com/clip.mp3", caption: "Chime" },
        },
        {
          type: "file",
          props: {
            url: "https://example.com/notes.txt",
            name: "Notes",
            caption: "Release agenda",
          },
        },
        {
          type: "video",
          props: { url: "javascript:alert(1)", caption: "Unsafe video" },
        },
        { type: "audio", props: { url: "data:audio/mp3;base64,aaaa" } },
        {
          type: "file",
          props: { url: "//example.com/external.txt", name: "Unsafe file" },
        },
      ]}
    />,
  );
  await screen.findByText("Unsafe file");
  expect(container.querySelectorAll("video")).toHaveLength(1);
  expect(container.querySelectorAll("audio")).toHaveLength(1);
  expect(container.querySelector("video")).toHaveAttribute("controls");
  expect(container.querySelector("video")).toHaveAttribute("preload", "none");
  expect(container.querySelector("video")?.closest("figure")).toHaveStyle({
    width: "75%",
  });
  expect(container.querySelector("audio")).not.toHaveAttribute("controls");
  expect(screen.getByRole("link", { name: "Notes" })).toHaveAttribute(
    "href",
    "https://example.com/notes.txt",
  );
  expect(screen.getByRole("link", { name: "Notes" })).toHaveAttribute(
    "rel",
    "noopener noreferrer",
  );
  expect(
    screen.queryByRole("link", { name: "Unsafe file" }),
  ).not.toBeInTheDocument();
  for (const caption of ["Product tour", "Chime", "Release agenda"])
    expect(screen.getByText(caption).tagName).toBe("FIGCAPTION");
});

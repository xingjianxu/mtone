import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { expect, test, vi } from "vitest";
import type { Editor } from "../packages/mtone-blockeditor/src/block-editor";
import { MediaForm } from "../packages/mtone-blockeditor/src/editor-media-form";

function editorStub() {
  const updateBlock = vi.fn();
  const editor = {
    getBlock: vi.fn(() => ({ id: "anchor", type: "paragraph", content: [] })),
    updateBlock,
  } as unknown as Editor;
  return { editor, updateBlock };
}

test("a host upload can fail and retry without losing the file or metadata", async () => {
  const { editor, updateBlock } = editorStub();
  const upload = vi
    .fn()
    .mockRejectedValueOnce(new Error())
    .mockResolvedValueOnce("https://example.com/track.mp3");
  const onClose = vi.fn();
  render(
    <MediaForm
      editor={editor}
      target={{ anchor: "anchor", kind: "audio" }}
      zh={false}
      upload={upload}
      onClose={onClose}
    />,
  );

  expect(
    screen.getByRole("tab", { name: "Upload", selected: true }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("textbox", { name: "Audio URL" }),
  ).not.toBeInTheDocument();
  const selected = new File(["test"], "track.mp3", { type: "audio/mpeg" });
  fireEvent.change(screen.getByLabelText("Local file"), {
    target: { files: [selected] },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "Caption" }), {
    target: { value: "Demo track" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Apply audio" }));
  await screen.findByRole("alert");
  expect(updateBlock).not.toHaveBeenCalled();
  expect(screen.getByText("track.mp3")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Retry upload" }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(upload.mock.calls).toEqual([[selected], [selected]]);
  expect(updateBlock).toHaveBeenCalledWith(
    expect.objectContaining({ id: "anchor" }),
    {
      type: "audio",
      props: { url: "https://example.com/track.mp3", caption: "Demo track" },
    },
  );
});

test("without a host upload callback the embed URL is the only source", () => {
  const { editor, updateBlock } = editorStub();
  render(
    <MediaForm
      editor={editor}
      target={{ anchor: "anchor", kind: "image" }}
      zh={false}
      onClose={vi.fn()}
    />,
  );
  expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Local file")).not.toBeInTheDocument();
  const input = screen.getByRole("textbox", { name: "Image URL" });
  expect(input).toHaveFocus();
  fireEvent.change(input, {
    target: { value: "https://example.com/image.png" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "Alternative text" }), {
    target: { value: "Example" },
  });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(updateBlock).toHaveBeenCalledWith(
    expect.objectContaining({ id: "anchor" }),
    {
      type: "image",
      props: {
        url: "https://example.com/image.png",
        caption: "",
        alt: "Example",
      },
    },
  );
});

test("drop supports file names but never saves unsafe or late-resolved results", async () => {
  const { editor, updateBlock } = editorStub();
  let finish!: (url: string) => void;
  const upload = vi
    .fn()
    .mockResolvedValueOnce("blob:https://example.com/x")
    .mockImplementationOnce(
      () =>
        new Promise<string>((resolve) => {
          finish = resolve;
        }),
    );
  const onClose = vi.fn();
  const props = {
    editor,
    target: { anchor: "anchor", kind: "file" as const },
    zh: false,
    onClose,
    upload,
  };
  const { unmount } = render(<MediaForm {...props} />);
  const file = new File(["text"], "notes.txt", { type: "text/plain" });
  fireEvent.drop(screen.getByRole("button", { name: "Choose file" }), {
    dataTransfer: { files: [file], types: ["Files"] },
  });
  expect(screen.getByRole("textbox", { name: "File name" })).toHaveValue(
    "notes.txt",
  );
  fireEvent.click(screen.getByRole("button", { name: "Apply file" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("HTTP(S)");
  expect(updateBlock).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Retry upload" }));
  expect(screen.getByRole("status")).toHaveTextContent("Uploading");
  expect(
    within(screen.getByRole("tablist")).getByRole("tab", {
      name: "Embed link",
    }),
  ).toHaveAttribute("aria-disabled", "true");
  unmount();
  finish("https://example.com/notes.txt");
  await Promise.resolve();
  expect(updateBlock).not.toHaveBeenCalled();
});

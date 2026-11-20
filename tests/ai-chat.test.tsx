import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import {
  AiChat,
  AiMessage,
  AiPromptInput,
  AiSuggestion,
  AiModelSelector,
} from "../packages/mtone/src/ai-chat";
afterEach(() => vi.restoreAllMocks());
test("prompt submits Enter but not Shift+Enter or IME and retains text", () => {
  const submit = vi.fn();
  render(<AiPromptInput defaultValue="你好" onSubmit={submit} />);
  const input = screen.getByRole("textbox");
  fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
  fireEvent.compositionStart(input);
  fireEvent.keyDown(input, { key: "Enter" });
  fireEvent.compositionEnd(input);
  expect(submit).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: "Enter" });
  expect(submit).toHaveBeenCalledWith({ text: "你好", attachments: [] });
  expect(input).toHaveValue("你好");
});
test("blank prompt is disabled, attachment-only payload permitted and caller owns removal", () => {
  const submit = vi.fn(),
    remove = vi.fn();
  const { rerender } = render(<AiPromptInput onSubmit={submit} />);
  expect(screen.getByRole("button", { name: "发送" })).toBeDisabled();
  rerender(
    <AiPromptInput
      onSubmit={submit}
      attachments={[{ id: "a", name: "report.pdf" }]}
      onAttachmentRemove={remove}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "移除 report.pdf" }));
  expect(remove).toHaveBeenCalledWith("a");
  expect(screen.getByText("report.pdf")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "发送" }));
  expect(submit).toHaveBeenCalledWith({
    text: "",
    attachments: [{ id: "a", name: "report.pdf" }],
  });
});
test("controlled text and file selection remain local callbacks without upload", () => {
  const change = vi.fn(),
    files = vi.fn();
  render(
    <AiPromptInput
      value="fixed"
      onValueChange={change}
      onSubmit={() => {}}
      onFilesSelect={files}
      accept=".txt"
    />,
  );
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "new" } });
  expect(change).toHaveBeenCalledWith("new");
  expect(screen.getByRole("textbox")).toHaveValue("fixed");
  const file = new File(["abc"], "a.txt", { type: "text/plain" });
  fireEvent.change(screen.getByLabelText("选择附件"), {
    target: { files: [file] },
  });
  expect(files).toHaveBeenCalledWith([file]);
});
test("ignores a file picker result after the prompt becomes busy", () => {
  const files = vi.fn();
  const { rerender } = render(<AiPromptInput onSubmit={() => {}} onFilesSelect={files} />);
  rerender(<AiPromptInput status="streaming" onSubmit={() => {}} onFilesSelect={files} />);
  fireEvent.change(screen.getByLabelText("选择附件"), {
    target: { files: [new File(["abc"], "a.txt")] },
  });
  expect(files).not.toHaveBeenCalled();
});
test("streaming uses stop callback and never sends on Enter", () => {
  const submit = vi.fn(),
    stop = vi.fn();
  render(
    <AiPromptInput
      value="text"
      status="streaming"
      onSubmit={submit}
      onStop={stop}
    />,
  );
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
  fireEvent.click(screen.getByRole("button", { name: "停止生成" }));
  expect(stop).toHaveBeenCalledOnce();
  expect(submit).not.toHaveBeenCalled();
});
test("async submit blocks duplicate dispatch and exposes failure without discarding input", async () => {
  let reject!: (error: Error) => void;
  const submit = vi.fn(() => new Promise<void>((_, r) => (reject = r)));
  render(<AiPromptInput defaultValue="retain" onSubmit={submit} />);
  fireEvent.click(screen.getByRole("button", { name: "发送" }));
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
  expect(submit).toHaveBeenCalledOnce();
  await act(async () => reject(new Error("private backend details")));
  expect(screen.getByRole("alert")).toHaveTextContent("发送失败");
  expect(screen.getByRole("textbox")).toHaveValue("retain");
});
test("messages render caller content, actions and accessible status without interpreting markup", () => {
  render(
    <AiMessage
      from="assistant"
      name="助手"
      status="streaming"
      actions={<button>复制</button>}
    >
      {"<script>bad()</script>"}
    </AiMessage>,
  );
  expect(screen.getByText("<script>bad()</script>")).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("生成中");
  expect(screen.getByRole("button", { name: "复制" })).toBeInTheDocument();
});
test("suggestion is a native action and respects preventDefault and disabled", () => {
  const select = vi.fn();
  const { rerender } = render(
    <AiSuggestion prompt="Summarize" onSelect={select} />,
  );
  fireEvent.click(screen.getByRole("button"));
  expect(select).toHaveBeenCalledWith("Summarize");
  rerender(<AiSuggestion prompt="Other" onSelect={select} disabled />);
  fireEvent.click(screen.getByRole("button"));
  expect(select).toHaveBeenCalledTimes(1);
});
test("model selector exposes separate labelled controlled choices", () => {
  render(
    <AiModelSelector
      models={[{ value: "m", label: "Model" }]}
      value="m"
      onValueChange={() => {}}
      efforts={[{ value: "high", label: "High" }]}
      effort="high"
      onEffortChange={() => {}}
    />,
  );
  expect(screen.getByRole("combobox", { name: "模型" })).toHaveTextContent(
    "Model",
  );
  expect(screen.getByRole("combobox", { name: "推理强度" })).toHaveTextContent(
    "High",
  );
});
test("chat follows content growth only at live edge and jump restores follow", () => {
  let height = 1000,
    top = 800;
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(
    () => height,
  );
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(200);
  vi.spyOn(HTMLElement.prototype, "scrollTop", "get").mockImplementation(
    () => top,
  );
  vi.spyOn(HTMLElement.prototype, "scrollTop", "set").mockImplementation(
    (v) => {
      top = v;
    },
  );
  const { rerender } = render(
    <AiChat>
      <p>first</p>
    </AiChat>,
  );
  expect(top).toBe(1000);
  const log = screen.getByRole("log");
  top = 100;
  fireEvent.scroll(log);
  height = 1200;
  rerender(
    <AiChat>
      <p>second</p>
    </AiChat>,
  );
  expect(top).toBe(100);
  fireEvent.click(screen.getByRole("button", { name: "回到最新消息" }));
  expect(top).toBe(1200);
  expect(log).toHaveFocus();
  height = 1400;
  rerender(
    <AiChat>
      <p>third</p>
    </AiChat>,
  );
  expect(top).toBe(1400);
});
test("chat with autoFollow disabled offers jump without moving scroll", () => {
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(1000);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(200);
  let top = 0;
  vi.spyOn(HTMLElement.prototype, "scrollTop", "get").mockImplementation(
    () => top,
  );
  vi.spyOn(HTMLElement.prototype, "scrollTop", "set").mockImplementation(
    (v) => (top = v),
  );
  render(
    <AiChat autoFollow={false}>
      <p>history</p>
    </AiChat>,
  );
  expect(top).toBe(0);
  expect(
    screen.getByRole("button", { name: "回到最新消息" }),
  ).toBeInTheDocument();
});
test("native composition key and disabled input cannot dispatch", () => {
  const submit = vi.fn();
  const { rerender } = render(
    <AiPromptInput defaultValue="draft" onSubmit={submit} />,
  );
  fireEvent.keyDown(screen.getByRole("textbox"), {
    key: "Enter",
    isComposing: true,
  });
  fireEvent.keyDown(screen.getByRole("textbox"), {
    key: "Enter",
    keyCode: 229,
  });
  expect(submit).not.toHaveBeenCalled();
  rerender(<AiPromptInput defaultValue="draft" onSubmit={submit} disabled />);
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
  expect(submit).not.toHaveBeenCalled();
});

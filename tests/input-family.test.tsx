import React from "react";
import { parseRoute } from "../apps/docs/docs-app";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import {
  Input,
  SearchInput,
  Textarea,
  Fieldset,
  Form,
} from "../packages/mtone/src";

test("family aliases remain identical and refs point to native inputs", () => {
  expect(Input.Search).toBe(SearchInput);
  expect(Input.TextArea).toBe(Textarea);
  const ref = React.createRef<HTMLInputElement>();
  render(<Input ref={ref} aria-label="title" prefix="@" suffix=".com" />);
  expect(ref.current).toBe(screen.getByRole("textbox"));
  expect(screen.getByText("@")).toBeInTheDocument();
});
test("clear updates real native value, change event and count and retains focus", () => {
  const change = vi.fn(),
    clear = vi.fn();
  render(
    <Input
      aria-label="title"
      defaultValue="abc"
      allowClear
      showCount
      onChange={(e) => change(e.target.value)}
      onClear={clear}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "清除内容" }));
  expect(screen.getByRole("textbox")).toHaveValue("");
  expect(change).toHaveBeenCalledWith("");
  expect(clear).toHaveBeenCalledOnce();
  expect(screen.getByRole("textbox")).toHaveFocus();
  expect(screen.getByText("0")).toBeInTheDocument();
});
test("controlled clear leaves value to owner and readonly/fieldset blocks actions", () => {
  const change = vi.fn();
  const view = render(
    <Input value="fixed" allowClear onChange={(e) => change(e.target.value)} />,
  );
  fireEvent.click(screen.getByRole("button", { name: "清除内容" }));
  expect(change).toHaveBeenCalledWith("");
  expect(screen.getByRole("textbox")).toHaveValue("fixed");
  view.rerender(
    <Fieldset disabled>
      <Input defaultValue="fixed" allowClear />
    </Fieldset>,
  );
  expect(screen.getByRole("textbox")).toBeDisabled();
  expect(
    screen.queryByRole("button", { name: "清除内容" }),
  ).not.toBeInTheDocument();
});
test("adornment changes preserve element identity and focus", () => {
  const view = render(<Input aria-label="title" />);
  const input = screen.getByRole("textbox");
  input.focus();
  view.rerender(
    <Input aria-label="title" prefix="@" suffix=".com" showCount allowClear />,
  );
  expect(screen.getByRole("textbox")).toBe(input);
  expect(input).toHaveFocus();
});
test("search submits enter/button but not composing, loading or prevented events", () => {
  const search = vi.fn();
  const view = render(
    <Input.Search
      aria-label="search"
      defaultValue="hello"
      searchButton="查找"
      onSearch={search}
    />,
  );
  const input = screen.getByRole("textbox");
  fireEvent.keyDown(input, { key: "Enter", isComposing: true });
  expect(search).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: "Enter" });
  expect(search).toHaveBeenLastCalledWith("hello");
  fireEvent.click(screen.getByRole("button", { name: "查找" }));
  expect(search).toHaveBeenCalledTimes(2);
  view.rerender(
    <Input.Search
      defaultValue="hello"
      searchButton="查找"
      onSearch={search}
      loading
    />,
  );
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
  expect(search).toHaveBeenCalledTimes(2);
});
test("password toggle preserves focus and controlled visibility", () => {
  const view = render(
    <Input.Password aria-label="密码" defaultValue="secret" />,
  );
  const input = screen.getByLabelText("密码");
  expect(input).toHaveAttribute("type", "password");
  fireEvent.click(screen.getByRole("button", { name: "显示密码" }));
  expect(input).toHaveAttribute("type", "text");
  expect(input).toHaveFocus();
  view.rerender(<Input.Password aria-label="密码" visible={false} />);
  fireEvent.click(screen.getByRole("button", { name: "显示密码" }));
  expect(input).toHaveAttribute("type", "password");
});
test("native form reset updates count and custom count supports emoji", async () => {
  render(
    <form>
      <Input
        defaultValue="a"
        showCount
        countCharacters={(v) => Array.from(v).length}
      />
      <button type="reset">reset</button>
    </form>,
  );
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "🙂a" } });
  expect(screen.getByText("2")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "reset" }));
  await waitFor(() => expect(screen.getByText("1")).toBeInTheDocument());
});
test("textarea forwards native ref, count and controlled change", () => {
  const ref = React.createRef<HTMLTextAreaElement>();
  const change = vi.fn();
  render(
    <Input.TextArea
      ref={ref}
      aria-label="notes"
      value="text"
      onChange={change}
      showCount
      autoSize={{ minRows: 2, maxRows: 5 }}
    />,
  );
  expect(ref.current).toBe(screen.getByRole("textbox"));
  expect(screen.getByText("4")).toBeInTheDocument();
  fireEvent.change(ref.current!, { target: { value: "next" } });
  expect(change).toHaveBeenCalledOnce();
});
test("form validation receives clear events", async () => {
  render(
    <Form initialValues={{ name: "name" }}>
      <Form.Item label="Name" name="name" required>
        <Input allowClear />
      </Form.Item>
    </Form>,
  );
  fireEvent.click(screen.getByRole("button", { name: "清除内容" }));
  await waitFor(() =>
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true"),
  );
});
test("OTP integrates with Form.Item label and value callback", () => {
  const changed = vi.fn();
  render(
    <Form initialValues={{ code: "" }} onValuesChange={changed}>
      <Form.Item label="验证码标签" name="code">
        <Input.OTP length={4} />
      </Form.Item>
    </Form>,
  );
  const first = screen.getByLabelText("验证码标签");
  fireEvent.change(first, { target: { value: "1234" } });
  expect(changed).toHaveBeenCalledWith({ code: "1234" }, { code: "1234" });
});
test("readonly clear is hidden and prevented Enter does not search", () => {
  const search = vi.fn();
  render(
    <Input.Search
      defaultValue="test"
      readOnly
      allowClear
      onSearch={search}
      onKeyDown={(e) => e.preventDefault()}
    />,
  );
  expect(
    screen.queryByRole("button", { name: "清除内容" }),
  ).not.toBeInTheDocument();
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
  expect(search).not.toHaveBeenCalled();
});
test("prevented form reset leaves input count and OTP unchanged", async () => {
  render(
    <form onReset={(e) => e.preventDefault()}>
      <Input defaultValue="a" showCount />
      <Input.OTP length={2} defaultValue="12" />
      <button type="reset">Reset blocked</button>
    </form>,
  );
  fireEvent.change(screen.getAllByRole("textbox")[0], {
    target: { value: "abc" },
  });
  fireEvent.change(screen.getAllByRole("textbox")[1], {
    target: { value: "9" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Reset blocked" }));
  await new Promise((resolve) => setTimeout(resolve, 10));
  expect(screen.getAllByRole("textbox")[0]).toHaveValue("abc");
  expect(screen.getByText("3")).toBeInTheDocument();
  expect(screen.getAllByRole("textbox")[1]).toHaveValue("9");
});
test("textarea disabling autosize removes only automatic height and overflow", () => {
  const view = render(<Input.TextArea autoSize aria-label="Auto" />);
  const area = screen.getByRole("textbox");
  expect(area.style.height).not.toBe("");
  view.rerender(<Input.TextArea autoSize={false} aria-label="Auto" />);
  expect(area.style.height).toBe("");
  expect(area.style.overflowY).toBe("");
  view.rerender(
    <Input.TextArea
      autoSize={false}
      style={{ height: 80, overflowY: "scroll" }}
      aria-label="Auto"
    />,
  );
  expect(area.style.height).toBe("80px");
  expect(area.style.overflowY).toBe("scroll");
});
test("changing external form owner updates reset listener", async () => {
  const view = render(
    <>
      <form id="a" />
      <form id="b">
        <button type="reset">Reset B</button>
      </form>
      <Input form="a" defaultValue="x" showCount />
    </>,
  );
  view.rerender(
    <>
      <form id="a" />
      <form id="b">
        <button type="reset">Reset B</button>
      </form>
      <Input form="b" defaultValue="x" showCount />
    </>,
  );
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "xyz" } });
  fireEvent.click(screen.getByRole("button", { name: "Reset B" }));
  await waitFor(() => expect(screen.getByText("1")).toBeInTheDocument());
});
test("Input compatibility routes lead to the consolidated page", () => {
  expect(parseRoute("#/components/SearchInput")).toEqual({
    kind: "component",
    name: "Input",
    section: "input-search",
  });
  expect(parseRoute("#/components/Textarea")).toEqual({
    kind: "component",
    name: "Input",
    section: "input-textarea",
  });
});

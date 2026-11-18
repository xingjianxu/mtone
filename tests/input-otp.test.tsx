import * as React from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InputOTP } from "../packages/mtone/src/input-otp";
import { FieldsetDisabledContext } from "../packages/mtone/src/fieldset-context";
afterEach(cleanup);
const cells = () => screen.getAllByRole("textbox");
describe("Input.OTP", () => {
  it("renders named fields, accepts paste and emits complete once", () => {
    const change = vi.fn(),
      complete = vi.fn();
    render(
      <InputOTP
        length={4}
        aria-label="验证码"
        onValueChange={change}
        onComplete={complete}
        name="code"
      />,
    );
    expect(cells()).toHaveLength(4);
    expect(cells()[0]).toHaveAccessibleName("验证码 1 / 4");
    fireEvent.paste(cells()[0], {
      clipboardData: { getData: () => "12 34\n5" },
    });
    expect(cells().map((el) => (el as HTMLInputElement).value)).toEqual([
      "1",
      "2",
      "3",
      "4",
    ]);
    expect(change).toHaveBeenLastCalledWith("1234");
    expect(complete).toHaveBeenCalledOnce();
    expect(document.querySelector('input[type="hidden"]')).toHaveValue("1234");
    fireEvent.change(cells()[0], { target: { value: "1" } });
    expect(complete).toHaveBeenCalledOnce();
  });
  it("supports controlled values without accepting unacknowledged changes", () => {
    const change = vi.fn();
    const { rerender } = render(
      <InputOTP length={3} value="12" onValueChange={change} />,
    );
    fireEvent.change(cells()[2], { target: { value: "3" } });
    expect(change).toHaveBeenCalledWith("123");
    expect(cells()[2]).toHaveValue("");
    rerender(<InputOTP length={3} value="456" onValueChange={change} />);
    expect(cells().map((el) => (el as HTMLInputElement).value)).toEqual([
      "4",
      "5",
      "6",
    ]);
  });
  it("moves focus, edits and deletes a continuous string", () => {
    render(<InputOTP length={4} defaultValue="123" />);
    cells()[1].focus();
    fireEvent.keyDown(cells()[1], { key: "ArrowRight" });
    expect(cells()[2]).toHaveFocus();
    fireEvent.keyDown(cells()[2], { key: "Backspace" });
    expect(cells().map((el) => (el as HTMLInputElement).value)).toEqual([
      "1",
      "2",
      "",
      "",
    ]);
    expect(cells()[1]).toHaveFocus();
    fireEvent.keyDown(cells()[0], { key: "Delete" });
    expect(cells()[0]).toHaveValue("2");
    fireEvent.keyDown(cells()[0], { key: "End" });
    expect(cells()[3]).toHaveFocus();
  });
  it("does not emit partial composition or advance until composition ends", () => {
    const change = vi.fn();
    render(<InputOTP length={3} onValueChange={change} />);
    fireEvent.compositionStart(cells()[0]);
    fireEvent.change(cells()[0], { target: { value: "n" } });
    expect(change).not.toHaveBeenCalled();
    fireEvent.compositionEnd(cells()[0], {
      data: "你",
      target: { value: "你" },
    });
    expect(change).toHaveBeenLastCalledWith("你");
    expect(cells()[1]).toHaveFocus();
  });
  it("respects fieldset disabled, readonly, mask and native form omission", () => {
    const { rerender } = render(
      <FieldsetDisabledContext.Provider value={true}>
        <InputOTP defaultValue="12" name="otp" />
      </FieldsetDisabledContext.Provider>,
    );
    expect(cells()[0]).toBeDisabled();
    expect(document.querySelector('input[type="hidden"]')).toBeDisabled();
    rerender(<InputOTP defaultValue="12" readOnly mask name="otp" />);
    const inputs = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[type="password"]'),
    );
    expect(inputs).toHaveLength(6);
    fireEvent.keyDown(inputs[0], { key: "Delete" });
    expect(inputs[0]).toHaveValue("1");
    fireEvent.paste(inputs[0], { clipboardData: { getData: () => "999" } });
    expect(inputs[0]).toHaveValue("1");
  });
  it("handles unicode as characters and length changes without exceptions", () => {
    const { rerender } = render(<InputOTP length={3} defaultValue="😀AB" />);
    expect(cells()[0]).toHaveValue("😀");
    rerender(<InputOTP length={2} defaultValue="😀AB" />);
    expect(cells()).toHaveLength(2);
    expect(cells()[1]).toHaveValue("A");
  });
  it("exposes the first native input via ref and resets an uncontrolled form", async () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <form aria-label="form">
        <InputOTP ref={ref} defaultValue="12" length={3} />
      </form>,
    );
    expect(ref.current).toBe(cells()[0]);
    fireEvent.change(cells()[0], { target: { value: "9" } });
    expect(cells()[0]).toHaveValue("9");
    fireEvent.reset(screen.getByRole("form"));
    await waitFor(() => expect(cells()[0]).toHaveValue("1"));
  });
});

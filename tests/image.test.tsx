import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import * as mt from "../packages/mtone/src";

describe("Image", () => {
  it("exports image components", () => {
    expect(mt.Image).toBeDefined();
    expect(mt.ImagePreview).toBeDefined();
    expect(mt.ImageGroup).toBeDefined();
  });
  it("loads and falls back only once, then recovers on source change", () => {
    const { container, rerender } = render(
      <mt.Image src="one" alt="Photo" fallback="backup" preview={false} />,
    );
    const img = screen.getByAltText("Photo");
    expect(container.querySelector('[data-state="loading"]')).toBeTruthy();
    fireEvent.error(img);
    expect(screen.getByAltText("Photo")).toHaveAttribute("src", "backup");
    fireEvent.error(screen.getByAltText("Photo"));
    expect(screen.getByText("图片加载失败")).toBeVisible();
    rerender(<mt.Image src="two" alt="Photo" preview={false} />);
    fireEvent.load(screen.getByAltText("Photo"));
    expect(container.querySelector('[data-state="loaded"]')).toBeTruthy();
  });
  it("opens custom preview, transforms, closes and restores focus", async () => {
    render(<mt.Image src="thumb" previewSrc="large" alt="Mountain" />);
    const button = screen.getByRole("button", { name: "预览 Mountain" });
    button.focus();
    fireEvent.click(button);
    const dialog = await screen.findByRole("dialog");
    expect(dialog.querySelector("img")).toHaveAttribute("src", "large");
    fireEvent.click(screen.getByRole("button", { name: "放大" }));
    expect(dialog.querySelector(".mt-image-canvas img")).toHaveStyle({
      transform: "translate(0px, 0px) rotate(0deg) scale(1.5, 1.5)",
    });
    fireEvent.click(screen.getByRole("button", { name: "关闭预览" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(button).toHaveFocus());
  });
  it("honors disabled preview and controlled open", async () => {
    const change = vi.fn();
    const { rerender } = render(<mt.Image src="a" alt="A" preview={false} />);
    expect(screen.queryByRole("button")).toBeNull();
    rerender(<mt.Image src="a" alt="A" open={false} onOpenChange={change} />);
    fireEvent.click(screen.getByRole("button"));
    expect(change).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("groups select by thumbnail, switch and reset transformations", async () => {
    render(
      <mt.ImageGroup
        items={[
          { src: "a", alt: "A" },
          { src: "b", alt: "B" },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "预览 A" }));
    await screen.findByRole("dialog");
    fireEvent.click(screen.getByRole("button", { name: "放大" }));
    fireEvent.click(screen.getByRole("button", { name: "下一张" }));
    expect(screen.getByRole("dialog").querySelector("img")).toHaveAttribute(
      "src",
      "b",
    );
    expect(screen.getByText("2 / 2")).toBeVisible();
    expect(screen.getByRole("button", { name: "下一张" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("dialog").querySelector("img")).toHaveStyle({
      transform: "translate(0px, 0px) rotate(0deg) scale(1, 1)",
    });
  });
  it("empty group is safe", () => {
    render(<mt.ImageGroup items={[]} open />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("clamps invalid index and supports external preview", async () => {
    render(
      <mt.ImagePreview
        open
        current={999}
        items={[{ src: "a", alt: "A" }]}
        onOpenChange={() => {}}
      />,
    );
    expect(
      (await screen.findByRole("dialog")).querySelector("img"),
    ).toHaveAttribute("src", "a");
  });
});
describe("Image boundaries", () => {
  it("removes original srcSet when fallback is selected", () => {
    render(
      <mt.Image
        src="bad"
        srcSet="bad2 2x"
        fallback="good"
        alt="Fallback"
        preview={false}
      />,
    );
    fireEvent.error(screen.getByAltText("Fallback"));
    expect(screen.getByAltText("Fallback")).not.toHaveAttribute("srcset");
  });
  it("shows error for empty source", () => {
    render(<mt.Image src="" alt="Empty" preview={false} />);
    expect(screen.getByText("图片加载失败")).toBeVisible();
  });
  it("dismisses by empty canvas but not the displayed image", async () => {
    render(<mt.Image src="a" alt="A" />);
    fireEvent.click(screen.getByRole("button"));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(dialog.querySelector("img")!);
    expect(dialog).toBeVisible();
    fireEvent.click(dialog.querySelector(".mt-image-canvas")!);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
  it("switches with keyboard and supports controlled index", async () => {
    const fn = vi.fn();
    render(
      <mt.ImagePreview
        open
        current={0}
        onCurrentChange={fn}
        onOpenChange={() => {}}
        items={[{ src: "a" }, { src: "b" }]}
      />,
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(fn).toHaveBeenCalledWith(1);
    expect(dialog.querySelector("img")).toHaveAttribute("src", "a");
  });
  it("rotates, flips and resets", async () => {
    render(<mt.Image src="a" />);
    fireEvent.click(screen.getByRole("button"));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(screen.getByRole("button", { name: "旋转" }));
    fireEvent.click(screen.getByRole("button", { name: "水平翻转" }));
    expect(dialog.querySelector("img")).toHaveStyle({
      transform: "translate(0px, 0px) rotate(90deg) scale(-1, 1)",
    });
    fireEvent.click(screen.getByRole("button", { name: "重置" }));
    expect(dialog.querySelector("img")).toHaveStyle({
      transform: "translate(0px, 0px) rotate(0deg) scale(1, 1)",
    });
  });
});
it("keeps toolbar DOM and focus on switching images", async () => {
  render(<mt.ImageGroup items={[{ src: "a" }, { src: "b" }, { src: "c" }]} />);
  fireEvent.click(screen.getByRole("button", { name: "预览 1" }));
  await screen.findByRole("dialog");
  const next = screen.getByRole("button", { name: "下一张" });
  next.focus();
  fireEvent.click(next);
  expect(screen.getByRole("button", { name: "下一张" })).toBe(next);
  expect(next).toHaveFocus();
});
it("keeps boundary navigation focusable without advancing", async () => {
  const current = vi.fn();
  render(
    <mt.ImageGroup
      items={[{ src: "a" }, { src: "b" }]}
      onCurrentChange={current}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "预览 1" }));
  await screen.findByRole("dialog");
  const next = screen.getByRole("button", { name: "下一张" });
  next.focus();
  fireEvent.click(next);
  expect(next).toHaveFocus();
  expect(next).toHaveAttribute("aria-disabled", "true");
  current.mockClear();
  fireEvent.click(next);
  expect(current).not.toHaveBeenCalled();
  fireEvent.keyDown(next, { key: "ArrowLeft" });
  expect(screen.getByRole("dialog").querySelector("img")).toHaveAttribute(
    "src",
    "a",
  );
});
it("disallows canvas dismissal when configured", async () => {
  const fn = vi.fn();
  render(
    <mt.ImagePreview
      open
      onOpenChange={fn}
      closeOnBackdrop={false}
      items={[{ src: "a" }]}
    />,
  );
  const dialog = await screen.findByRole("dialog");
  fireEvent.click(dialog.querySelector(".mt-image-canvas")!);
  expect(fn).not.toHaveBeenCalled();
});
it("uses surface tokens for placeholder backgrounds", async () => {
  const { readFileSync } = await import("node:fs");
  const css = readFileSync("packages/mtone/src/image.css", "utf8");
  expect(css).not.toMatch(/background:\s*var\(--mt-muted/);
  expect(css).toContain("background: var(--mt-subtle");
  expect(css).toContain("color: var(--mt-muted");
});

import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { AppShowcase } from "../apps/docs/app-showcase";
import { MtoneProvider } from "../packages/mtone/src/basic";
function setup() { render(<MtoneProvider><AppShowcase /></MtoneProvider>); return userEvent.setup(); }
describe("application showcase", () => {
  it("filters real documents and recovers from empty search", async () => {
    const user = setup();
    await user.type(screen.getByRole("textbox", { name: "搜索知识库" }), "no-match-123");
    expect(screen.queryByRole("button", { name: "编辑文档：设计原则" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "重置筛选" }));
    expect(screen.getByRole("button", { name: "编辑文档：设计原则" })).toBeVisible();
  });
  it("creates, edits, favorites and deletes a real local document", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "新建文档" }));
    let dialog = screen.getByRole("dialog", { name: "新建文档" });
    await user.type(within(dialog).getByLabelText(/文档标题/), "本地测试文档");
    await user.type(within(dialog).getByLabelText("正文"), "真实的编辑内容");
    await user.click(within(dialog).getByRole("button", { name: "保存文档" }));
    await user.click(screen.getByRole("button", { name: "编辑文档：本地测试文档" }));
    dialog = screen.getByRole("dialog", { name: "编辑文档" });
    expect(within(dialog).getByLabelText("正文")).toHaveValue("真实的编辑内容");
    await user.clear(within(dialog).getByLabelText(/文档标题/));
    await user.type(within(dialog).getByLabelText(/文档标题/), "更新的文档");
    await user.click(within(dialog).getByRole("button", { name: "保存文档" }));
    await user.click(screen.getByRole("button", { name: "收藏：更新的文档" }));
    expect(screen.getByRole("button", { name: "取消收藏：更新的文档" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "删除文档：更新的文档" }));
    const confirmation = screen.getByRole("alertdialog", { name: "删除文档" });
    await user.click(within(confirmation).getByRole("button", { name: "确认删除" }));
    expect(screen.queryByRole("button", { name: "编辑文档：更新的文档" })).toBeNull();
  });
  it("does not save canceled edits", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "编辑文档：设计原则" }));
    const dialog = screen.getByRole("dialog", { name: "编辑文档" });
    await user.clear(within(dialog).getByLabelText(/文档标题/));
    await user.type(within(dialog).getByLabelText(/文档标题/), "不要保存");
    await user.click(within(dialog).getByRole("button", { name: "取消" }));
    expect(screen.getByRole("button", { name: "编辑文档：设计原则" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "编辑文档：不要保存" })).toBeNull();
  });
  it("validates blank titles and leaves data untouched when deletion is canceled", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "新建文档" }));
    await user.click(screen.getByRole("button", { name: "保存文档" }));
    expect(screen.getByText("请填写文档标题")).toBeVisible();
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "取消" }));
    await user.click(screen.getByRole("button", { name: "删除文档：设计原则" }));
    await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "取消" }));
    expect(screen.getByRole("button", { name: "编辑文档：设计原则" })).toBeVisible();
  });
  it("applies category and favorite filters to the same data", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "我的收藏" }));
    expect(screen.getByRole("button", { name: "编辑文档：设计原则" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "编辑文档：项目启动清单" })).toBeNull();
    await user.click(within(screen.getByRole("group", { name: "按分类筛选" })).getByRole("button", { name: "研究" }));
    expect(screen.getByRole("button", { name: "编辑文档：用户访谈手册" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "编辑文档：设计原则" })).toBeNull();
  });

});

import React from "react";
import { createRoot } from "react-dom/client";
import { Dialog, ConfirmDialog, Drawer } from "../../packages/mtone/src/interactive";
import { MtoneProvider, Button, Input, FormField } from "../../packages/mtone/src/basic";
import "../../packages/mtone/dist/styles.css";
const params = new URLSearchParams(location.search);
const mode = params.get("mode");
const title = mode === "empty" ? null : mode === "long" ? "这是一段跨越多行的知识库标题，需要保持与关闭按钮居中对齐，并且不能互相覆盖" : "新建知识库";
const footer = mode === "empty" ? null : <><Button>{mode === "wrap" ? "取消并保留当前所有未保存的编辑" : "取消"}</Button><Button variant="solid">{mode === "wrap" ? "确认创建并继续编辑当前知识库" : "创建"}</Button></>;
createRoot(document.getElementById("root")!).render(
  <MtoneProvider density={params.get("density") === "comfortable" ? "comfortable" : "compact"}>
    {mode === "confirm" ? <ConfirmDialog defaultOpen title="确认操作" description="保持已有样式" /> : mode === "drawer" ? <Drawer defaultOpen title="抽屉" footer={footer}>内容</Drawer> :
    <Dialog closeOnOutsideClick={params.get("outside") === "default" ? undefined : params.get("outside") !== "false"} defaultOpen title={title} description={mode === "empty" ? undefined : "为你的内容创建一个新的空间。"} footer={footer}>
      <FormField label="名称"><Input placeholder="输入知识库名称" /></FormField>
    </Dialog>}
  </MtoneProvider>,
);

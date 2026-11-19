import React from "react";
import { Input } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <Input.Search
      aria-label="加载中的搜索"
      placeholder="正在搜索"
      loading
      searchButton="搜索"
    />
  );
}

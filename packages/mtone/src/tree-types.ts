import type * as React from "react";

export type TreeKey = string | number;
/** Legacy items retain id/label; normalized treeData uses the same shape. */
export type TreeItem = {
  id: TreeKey;
  label: React.ReactNode;
  children?: TreeItem[];
  disabled?: boolean;
  disableCheckbox?: boolean;
  checkable?: boolean;
  selectable?: boolean;
  isLeaf?: boolean;
  icon?: React.ReactNode | ((node: TreeItem) => React.ReactNode);
  [field: string]: unknown;
};
/** Data-node form; custom field mappings can also be supplied. */
export type TreeNode = {
  key: TreeKey;
  title?: React.ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
  disableCheckbox?: boolean;
  checkable?: boolean;
  selectable?: boolean;
  isLeaf?: boolean;
  icon?: React.ReactNode | ((node: TreeItem) => React.ReactNode);
  [field: string]: unknown;
};
export type TreeFieldNames = {
  key?: string;
  title?: string;
  children?: string;
};
export type TreeEntity = {
  item: TreeItem;
  parent?: TreeKey;
  level: number;
  pos: string;
  setSize: number;
  posInSet: number;
};
export type TreeCheckState = { checked: TreeKey[]; halfChecked: TreeKey[] };

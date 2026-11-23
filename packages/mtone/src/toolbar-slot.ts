import * as React from "react";

/** Avoid an empty framed seam for statically empty Toolbar slots. */
export function hasToolbarContent(node: React.ReactNode): boolean {
  if (node == null || typeof node === "boolean") return false;
  if (typeof node === "string") return node.trim().length > 0;
  if (Array.isArray(node)) return node.some(hasToolbarContent);
  if (
    React.isValidElement<{ children?: React.ReactNode }>(node) &&
    node.type === React.Fragment
  ) {
    return hasToolbarContent(node.props.children);
  }
  return true;
}

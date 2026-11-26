import type {
  TreeCheckState,
  TreeEntity,
  TreeFieldNames,
  TreeItem,
  TreeKey,
} from "./tree-types";

/** Clone into the legacy shape without mutating callers' data. Keys are globally unique. */
export function normalizeTree(
  items?: TreeItem[],
  treeData?: Record<string, unknown>[],
  fieldNames: TreeFieldNames = {},
): TreeItem[] {
  const seen = new Set<TreeKey>();
  const mapped = treeData !== undefined;
  const keyField = fieldNames.key ?? (mapped ? "key" : "id");
  const titleField = fieldNames.title ?? (mapped ? "title" : "label");
  const childField = fieldNames.children ?? "children";
  const visit = (list: Record<string, unknown>[]): TreeItem[] =>
    list.map((raw) => {
      const id = raw[keyField];
      if (
        (typeof id !== "string" && typeof id !== "number") ||
        (typeof id === "number" && !Number.isFinite(id))
      )
        throw new Error("Tree nodes require a finite number or string key");
      if (seen.has(id)) throw new Error(`Tree node keys must be unique: ${id}`);
      seen.add(id);
      const children = raw[childField];
      return {
        ...raw,
        id,
        label: raw[titleField] as TreeItem["label"],
        children: Array.isArray(children) ? visit(children) : undefined,
      } as TreeItem;
    });
  return visit((treeData ?? items ?? []) as Record<string, unknown>[]);
}

export function buildTreeIndex(items: TreeItem[]): Map<TreeKey, TreeEntity> {
  const index = new Map<TreeKey, TreeEntity>();
  const visit = (
    list: TreeItem[],
    level: number,
    parent?: TreeKey,
    prefix = "0",
  ) =>
    list.forEach((item, i) => {
      const pos = `${prefix}-${i}`;
      index.set(item.id, {
        item,
        parent,
        level,
        pos,
        setSize: list.length,
        posInSet: i + 1,
      });
      visit(item.children ?? [], level + 1, item.id, pos);
    });
  visit(items, 1);
  return index;
}

export function flattenTree(
  items: TreeItem[],
  expanded: Set<TreeKey>,
): TreeEntity[] {
  const visible: TreeEntity[] = [];
  const visit = (
    list: TreeItem[],
    level: number,
    parent?: TreeKey,
    prefix = "0",
  ) =>
    list.forEach((item, i) => {
      const pos = `${prefix}-${i}`;
      visible.push({
        item,
        parent,
        level,
        pos,
        setSize: list.length,
        posInSet: i + 1,
      });
      if (expanded.has(item.id))
        visit(item.children ?? [], level + 1, item.id, pos);
    });
  visit(items, 1);
  return visible;
}

export function getTreePath(
  index: Map<TreeKey, TreeEntity>,
  key: TreeKey,
): TreeKey[] {
  const path: TreeKey[] = [];
  let entity = index.get(key);
  while (entity) {
    path.unshift(entity.item.id);
    entity = entity.parent === undefined ? undefined : index.get(entity.parent);
  }
  return path;
}

export function expandTreeParents(
  index: Map<TreeKey, TreeEntity>,
  keys: TreeKey[],
): TreeKey[] {
  const result = new Set(keys);
  keys.forEach((key) =>
    getTreePath(index, key)
      .slice(0, -1)
      .forEach((parent) => result.add(parent)),
  );
  return [...result];
}

export function treeCheckDisabled(item: TreeItem): boolean {
  return !!item.disabled || !!item.disableCheckbox || item.checkable === false;
}

/** Conduction cannot cross disabled or non-checkable nodes, in either direction. */
export function conductTreeChecks(
  items: TreeItem[],
  keys: TreeKey[],
): TreeCheckState {
  const index = buildTreeIndex(items);
  const checked = new Set(keys.filter((key) => index.has(key)));
  const halfChecked = new Set<TreeKey>();
  const down = (item: TreeItem) => {
    if (treeCheckDisabled(item)) return;
    checked.add(item.id);
    item.children?.forEach(down);
  };
  [...checked].forEach((key) => down(index.get(key)!.item));
  const up = (item: TreeItem) => {
    item.children?.forEach(up);
    if (treeCheckDisabled(item)) return;
    const eligible = (item.children ?? []).filter(
      (child) => !treeCheckDisabled(child),
    );
    if (!eligible.length) return;
    if (eligible.every((child) => checked.has(child.id))) checked.add(item.id);
    else {
      checked.delete(item.id);
      if (
        eligible.some(
          (child) => checked.has(child.id) || halfChecked.has(child.id),
        )
      )
        halfChecked.add(item.id);
    }
  };
  items.forEach(up);
  return {
    checked: [...index.keys()].filter((key) => checked.has(key)),
    halfChecked: [...index.keys()].filter((key) => halfChecked.has(key)),
  };
}

export function toggleTreeCheck(
  items: TreeItem[],
  keys: TreeKey[],
  key: TreeKey,
  next: boolean,
): TreeCheckState {
  const index = buildTreeIndex(items);
  const entity = index.get(key);
  const normalized = conductTreeChecks(items, keys);
  if (!entity || treeCheckDisabled(entity.item)) return normalized;
  const checked = new Set(normalized.checked);
  if (next) checked.add(key);
  else {
    const clear = (item: TreeItem) => {
      if (treeCheckDisabled(item)) return;
      checked.delete(item.id);
      item.children?.forEach(clear);
    };
    clear(entity.item);
    let parent =
      entity.parent === undefined ? undefined : index.get(entity.parent);
    while (parent && !treeCheckDisabled(parent.item)) {
      checked.delete(parent.item.id);
      parent =
        parent.parent === undefined ? undefined : index.get(parent.parent);
    }
  }
  return conductTreeChecks(items, [...checked]);
}

/**
 * Apply a Tree drop to an items array without mutating it. The insertion index
 * is relative to the destination list after the source has been removed.
 * Invalid or unchanged moves return the original array.
 */
export function moveTreeItem(
  items: TreeItem[],
  info: {
    dragNode: Pick<TreeItem, "id">;
    targetParentKey: TreeKey | null;
    targetIndex: number;
  },
): TreeItem[] {
  const { dragNode, targetParentKey, targetIndex } = info;
  if (!Number.isInteger(targetIndex) || targetIndex < 0) return items;

  const index = buildTreeIndex(items);
  const source = index.get(dragNode.id);
  const target =
    targetParentKey === null ? undefined : index.get(targetParentKey);
  if (!source || (targetParentKey !== null && (!target || target.item.isLeaf)))
    return items;
  const path =
    targetParentKey === null ? [] : getTreePath(index, targetParentKey);
  if (path.includes(source.item.id)) return items;

  const sameParent = (source.parent ?? null) === targetParentKey;
  const count = target ? (target.item.children?.length ?? 0) : items.length;
  const sourceIndex = source.posInSet - 1;
  if (
    targetIndex > count - Number(sameParent) ||
    (sameParent && targetIndex === sourceIndex)
  )
    return items;

  // Each shallow copy touches only the affected list and its ancestor paths.
  const edit = (
    list: TreeItem[],
    ancestors: TreeKey[],
    update: (siblings: TreeItem[]) => void,
    depth = 0,
  ): TreeItem[] => {
    const next = list.slice();
    if (depth === ancestors.length) {
      update(next);
    } else {
      const at = list.findIndex((node) => node.id === ancestors[depth]);
      const parent = list[at];
      next[at] = {
        ...parent,
        children: edit(parent.children ?? [], ancestors, update, depth + 1),
      };
    }
    return next;
  };
  const insert = (siblings: TreeItem[]) => {
    siblings.splice(targetIndex, 0, source.item);
  };

  if (sameParent)
    return edit(items, path, (siblings) => {
      siblings.splice(sourceIndex, 1);
      insert(siblings);
    });

  const sourcePath = getTreePath(index, source.item.id).slice(0, -1);
  const detached = edit(items, sourcePath, (siblings) => {
    siblings.splice(sourceIndex, 1);
  });
  return edit(detached, path, insert);
}

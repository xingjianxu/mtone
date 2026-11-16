import type { TableColumn, TableFilters, SortOrder } from "./table-types";
export type SortState = { key: string; order: Exclude<SortOrder, null> };
export const getColumnKey = <T>(c: TableColumn<T>, index: number): string =>
  String(
    c.key ??
      (Array.isArray(c.dataIndex) ? c.dataIndex.join(".") : c.dataIndex) ??
      index,
  );
export const getValue = <T>(row: T, c: TableColumn<T>): unknown => {
  const path = c.dataIndex ?? c.key;
  return (Array.isArray(path) ? path : [path]).reduce<any>(
    (v, k) => v?.[k as any],
    row,
  );
};
export function flattenColumns<T>(columns: TableColumn<T>[]): TableColumn<T>[] {
  return columns.flatMap((c) =>
    c.children ? flattenColumns(c.children) : [c],
  );
}
export function processTableData<T>(
  data: T[],
  columns: TableColumn<T>[],
  sorts: SortState[],
  filters: TableFilters,
  textFilters: Record<string, string>,
  manual: boolean,
  childrenName = "children",
): T[] {
  if (manual) return data;
  const leaves = flattenColumns(columns);
  const indexed = leaves.map((c, i) => ({ c, key: getColumnKey(c, i) }));
  const active = sorts
    .map((s) => ({ ...s, c: indexed.find((x) => x.key === s.key)?.c }))
    .filter((s) => s.c)
    .sort(
      (a, b) =>
        ((typeof b.c!.sorter === "object" ? b.c!.sorter.multiple : 0) ?? 0) -
        ((typeof a.c!.sorter === "object" ? a.c!.sorter.multiple : 0) ?? 0),
    );
  const walk = (rows: T[]): T[] =>
    rows
      .filter((row) =>
        indexed.every(({ c, key }) => {
          const text = textFilters[key];
          if (
            text &&
            !String(getValue(row, c) ?? "")
              .toLocaleLowerCase()
              .includes(text.toLocaleLowerCase())
          )
            return false;
          const values = filters[key];
          return (
            !values?.length ||
            !c.onFilter ||
            values.some((v) => c.onFilter!(v, row))
          );
        }),
      )
      .map((row) => {
        const children = (row as any)?.[childrenName];
        return Array.isArray(children)
          ? { ...row, [childrenName]: walk(children) }
          : row;
      })
      .sort((a, b) => {
        for (const { c, order } of active) {
          const compare =
            typeof c!.sorter === "function"
              ? c!.sorter
              : typeof c!.sorter === "object"
                ? c!.sorter.compare
                : undefined;
          let value = 0;
          if (compare) value = compare(a, b, order);
          else if (c!.sortable) {
            const x = getValue(a, c!),
              y = getValue(b, c!);
            value =
              typeof x === "number" && typeof y === "number"
                ? x - y
                : String(x ?? "").localeCompare(String(y ?? ""));
          }
          if (value) return order === "ascend" ? value : -value;
        }
        return 0;
      });
  return walk(data);
}

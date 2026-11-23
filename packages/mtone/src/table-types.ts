import type * as React from "react";
import type {
  TableProps as RcTableProps,
  ColumnType as RcColumn,
  ExpandableConfig,
  Reference,
} from "@rc-component/table";
export type DataTableRef = Reference;
export type DataTableSortOrder = "ascend" | "descend" | null;
export type DataTableFilterValue = React.Key | boolean;
export type DataTableFilters = Record<string, DataTableFilterValue[] | null>;
export type DataTableState = {
  sort?: { key: string; direction: "asc" | "desc" } | null;
  filters: Record<string, string>;
  page: number;
  pageSize: number;
};
export type DataTableFilterItem = {
  text: React.ReactNode;
  value: DataTableFilterValue;
  children?: DataTableFilterItem[];
};
export type DataTableFilterDropdownProps = {
  prefixCls: string;
  selectedKeys: DataTableFilterValue[];
  setSelectedKeys: (keys: DataTableFilterValue[]) => void;
  confirm: (options?: { closeDropdown?: boolean }) => void;
  clearFilters: (options?: {
    confirm?: boolean;
    closeDropdown?: boolean;
  }) => void;
  close: () => void;
  filters?: DataTableFilterItem[];
  visible: boolean;
};
export type DataTableSortResult<T> = {
  column?: DataTableColumn<T>;
  order?: DataTableSortOrder;
  field?: DataTableColumn<T>["dataIndex"];
  columnKey?: React.Key;
};
export type DataTableColumnTitleProps<T> = {
  sortColumns: { column: DataTableColumn<T>; order: DataTableSortOrder }[];
  filters: DataTableFilters;
};
export type DataTableColumn<T> = Omit<RcColumn<T>, "title" | "dataIndex"> & {
  dataIndex?: keyof T | string | number | (string | number)[];
  title?:
    React.ReactNode | ((props: DataTableColumnTitleProps<T>) => React.ReactNode);
  children?: DataTableColumn<T>[];
  sortable?: boolean;
  filterable?: boolean;
  sorter?:
    | boolean
    | ((a: T, b: T, order?: DataTableSortOrder) => number)
    | {
        compare?: (a: T, b: T, order?: DataTableSortOrder) => number;
        multiple?: number;
      };
  sortOrder?: DataTableSortOrder;
  defaultSortOrder?: DataTableSortOrder;
  sortDirections?: Exclude<DataTableSortOrder, null>[];
  sortIcon?: (props: { sortOrder: DataTableSortOrder }) => React.ReactNode;
  showSorterTooltip?:
    | boolean
    | { title?: React.ReactNode; target?: "full-header" | "sorter-icon" };
  filters?: DataTableFilterItem[];
  filteredValue?: DataTableFilterValue[] | null;
  defaultFilteredValue?: DataTableFilterValue[] | null;
  filtered?: boolean;
  filterMultiple?: boolean;
  filterMode?: "menu" | "tree";
  filterSearch?: boolean | ((input: string, item: DataTableFilterItem) => boolean);
  filterResetToDefaultFilteredValue?: boolean;
  filterOnClose?: boolean;
  filterDropdown?:
    React.ReactNode | ((props: DataTableFilterDropdownProps) => React.ReactNode);
  filterIcon?: React.ReactNode | ((filtered: boolean) => React.ReactNode);
  filterDropdownProps?: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
    style?: React.CSSProperties;
  };
  onFilter?: (value: DataTableFilterValue, record: T) => boolean;
  responsive?: ("xs" | "sm" | "md" | "lg" | "xl" | "xxl")[];
};
export type DataTableColumnsType<T> = DataTableColumn<T>[];
export type DataTableSelectionType =
  "all" | "none" | "invert" | "single" | "multiple";
export type DataTableRowSelection<T> = {
  type?: "checkbox" | "radio";
  selectedRowKeys?: React.Key[];
  defaultSelectedRowKeys?: React.Key[];
  onChange?: (
    keys: React.Key[],
    rows: T[],
    info: { type: DataTableSelectionType },
  ) => void;
  onSelect?: (record: T, selected: boolean, rows: T[], event: Event) => void;
  onSelectAll?: (selected: boolean, rows: T[], changeRows: T[]) => void;
  onSelectInvert?: (keys: React.Key[]) => void;
  onSelectNone?: () => void;
  onSelectMultiple?: (selected: boolean, rows: T[], changeRows: T[]) => void;
  getCheckboxProps?: (
    record: T,
  ) => Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "checked" | "defaultChecked"
  >;
  getTitleCheckboxProps?: () => Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "checked" | "defaultChecked"
  >;
  checkStrictly?: boolean;
  preserveSelectedRowKeys?: boolean;
  hideSelectAll?: boolean;
  columnTitle?:
    React.ReactNode | ((original: React.ReactNode) => React.ReactNode);
  columnWidth?: number | string;
  align?: "left" | "right" | "center";
  fixed?: boolean;
  renderCell?: (
    checked: boolean,
    record: T,
    index: number,
    origin: React.ReactNode,
  ) => React.ReactNode;
  onCell?: RcColumn<T>["onCell"];
  selections?:
    | boolean
    | (
        | "all"
        | "none"
        | "invert"
        | {
            key: string;
            text: React.ReactNode;
            onSelect: (keys: React.Key[]) => void;
          }
      )[];
};
export type DataTablePagination = {
  page?: number;
  current?: number;
  defaultCurrent?: number;
  pageSize?: number;
  defaultPageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onChange?: (page: number, size: number) => void;
  onShowSizeChange?: (page: number, size: number) => void;
  showSizeChanger?: boolean;
  pageSizeOptions?: (number | string)[];
  showQuickJumper?: boolean;
  hideOnSinglePage?: boolean;
  simple?: boolean;
  disabled?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  itemRender?: (
    page: number,
    type: "page" | "prev" | "next",
    original: React.ReactNode,
  ) => React.ReactNode;
  position?: (
    | "topLeft"
    | "topCenter"
    | "topRight"
    | "bottomLeft"
    | "bottomCenter"
    | "bottomRight"
    | "none"
  )[];
  placement?: (
    | "topStart"
    | "topCenter"
    | "topEnd"
    | "bottomStart"
    | "bottomCenter"
    | "bottomEnd"
    | "none"
  )[];
  className?: string;
  style?: React.CSSProperties;
};
export type DataTableLocale = {
  emptyText?: React.ReactNode;
  filterTitle?: string;
  filterConfirm?: string;
  filterReset?: string;
  filterSearchPlaceholder?: string;
  selectAll?: string;
  selectInvert?: string;
  selectNone?: string;
  selectionAll?: string;
  selectRow?: string | ((key: React.Key) => string);
  selectionActions?: string;
  selectionPlaceholder?: string;
  sortTitle?: string;
  triggerAsc?: string;
  triggerDesc?: string;
  cancelSort?: string;
  expand?: string;
  collapse?: string;
};
type RcSemantics = NonNullable<RcTableProps["classNames"]>;
type RcStyles = NonNullable<RcTableProps["styles"]>;
export type DataTableClassNames = RcSemantics & {
  root?: string;
  pagination?: string;
};
export type DataTableStyles = RcStyles & {
  root?: React.CSSProperties;
  pagination?: React.CSSProperties;
};
export type DataTableProps<T> = Omit<
  RcTableProps<T>,
  | "data"
  | "columns"
  | "children"
  | "onChange"
  | "scroll"
  | "classNames"
  | "styles"
  | "emptyText"
> & {
  data?: T[];
  dataSource?: T[];
  columns?: DataTableColumn<T>[];
  children?: React.ReactNode;
  column?: Partial<DataTableColumn<T>>;
  manual?: boolean;
  loading?:
    | boolean
    | {
        spinning?: boolean;
        tip?: React.ReactNode;
        delay?: number;
        indicator?: React.ReactNode;
      };
  onChange?: (state: DataTableState) => void;
  onTableChange?: (
    pagination: DataTablePagination,
    filters: DataTableFilters,
    sorter: DataTableSortResult<T> | DataTableSortResult<T>[],
    extra: { currentDataSource: T[]; action: "paginate" | "sort" | "filter" },
  ) => void;
  sort?: DataTableState["sort"];
  filters?: Record<string, string>;
  selectable?: boolean;
  selectedKeys?: React.Key[];
  onSelectionChange?: (keys: React.Key[]) => void;
  rowSelection?: DataTableRowSelection<T>;
  pagination?: false | DataTablePagination;
  /** Toolbar inside the table frame, before top pagination and rows. */
  toolbar?: React.ReactNode;
  empty?: React.ReactNode;
  locale?: DataTableLocale;
  size?: "small" | "middle" | "medium" | "large";
  bordered?: boolean;
  sortDirections?: Exclude<DataTableSortOrder, null>[];
  showSorterTooltip?: DataTableColumn<T>["showSorterTooltip"];
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement;
  scroll?: NonNullable<RcTableProps<T>["scroll"]> & {
    scrollToFirstRowOnChange?: boolean;
  };
  virtual?: boolean;
  virtualItemHeight?: number;
  classNames?:
    DataTableClassNames | ((info: { props: DataTableProps<T> }) => DataTableClassNames);
  styles?: DataTableStyles | ((info: { props: DataTableProps<T> }) => DataTableStyles);
};
export type DataTableExpandableConfig<T> = ExpandableConfig<T>;

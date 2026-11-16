import type * as React from "react";
import type {
  TableProps as RcTableProps,
  ColumnType as RcColumn,
  ExpandableConfig,
  Reference,
} from "@rc-component/table";
export type TableRef = Reference;
export type SortOrder = "ascend" | "descend" | null;
export type TableFilterValue = React.Key | boolean;
export type TableFilters = Record<string, TableFilterValue[] | null>;
export type TableState = {
  sort?: { key: string; direction: "asc" | "desc" } | null;
  filters: Record<string, string>;
  page: number;
  pageSize: number;
};
export type TableFilterItem = {
  text: React.ReactNode;
  value: TableFilterValue;
  children?: TableFilterItem[];
};
export type TableFilterDropdownProps = {
  prefixCls: string;
  selectedKeys: TableFilterValue[];
  setSelectedKeys: (keys: TableFilterValue[]) => void;
  confirm: (options?: { closeDropdown?: boolean }) => void;
  clearFilters: (options?: {
    confirm?: boolean;
    closeDropdown?: boolean;
  }) => void;
  close: () => void;
  filters?: TableFilterItem[];
  visible: boolean;
};
export type TableSortResult<T> = {
  column?: TableColumn<T>;
  order?: SortOrder;
  field?: TableColumn<T>["dataIndex"];
  columnKey?: React.Key;
};
export type TableColumnTitleProps<T> = {
  sortColumns: { column: TableColumn<T>; order: SortOrder }[];
  filters: TableFilters;
};
export type TableColumn<T> = Omit<RcColumn<T>, "title" | "dataIndex"> & {
  dataIndex?: keyof T | string | number | (string | number)[];
  title?:
    React.ReactNode | ((props: TableColumnTitleProps<T>) => React.ReactNode);
  children?: TableColumn<T>[];
  sortable?: boolean;
  filterable?: boolean;
  sorter?:
    | boolean
    | ((a: T, b: T, order?: SortOrder) => number)
    | {
        compare?: (a: T, b: T, order?: SortOrder) => number;
        multiple?: number;
      };
  sortOrder?: SortOrder;
  defaultSortOrder?: SortOrder;
  sortDirections?: Exclude<SortOrder, null>[];
  sortIcon?: (props: { sortOrder: SortOrder }) => React.ReactNode;
  showSorterTooltip?:
    | boolean
    | { title?: React.ReactNode; target?: "full-header" | "sorter-icon" };
  filters?: TableFilterItem[];
  filteredValue?: TableFilterValue[] | null;
  defaultFilteredValue?: TableFilterValue[] | null;
  filtered?: boolean;
  filterMultiple?: boolean;
  filterMode?: "menu" | "tree";
  filterSearch?: boolean | ((input: string, item: TableFilterItem) => boolean);
  filterResetToDefaultFilteredValue?: boolean;
  filterOnClose?: boolean;
  filterDropdown?:
    React.ReactNode | ((props: TableFilterDropdownProps) => React.ReactNode);
  filterIcon?: React.ReactNode | ((filtered: boolean) => React.ReactNode);
  filterDropdownProps?: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
    style?: React.CSSProperties;
  };
  onFilter?: (value: TableFilterValue, record: T) => boolean;
  responsive?: ("xs" | "sm" | "md" | "lg" | "xl" | "xxl")[];
};
export type TableColumnsType<T> = TableColumn<T>[];
export type TableSelectionType =
  "all" | "none" | "invert" | "single" | "multiple";
export type TableRowSelection<T> = {
  type?: "checkbox" | "radio";
  selectedRowKeys?: React.Key[];
  defaultSelectedRowKeys?: React.Key[];
  onChange?: (
    keys: React.Key[],
    rows: T[],
    info: { type: TableSelectionType },
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
export type TablePagination = {
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
export type TableLocale = {
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
export type TableClassNames = RcSemantics & {
  root?: string;
  pagination?: string;
};
export type TableStyles = RcStyles & {
  root?: React.CSSProperties;
  pagination?: React.CSSProperties;
};
export type TableProps<T> = Omit<
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
  columns?: TableColumn<T>[];
  children?: React.ReactNode;
  column?: Partial<TableColumn<T>>;
  manual?: boolean;
  loading?:
    | boolean
    | {
        spinning?: boolean;
        tip?: React.ReactNode;
        delay?: number;
        indicator?: React.ReactNode;
      };
  onChange?: (state: TableState) => void;
  onTableChange?: (
    pagination: TablePagination,
    filters: TableFilters,
    sorter: TableSortResult<T> | TableSortResult<T>[],
    extra: { currentDataSource: T[]; action: "paginate" | "sort" | "filter" },
  ) => void;
  sort?: TableState["sort"];
  filters?: Record<string, string>;
  selectable?: boolean;
  selectedKeys?: React.Key[];
  onSelectionChange?: (keys: React.Key[]) => void;
  rowSelection?: TableRowSelection<T>;
  pagination?: false | TablePagination;
  empty?: React.ReactNode;
  locale?: TableLocale;
  size?: "small" | "middle" | "medium" | "large";
  bordered?: boolean;
  sortDirections?: Exclude<SortOrder, null>[];
  showSorterTooltip?: TableColumn<T>["showSorterTooltip"];
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement;
  scroll?: NonNullable<RcTableProps<T>["scroll"]> & {
    scrollToFirstRowOnChange?: boolean;
  };
  virtual?: boolean;
  virtualItemHeight?: number;
  classNames?:
    TableClassNames | ((info: { props: TableProps<T> }) => TableClassNames);
  styles?: TableStyles | ((info: { props: TableProps<T> }) => TableStyles);
};
export type TableExpandableConfig<T> = ExpandableConfig<T>;

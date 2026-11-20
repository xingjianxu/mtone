import * as React from "react";
import { cn } from "./basic";

export type CardGroupBreakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
export type CardGroupResponsive =
  number | Partial<Record<CardGroupBreakpoint, number>>;
export interface CardGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "horizontal" | "vertical";
  columns?: CardGroupResponsive;
  gap?: CardGroupResponsive;
  divided?: boolean;
}
export interface CardGroupItemProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: CardGroupResponsive;
}
const breakpoints: CardGroupBreakpoint[] = [
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "xxl",
];
const defaults = { xs: 1, sm: 2, lg: 3 };
const ItemLayout = React.createContext<React.CSSProperties>({});
function values(
  value: CardGroupResponsive,
  fallback: number,
  integer: boolean,
) {
  let previous = fallback;
  return breakpoints.map((key) => {
    const next = typeof value === "number" ? value : value[key];
    if (
      next !== undefined &&
      Number.isFinite(next) &&
      next >= (integer ? 1 : 0)
    ) {
      previous = integer ? Math.min(24, Math.floor(next)) : next;
    }
    return previous;
  });
}
function CardGroupItem({
  span: _span,
  className,
  style,
  ...props
}: CardGroupItemProps) {
  const layout = React.useContext(ItemLayout);
  return (
    <div
      {...props}
      className={cn("mt-card-group-item", className)}
      style={{ ...layout, ...style }}
    />
  );
}
function flatten(children: React.ReactNode, prefix = ""): React.ReactNode[] {
  return React.Children.toArray(children).flatMap((child, index) => {
    const key = `${prefix}/${React.isValidElement(child) ? (child.key ?? index) : index}`;
    if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
      return child.type === React.Fragment
        ? flatten(child.props.children, key)
        : [React.cloneElement(child, { key })];
    }
    return [child];
  });
}
function CardGroupRoot({
  direction = "horizontal",
  columns = defaults,
  gap = 12,
  divided = false,
  children,
  className,
  style,
  ...props
}: CardGroupProps) {
  const count =
    direction === "vertical"
      ? breakpoints.map(() => 1)
      : values(columns, 1, true);
  const gaps = values(gap, 12, false);
  const rootStyle: Record<string, string | number> = {};
  breakpoints.forEach((key, i) => {
    rootStyle[`--mt-card-group-columns-${key}`] = count[i];
    rootStyle[`--mt-card-group-gap-${key}`] = `${gaps[i]}px`;
  });
  const cursors = breakpoints.map(() => ({ column: 0, row: 0 }));
  return (
    <div
      {...props}
      className={cn(
        "mt-card-group",
        divided && "mt-card-group-divided",
        className,
      )}
      style={{ ...rootStyle, ...style }}
    >
      {flatten(children).map((child, index) => {
        const explicit =
          React.isValidElement<CardGroupItemProps>(child) &&
          child.type === CardGroupItem;
        const item = explicit ? child : <CardGroupItem>{child}</CardGroupItem>;
        const spans = values(explicit ? (child.props.span ?? 1) : 1, 1, true);
        const layout: Record<string, string | number> = {};
        breakpoints.forEach((key, i) => {
          const span = Math.min(spans[i], count[i]),
            cursor = cursors[i];
          if (!item.props.hidden && cursor.column + span > count[i]) {
            cursor.row++;
            cursor.column = 0;
          }
          layout[`--mt-card-group-span-${key}`] = span;
          layout[`--mt-card-group-inline-${key}`] = Number(cursor.column > 0);
          layout[`--mt-card-group-block-${key}`] = Number(cursor.row > 0);
          if (!item.props.hidden) {
            cursor.column += span;
            if (cursor.column === count[i]) {
              cursor.column = 0;
              cursor.row++;
            }
          }
        });
        return (
          <ItemLayout.Provider
            key={React.isValidElement(child) ? (child.key ?? index) : index}
            value={layout as React.CSSProperties}
          >
            {item}
          </ItemLayout.Provider>
        );
      })}
    </div>
  );
}
export const CardGroup = Object.assign(CardGroupRoot, { Item: CardGroupItem });

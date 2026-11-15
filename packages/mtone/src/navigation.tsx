import * as React from "react";
import { ChevronRight, X } from "lucide-react";
import { cn, IconButton, useMtone } from "./basic";
export const Sidebar = ({
  className,
  ...p
}: React.HTMLAttributes<HTMLElement>) => (
  <aside {...p} className={cn("mt-sidebar", className)} />
);
export const NavItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    active?: boolean;
    icon?: React.ReactNode;
  }
>(function NavItem({ active, icon, children, className, ...p }, ref) {
  return (
    <button
      type="button"
      {...p}
      ref={ref}
      aria-current={active ? "page" : undefined}
      className={cn("mt-nav-item", active && "mt-active", className)}
    >
      {icon}
      {children}
    </button>
  );
});
export function NavGroup({
  label,
  children,
}: {
  label?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-nav-group">
      {label && <div className="mt-nav-label">{label}</div>}
      {children}
    </div>
  );
}
export function Breadcrumb({
  items,
  "aria-label": label = "Breadcrumb",
}: {
  items: { label: React.ReactNode; href?: string }[];
  "aria-label"?: string;
}) {
  return (
    <nav aria-label={label}>
      <ol className="mt-breadcrumb">
        {items.map((x, i) => (
          <li key={i}>
            {i > 0 && <ChevronRight size={12} />}
            {i === items.length - 1 ? (
              <span aria-current="page">{x.label}</span>
            ) : (
              <a href={x.href}>{x.label}</a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function FilterChip({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  const { locale } = useMtone();
  return (
    <span className="mt-filter-chip">
      {children}
      <IconButton
        size="sm"
        variant="ghost"
        aria-label={locale === "zh" ? "移除筛选" : "Remove filter"}
        onClick={onRemove}
      >
        <X size={12} />
      </IconButton>
    </span>
  );
}
export const FilterBar = ({
  className,
  ...p
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...p} className={cn("mt-filter-bar", className)} />
);

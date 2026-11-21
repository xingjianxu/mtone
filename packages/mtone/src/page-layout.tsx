import * as React from "react";

export interface PageLayoutProps
  extends Omit<React.ComponentPropsWithRef<"div">, "title"> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  description?: React.ReactNode;
  extra?: React.ReactNode;
  tabs?: React.ReactNode;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

function hasContent(node: React.ReactNode): boolean {
  if (node == null || typeof node === "boolean" || node === "") return false;
  if (Array.isArray(node)) return node.some(hasContent);
  if (React.isValidElement<{ children?: React.ReactNode }>(node) && node.type === React.Fragment) {
    return hasContent(node.props.children);
  }
  return true;
}

export function PageLayout({
  title, subtitle, icon, actions, description, extra, tabs, children,
  headingLevel = 1, className, ...rootProps
}: PageLayoutProps) {
  const Heading = `h${headingLevel}` as const;
  const showDescription = hasContent(description);
  const showExtra = hasContent(extra);
  return (
    <div {...rootProps} className={className ? `mt-page-layout ${className}` : "mt-page-layout"}>
      <div className="mt-page-layout-header">
        <div className="mt-page-layout-row">
          {hasContent(icon) && <div className="mt-page-layout-icon">{icon}</div>}
          <div className="mt-page-layout-heading">
            <Heading className="mt-page-layout-title">{title}</Heading>
            {hasContent(subtitle) && <div className="mt-page-layout-subtitle">{subtitle}</div>}
          </div>
          {hasContent(actions) && <div className="mt-page-layout-actions">{actions}</div>}
        </div>
        {(showDescription || showExtra) && (
          <div className="mt-page-layout-details">
            {showDescription && <div className="mt-page-layout-description">{description}</div>}
            {showExtra && <div className="mt-page-layout-extra">{extra}</div>}
          </div>
        )}
      </div>
      {hasContent(tabs) && <div className="mt-page-layout-tabs">{tabs}</div>}
      {hasContent(children) && <div className="mt-page-layout-body">{children}</div>}
    </div>
  );
}

import * as React from "react";
import { cn } from "./basic";

export type SectionGroupProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Show a separator between sections. */
  dividers?: boolean;
};

export type SectionGroupSectionProps = Omit<
  React.ComponentPropsWithoutRef<"section">,
  "title"
> & {
  title: React.ReactNode;
  actions?: React.ReactNode;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
};

function SectionGroupRoot({
  children,
  className,
  dividers = true,
  ...props
}: SectionGroupProps) {
  return (
    <div
      {...props}
      className={cn("mt-section-group", className)}
      data-no-dividers={!dividers || undefined}
    >
      {children}
    </div>
  );
}

function Section({
  title,
  actions,
  headingLevel = 3,
  children,
  className,
  ...props
}: SectionGroupSectionProps) {
  const titleId = React.useId();
  const Heading = `h${headingLevel}` as const;
  return (
    <section
      aria-labelledby={titleId}
      {...props}
      className={cn("mt-section-group-section", className)}
    >
      <div className="mt-section-group-header">
        <Heading id={titleId} className="mt-section-group-title">
          {title}
        </Heading>
        {React.Children.toArray(actions).length > 0 && (
          <div className="mt-section-group-actions">{actions}</div>
        )}
      </div>
      <div className="mt-section-group-content">{children}</div>
    </section>
  );
}

export const SectionGroup = Object.assign(SectionGroupRoot, { Section });

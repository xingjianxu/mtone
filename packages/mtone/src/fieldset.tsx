"use client";
import * as React from "react";
import { cn } from "./basic";
import {
  FieldsetDisabledContext,
  useFieldsetDisabled,
} from "./fieldset-context";
export interface FieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend?: React.ReactNode;
  variant?: "default" | "filled" | "unstyled";
  radius?: React.CSSProperties["borderRadius"];
}
/** Semantic grouping for related form controls. Not a form or validation boundary. */
export const Fieldset = React.forwardRef<HTMLFieldSetElement, FieldsetProps>(
  function Fieldset(
    {
      legend,
      variant = "default",
      radius,
      disabled,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) {
    const inheritedDisabled = React.useContext(FieldsetDisabledContext);
    const effectiveDisabled = useFieldsetDisabled(disabled);
    return (
      <fieldset
        {...props}
        ref={ref}
        disabled={effectiveDisabled}
        className={cn("mt-fieldset", `mt-fieldset-${variant}`, className)}
        style={{ borderRadius: radius, ...style }}
      >
        {legend != null && (
          <legend className="mt-fieldset-legend">
            {/* The first legend is exempt from its own fieldset, but not its ancestors. */}
            <FieldsetDisabledContext.Provider value={inheritedDisabled}>
              {legend}
            </FieldsetDisabledContext.Provider>
          </legend>
        )}
        <FieldsetDisabledContext.Provider value={effectiveDisabled}>
          {children}
        </FieldsetDisabledContext.Provider>
      </fieldset>
    );
  },
);

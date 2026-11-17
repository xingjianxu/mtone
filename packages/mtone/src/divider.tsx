import * as React from "react";

export interface DividerProps extends React.HTMLAttributes<HTMLElement> {
  orientation?: "horizontal" | "vertical";
  variant?: "solid" | "dashed" | "dotted";
  size?: "small" | "medium" | "large";
  titlePlacement?: "start" | "center" | "end";
  plain?: boolean;
  titleClassName?: string;
  titleStyle?: React.CSSProperties;
}

/** A non-interactive separator. Titles are supported in horizontal orientation only. */
export const Divider = React.forwardRef<
  HTMLHRElement | HTMLDivElement,
  DividerProps
>(function Divider(
  {
    orientation = "horizontal",
    variant = "solid",
    size = "medium",
    titlePlacement = "center",
    plain = false,
    children,
    className,
    titleClassName,
    titleStyle,
    ...props
  },
  ref,
) {
  const hasTitle =
    orientation === "horizontal" &&
    React.Children.toArray(children).some((child) => child !== "");
  const shared = {
    ...props,
    role: props.role ?? "separator",
    "aria-orientation": orientation,
    className: ["mt-divider", hasTitle && "mt-divider-with-title", className]
      .filter(Boolean)
      .join(" "),
    "data-orientation": orientation,
    "data-variant": variant,
    "data-size": size,
    "data-placement": titlePlacement,
    "data-plain": plain,
  } as const;
  if (!hasTitle)
    return <hr {...shared} ref={ref as React.Ref<HTMLHRElement>} />;
  return (
    <div {...shared} ref={ref as React.Ref<HTMLDivElement>}>
      <span
        className={["mt-divider-title", titleClassName]
          .filter(Boolean)
          .join(" ")}
        style={titleStyle}
      >
        {children}
      </span>
    </div>
  );
});

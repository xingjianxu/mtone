import React from "react";
import { cn } from "./basic";

export interface SettingRowControlProps {
  "aria-labelledby": string;
  "aria-describedby"?: string;
}

export interface SettingRowProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title" | "children"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  shortcut?: React.ReactNode;
  control: React.ReactNode | ((attributes: SettingRowControlProps) => React.ReactNode);
}

export type SettingRowGroupProps = React.ComponentPropsWithoutRef<"div">;

function SettingRowRoot({ title, description, shortcut, control, className, ...props }: SettingRowProps) {
  const id = React.useId();
  const hasDescription = React.Children.count(description) > 0 && description !== false && description !== "";
  const attributes = {
    "aria-labelledby": `${id}-label`,
    "aria-describedby": hasDescription ? `${id}-description` : undefined,
  };
  return <div {...props} className={cn("mt-setting-row", className)}>
    <div className="mt-setting-row-copy">
      <div className="mt-setting-row-heading">
        <span id={attributes["aria-labelledby"]} className="mt-setting-row-title">{title}</span>
        {shortcut != null && shortcut !== false && shortcut !== "" && <kbd className="mt-setting-row-shortcut">{shortcut}</kbd>}
      </div>
      {hasDescription && <div id={attributes["aria-describedby"]} className="mt-setting-row-description">{description}</div>}
    </div>
    <div className="mt-setting-row-control">
      {typeof control === "function" ? control(attributes) : control}
    </div>
  </div>;
}

function Group({ className, ...props }: SettingRowGroupProps) {
  return <div role="group" {...props} className={cn("mt-setting-row-group", className)} />;
}

export const SettingRow = Object.assign(SettingRowRoot, { Group });

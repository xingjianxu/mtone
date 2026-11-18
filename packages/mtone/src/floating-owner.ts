import * as React from "react";

/** Internal React ownership survives portals; DOM ancestry alone does not. */
export const FloatingOwnerContext = React.createContext<readonly string[]>([]);
export function isWithinFloatingOwner(element: Element | null, owner: string) {
  return (
    element
      ?.closest("[data-mt-floating-owners]")
      ?.getAttribute("data-mt-floating-owners")
      ?.split(" ")
      .includes(owner) ?? false
  );
}

import * as React from "react";
/** Internal form-control disabled state, including portaled descendants. */
export const FieldsetDisabledContext = React.createContext(false);
export function useFieldsetDisabled(disabled?: boolean): boolean {
  return React.useContext(FieldsetDisabledContext) || !!disabled;
}

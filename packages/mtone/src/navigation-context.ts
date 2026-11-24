import { createContext } from "react";

export const SidebarContext = createContext(false);
export const NavSubmenuSelectionContext = createContext<(() => void) | null>(null);

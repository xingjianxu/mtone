import type { ComponentType } from "react";

export interface OutlineEntry {
  id: string;
  title: string;
  children?: readonly OutlineEntry[];
}

export interface DocSection extends OutlineEntry {
  Demo?: ComponentType;
  playground?: boolean;
  source?: string;
  note?: string;
  relatedLink?: { href: string; label: string };
  children?: readonly DocSection[];
}

export function componentSectionHref(name: string, id: string) {
  const legacy = name === "Typography" ? /^typography-([a-z]+)$/.exec(id)?.[1] : undefined;
  const section = legacy ? legacy[0].toUpperCase() + legacy.slice(1) : id;
  return `#/components/${name}?section=${section}`;
}

export function focusDocSection(id: string) {
  const section = document.getElementById(id);
  if (!section) return;
  section.focus({ preventScroll: true });
  // Scroll after focusing so browser focus scrolling cannot replace the
  // explicit alignment, including on an initial mobile deep link.
  section.scrollIntoView?.({ block: "start", behavior: "instant" });
}

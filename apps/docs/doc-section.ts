import type { ComponentType } from "react";

export interface OutlineEntry {
  id: string;
  title: string;
  children?: readonly OutlineEntry[];
}

export interface DocSection extends OutlineEntry {
  Demo?: ComponentType;
  source?: string;
  note?: string;
  children?: readonly DocSection[];
}

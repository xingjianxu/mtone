import React from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  ContextMenu,
  Popover,
  Menubar,
  MtoneProvider,
  type MenuEntry,
} from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
const items: MenuEntry[] = [
  {
    type: "group",
    key: "group",
    label: "Files",
    children: [
      { key: "before", label: "Before" },
      {
        key: "parent",
        label: "Parent",
        children: [
          {
            key: "nested",
            label: "Nested",
            children: [{ key: "leaf", label: "Leaf" }],
          },
          { key: "nested-after", label: "Nested after" },
        ],
      },
      { key: "after", label: "After" },
    ],
  },
  { key: "group-boundary", label: "Group boundary" },
  { type: "divider", key: "divider" },
  { key: "boundary", label: "Boundary" },
  { type: "radio-group", key: "sort", label: "Sort", children: [
    { key: "ascending", label: "Ascending" }, { key: "descending", label: "Descending" },
  ] },
  { type: "checkbox", key: "check", label: "Check" },
  { type: "checkbox", key: "check-next", label: "Check next" },
];
const kind = new URLSearchParams(location.search).get("kind");
createRoot(document.getElementById("root")!).render(
  <MtoneProvider>
    <main style={{ padding: 32 }}>
      {kind === "menubar" ? (
        <Menubar menus={[{ key: "actions", label: "Actions", items }]} />
      ) : kind === "context" ? (
        <ContextMenu items={items}>
          <button>Actions</button>
        </ContextMenu>
      ) : (
        <Popover.Menu trigger={<Button>Actions</Button>} items={items} />
      )}
      <button style={{ position: "fixed", left: 800, top: 550 }}>Outside</button>
    </main>
  </MtoneProvider>,
);

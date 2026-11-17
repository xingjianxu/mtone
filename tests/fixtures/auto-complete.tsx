import React from "react";
import { createRoot } from "react-dom/client";
import { AutoComplete } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
createRoot(document.getElementById("root")!).render(
  <main style={{ maxWidth: 400, margin: 16 }}>
    <AutoComplete
      aria-label="Query"
      options={[
        { value: "alice", label: "Alice" },
        { value: "blocked", disabled: true },
        { value: "bob", label: "Bob" },
      ]}
      allowClear
      filterOption={false}
    />
    <button>After</button>
    <AutoComplete
      aria-label="Grouped"
      options={[
        {
          label: "People",
          options: [
            { value: "one", label: "Very long suggestion content ".repeat(8) },
          ],
        },
      ]}
    />
  </main>,
);

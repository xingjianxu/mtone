import React from "react";
import { createRoot } from "react-dom/client";
import { Select } from "../../packages/mtone/src/interactive";
import { MtoneProvider } from "../../packages/mtone/src/basic";
import "../../packages/mtone/dist/styles.css";
const text =
  "A very long selected option that must not push the dropdown arrow outside the trigger";
createRoot(document.getElementById("root")!).render(
  <>
    <style>{`.case .mt-select { width: var(--width); min-width: 0; box-sizing: border-box; } .case { margin: 12px; } .case .tall { width: 200px; height: 48px; font-size: 24px; }`}</style>
    {(["compact", "comfortable"] as const).map((density) => (
      <MtoneProvider key={density} density={density}>
        {[100, 160, 320, 640].map((width) => (
          <div
            className="case"
            key={width}
            style={{ "--width": `${width}px` } as React.CSSProperties}
          >
            <Select
              className="sample"
              label={`${density}-${width}`}
              defaultValue="long"
              options={[
                { value: "long", label: text },
                { value: "short", label: "Short" },
              ]}
            />
          </div>
        ))}
        <div className="case">
          <Select
            className="tall"
            label={`${density}-tall`}
            options={[
              {
                value: "zh",
                label: "较长的中文选项内容用于验证箭头不会被挤压",
              },
            ]}
            defaultValue="zh"
          />
        </div>
        <div className="case">
          <Select
            label={`${density}-disabled`}
            disabled
            options={[]}
            placeholder="Choose"
          />
        </div>
        <div className="case">
          <Select
            label={`${density}-placeholder`}
            options={[{ value: "a", label: "Alpha" }]}
            placeholder={text}
          />
        </div>
      </MtoneProvider>
    ))}
  </>,
);

import React from "react";
import { createRoot } from "react-dom/client";
import { Select, MultiSelect, Checkbox } from "../../packages/mtone/src/interactive";
import { DatePicker } from "../../packages/mtone/src/data";
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
        <div className={`case multi-${density}`} style={{ width: 250 }}>
          <MultiSelect label={`${density}-multi`} options={[{value:"a",label:"Alpha"},{value:"b",label:"Beta"},{value:"c",label:"Disabled",disabled:true}]} defaultValue={["a"]} />
          <Checkbox label={`${density}-check`} defaultChecked />
          <Checkbox label={`${density}-mixed`} indeterminate />
        </div>
        <div className="case"><MultiSelect label={`${density}-multi-disabled`} options={[]} disabled /></div>
        <div className={`case date-${density}`} style={{ width: 250 }}><DatePicker label={`${density}-date`} min="2026-01-01" max="2026-12-31" defaultValue="2026-02-01" /></div>
        <div className={`case date-disabled-${density}`} style={{ width: 180 }}><DatePicker label={`${density}-date-disabled`} disabled /></div>
      </MtoneProvider>
    ))}
  </>,
);

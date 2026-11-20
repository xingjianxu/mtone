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
    {(["light", "dark"] as const).map((theme) => (
      <MtoneProvider key={theme} theme={theme}>
        {[100, 160, 320, 640].map((width) => (
          <div
            className="case"
            key={width}
            style={{ "--width": `${width}px` } as React.CSSProperties}
          >
            <Select
              className="sample"
              label={`${theme}-${width}`}
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
            label={`${theme}-tall`}
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
            label={`${theme}-disabled`}
            disabled
            options={[]}
            placeholder="Choose"
          />
        </div>
        <div className="case">
          <Select
            label={`${theme}-placeholder`}
            options={[{ value: "a", label: "Alpha" }]}
            placeholder={text}
          />
        </div>
        <div className={`case multi-${theme}`} style={{ width: 250 }}>
          <MultiSelect label={`${theme}-multi`} options={[{value:"a",label:"Alpha"},{value:"b",label:"Beta"},{value:"c",label:"Disabled",disabled:true}]} defaultValue={["a"]} />
          <Checkbox label={`${theme}-check`} defaultChecked />
          <Checkbox label={`${theme}-mixed`} indeterminate />
        </div>
        <div className="case"><MultiSelect label={`${theme}-multi-disabled`} options={[]} disabled /></div>
        <div className={`case date-${theme}`} style={{ width: 250 }}><DatePicker label={`${theme}-date`} min="2026-01-01" max="2026-12-31" defaultValue="2026-02-01" /></div>
        <div className={`case date-disabled-${theme}`} style={{ width: 180 }}><DatePicker label={`${theme}-date-disabled`} disabled /></div>
      </MtoneProvider>
    ))}
  </>,
);
